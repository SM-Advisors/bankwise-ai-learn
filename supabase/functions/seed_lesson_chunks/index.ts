import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Lesson Chunk Seeder
 *
 * This edge function seeds the lesson_content_chunks table with content
 * derived from the training content structure. It takes structured lesson
 * content as input and creates properly chunked entries for RAG retrieval.
 *
 * Usage: POST with body { sessionId, modules: [...] }
 * Or POST with body { seedAll: true } to seed all sessions from embedded content
 */

interface ChunkInput {
  lesson_id: string;
  module_id: string;
  chunk_index: number;
  text: string;
  source: string;
  metadata: Record<string, unknown>;
}

// Embedded training content for all sessions — extracted from trainingContent.ts
// This allows the seeder to run independently without importing frontend code
function getAllSessionContent(): Record<number, { title: string; modules: Array<{
  id: string;
  title: string;
  type: string;
  content: {
    overview: string;
    keyPoints: string[];
    examples?: Array<{ title: string; good?: string; bad?: string; explanation: string }>;
    steps?: string[];
    practiceTask: {
      title: string;
      instructions: string;
      scenario: string;
      hints: string[];
      successCriteria: string[];
    };
  };
}> }> {
  // We accept the content as POST body instead of embedding it
  // This keeps the function lightweight and reusable
  return {};
}

function chunkModule(
  sessionId: number,
  module: {
    id: string;
    title: string;
    type: string;
    content: {
      overview: string;
      keyPoints: string[];
      examples?: Array<{ title: string; good?: string; bad?: string; explanation: string }>;
      steps?: string[];
      practiceTask: {
        title: string;
        instructions: string;
        scenario: string;
        hints: string[];
        successCriteria: string[];
      };
    };
  }
): ChunkInput[] {
  const chunks: ChunkInput[] = [];
  let chunkIndex = 0;

  // Chunk 1: Overview
  if (module.content.overview) {
    chunks.push({
      lesson_id: String(sessionId),
      module_id: module.id,
      chunk_index: chunkIndex++,
      text: `Module: ${module.title}\n\nOverview: ${module.content.overview}`,
      source: `Session ${sessionId} - ${module.title}`,
      metadata: { type: "overview", moduleType: module.type },
    });
  }

  // Chunk 2: Key Points (grouped as one chunk for coherence)
  if (module.content.keyPoints?.length > 0) {
    chunks.push({
      lesson_id: String(sessionId),
      module_id: module.id,
      chunk_index: chunkIndex++,
      text: `Key Points for "${module.title}":\n\n${module.content.keyPoints.map((kp, i) => `${i + 1}. ${kp}`).join("\n")}`,
      source: `Session ${sessionId} - ${module.title} - Key Points`,
      metadata: { type: "key_points", count: module.content.keyPoints.length },
    });
  }

  // Chunk 3+: Each example as its own chunk (for better retrieval)
  if (module.content.examples?.length) {
    for (const example of module.content.examples) {
      let exampleText = `Example: ${example.title}\n\n`;
      if (example.bad) exampleText += `Less Effective: ${example.bad}\n\n`;
      if (example.good) exampleText += `More Effective: ${example.good}\n\n`;
      exampleText += `Why: ${example.explanation}`;

      chunks.push({
        lesson_id: String(sessionId),
        module_id: module.id,
        chunk_index: chunkIndex++,
        text: exampleText,
        source: `Session ${sessionId} - ${module.title} - Example: ${example.title}`,
        metadata: { type: "example", exampleTitle: example.title },
      });
    }
  }

  // Chunk: Steps (if present)
  if (module.content.steps?.length) {
    chunks.push({
      lesson_id: String(sessionId),
      module_id: module.id,
      chunk_index: chunkIndex++,
      text: `Steps for "${module.title}":\n\n${module.content.steps.map((s, i) => `Step ${i + 1}: ${s}`).join("\n")}`,
      source: `Session ${sessionId} - ${module.title} - Steps`,
      metadata: { type: "steps", count: module.content.steps.length },
    });
  }

  // Chunk: Practice Task
  if (module.content.practiceTask) {
    const pt = module.content.practiceTask;
    chunks.push({
      lesson_id: String(sessionId),
      module_id: module.id,
      chunk_index: chunkIndex++,
      text: `Practice Task: ${pt.title}\n\nInstructions: ${pt.instructions}\n\nScenario: ${pt.scenario}\n\nSuccess Criteria:\n${pt.successCriteria.map((c, i) => `${i + 1}. ${c}`).join("\n")}`,
      source: `Session ${sessionId} - ${module.title} - Practice Task`,
      metadata: { type: "practice_task", hints: pt.hints },
    });
  }

  return chunks;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Use service role for writes (bypasses RLS)
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!serviceRoleKey) {
      throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for seeding");
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const body = await req.json();

    // Expect: { sessions: { [sessionId]: { title, modules: [...] } } }
    const { sessions } = body;

    if (!sessions || typeof sessions !== "object") {
      return new Response(
        JSON.stringify({ error: "Body must contain 'sessions' object with session content" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let totalChunks = 0;
    let totalModules = 0;
    const results: Record<string, { modules: number; chunks: number }> = {};

    for (const [sessionIdStr, sessionData] of Object.entries(sessions)) {
      const sessionId = parseInt(sessionIdStr);
      const session = sessionData as { title: string; modules: any[] };

      if (!session.modules || !Array.isArray(session.modules)) {
        continue;
      }

      // Delete existing chunks for this session (idempotent re-seed)
      await supabase
        .from("lesson_content_chunks")
        .delete()
        .eq("lesson_id", String(sessionId));

      const allChunks: ChunkInput[] = [];

      for (const mod of session.modules) {
        const moduleChunks = chunkModule(sessionId, mod);
        allChunks.push(...moduleChunks);
        totalModules++;
      }

      // Batch insert all chunks for this session
      if (allChunks.length > 0) {
        const { error } = await supabase
          .from("lesson_content_chunks")
          .insert(allChunks);

        if (error) {
          console.error(`Error inserting chunks for session ${sessionId}:`, error);
          throw error;
        }
      }

      totalChunks += allChunks.length;
      results[sessionIdStr] = {
        modules: session.modules.length,
        chunks: allChunks.length,
      };
    }

    return new Response(
      JSON.stringify({
        success: true,
        totalModules,
        totalChunks,
        sessions: results,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Seed lesson chunks error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
