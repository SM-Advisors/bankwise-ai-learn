import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * Embed Chunks — Generates OpenAI embeddings for lesson content chunks.
 *
 * Reads all chunks (or a filtered set) from lesson_content_chunks,
 * generates embeddings via OpenAI text-embedding-3-small,
 * and writes them back to the embedding column.
 *
 * Usage:
 *   POST { }                           — Embed all chunks missing embeddings
 *   POST { lessonId: "1" }             — Embed chunks for a specific lesson
 *   POST { forceReembed: true }        — Re-embed all chunks (even those with existing embeddings)
 */

const OPENAI_EMBEDDING_MODEL = "text-embedding-3-small";
const EMBEDDING_DIMENSIONS = 1536;
const BATCH_SIZE = 50; // OpenAI supports up to 2048 inputs per request

interface ChunkRow {
  id: string;
  text: string;
  lesson_id: string;
  module_id: string | null;
}

async function generateEmbeddings(
  texts: string[],
  apiKey: string
): Promise<number[][]> {
  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENAI_EMBEDDING_MODEL,
      input: texts,
      dimensions: EMBEDDING_DIMENSIONS,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `OpenAI Embedding API error ${response.status}: ${errorText}`
    );
  }

  const result = await response.json();
  // OpenAI returns embeddings sorted by index
  return result.data
    .sort((a: any, b: any) => a.index - b.index)
    .map((item: any) => item.embedding);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error(
        "OPENAI_API_KEY is not configured. Add it to your Supabase edge function secrets."
      );
    }

    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!serviceRoleKey) {
      throw new Error("SUPABASE_SERVICE_ROLE_KEY is required");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const body = await req.json().catch(() => ({}));
    const { lessonId, forceReembed = false } = body;

    // Build query for chunks to embed
    let query = supabase
      .from("lesson_content_chunks")
      .select("id, text, lesson_id, module_id")
      .order("lesson_id", { ascending: true })
      .order("chunk_index", { ascending: true });

    if (lessonId) {
      query = query.eq("lesson_id", String(lessonId));
    }

    if (!forceReembed) {
      query = query.is("embedding", null);
    }

    const { data: chunks, error: fetchError } = await query;

    if (fetchError) {
      throw new Error(`Failed to fetch chunks: ${fetchError.message}`);
    }

    if (!chunks || chunks.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No chunks need embedding",
          embedded: 0,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Embedding ${chunks.length} chunks...`);

    let totalEmbedded = 0;
    const errors: string[] = [];

    // Process in batches
    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE);
      const texts = batch.map((c: ChunkRow) => c.text);

      try {
        const embeddings = await generateEmbeddings(texts, OPENAI_API_KEY);

        // Update each chunk with its embedding
        for (let j = 0; j < batch.length; j++) {
          const { error: updateError } = await supabase
            .from("lesson_content_chunks")
            .update({ embedding: JSON.stringify(embeddings[j]) })
            .eq("id", batch[j].id);

          if (updateError) {
            errors.push(
              `Failed to update chunk ${batch[j].id}: ${updateError.message}`
            );
          } else {
            totalEmbedded++;
          }
        }

        console.log(
          `Batch ${Math.floor(i / BATCH_SIZE) + 1}: embedded ${batch.length} chunks`
        );
      } catch (batchError) {
        const msg =
          batchError instanceof Error
            ? batchError.message
            : "Unknown batch error";
        errors.push(
          `Batch ${Math.floor(i / BATCH_SIZE) + 1} failed: ${msg}`
        );
        console.error(`Batch error:`, msg);
      }

      // Small delay between batches to respect rate limits
      if (i + BATCH_SIZE < chunks.length) {
        await new Promise((r) => setTimeout(r, 200));
      }
    }

    return new Response(
      JSON.stringify({
        success: errors.length === 0,
        total: chunks.length,
        embedded: totalEmbedded,
        errors: errors.length > 0 ? errors : undefined,
        model: OPENAI_EMBEDDING_MODEL,
        dimensions: EMBEDDING_DIMENSIONS,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Embed chunks error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
