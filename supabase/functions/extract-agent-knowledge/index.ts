import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import JSZip from "https://esm.sh/jszip@3.10.1";
import { getCorsHeaders } from "../_shared/cors.ts";

// ─── extract-agent-knowledge ─────────────────────────────────────────────────
//
// Edge function called by authenticated (non-admin) users to extract text from
// an uploaded file (PDF, DOCX, TXT, MD) for use in the Agent Studio knowledge
// base. File is processed in-memory — no Supabase Storage required.

/** Strip OOXML tags and normalise whitespace from a word/document.xml string */
function stripXml(xml: string): string {
  return xml
    .replace(/<w:p[^>]*\/>/gi, "\n")
    .replace(/<\/w:p>/gi, "\n")
    .replace(/<w:tab\/>/gi, "\t")
    .replace(/<w:br[^>]*\/>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function extractDocxText(arrayBuffer: ArrayBuffer): Promise<string> {
  const zip = new JSZip();
  await zip.loadAsync(arrayBuffer);
  const docXml = zip.file("word/document.xml");
  if (!docXml) throw new Error("Invalid DOCX: missing word/document.xml");
  const xml = await docXml.async("string");
  return stripXml(xml);
}

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    // ── Auth ─────────────────────────────────────────────────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Missing authorization" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) return json({ error: "Unauthorized" }, 401);

    // ── Parse uploaded file ───────────────────────────────────────────────────
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return json({ error: "No file provided" }, 400);

    const fileName = file.name;
    const ext = fileName.toLowerCase().split(".").pop() || "";
    const arrayBuffer = await file.arrayBuffer();

    let extractedText = "";

    if (ext === "txt" || ext === "md" || ext === "csv") {
      // Plain text files — decode directly in Deno
      extractedText = new TextDecoder().decode(arrayBuffer);
    } else if (ext === "docx") {
      extractedText = await extractDocxText(arrayBuffer);
    } else if (ext === "pdf") {
      const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
      if (!lovableApiKey) return json({ error: "AI service not configured" }, 500);

      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce((d, b) => d + String.fromCharCode(b), "")
      );

      const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content:
                "Extract ALL text from this PDF document. Output only the extracted plain text with line breaks preserved. Do not summarise or omit anything.",
            },
            {
              role: "user",
              content: [
                { type: "text", text: "Extract all text from this document:" },
                { type: "image_url", image_url: { url: `data:application/pdf;base64,${base64}` } },
              ],
            },
          ],
          max_tokens: 8000,
        }),
      });

      if (!aiRes.ok) {
        const status = aiRes.status;
        if (status === 429) return json({ error: "Rate limit reached. Please try again shortly." }, 429);
        return json({ error: "Failed to process PDF. Try a .txt or .docx file instead." }, 500);
      }

      const aiResult = await aiRes.json();
      extractedText = aiResult.choices?.[0]?.message?.content || "";
    } else {
      return json(
        { error: `Unsupported file type: .${ext}. Supported: .pdf, .docx, .txt, .md` },
        400
      );
    }

    if (!extractedText.trim()) {
      return json({ error: "No text could be extracted from the file" }, 422);
    }

    // Infer a human-readable title from the file name
    const inferredTitle = fileName
      .replace(/\.[^.]+$/, "")
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (l: string) => l.toUpperCase());

    return json({ content: extractedText.trim(), title: inferredTitle });
  } catch (err) {
    console.error("extract-agent-knowledge error:", err);
    return json({ error: err instanceof Error ? err.message : "Unknown error" }, 500);
  }
});
