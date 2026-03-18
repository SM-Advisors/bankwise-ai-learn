import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import JSZip from "https://esm.sh/jszip@3.10.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/** Strip XML tags and collapse whitespace */
function stripXml(xml: string): string {
  return xml
    .replace(/<w:p[^>]*\/>/gi, "\n")          // self-closing paragraphs
    .replace(/<\/w:p>/gi, "\n")                // paragraph ends
    .replace(/<w:tab\/>/gi, "\t")              // tabs
    .replace(/<w:br[^>]*\/>/gi, "\n")          // line breaks
    .replace(/<[^>]+>/g, "")                   // all other tags
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")               // collapse blank lines
    .trim();
}

/** Extract raw text from a DOCX ArrayBuffer */
async function extractDocxText(arrayBuffer: ArrayBuffer): Promise<string> {
  const zip = new JSZip();
  await zip.loadAsync(arrayBuffer);

  const docXml = zip.file("word/document.xml");
  if (!docXml) throw new Error("Invalid DOCX: missing word/document.xml");

  const xml = await docXml.async("string");
  return stripXml(xml);
}

async function verifyAdmin(authHeader: string, supabaseUrl: string, supabaseKey: string) {
  const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user }, error: authError } = await userClient.auth.getUser();
  if (authError || !user) return null;

  const adminClient = createClient(supabaseUrl, supabaseKey);
  const { data: roleData } = await adminClient
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .single();

  return roleData ? { user, adminClient } : null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!lovableApiKey) {
      return new Response(JSON.stringify({ error: "AI service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminResult = await verifyAdmin(authHeader, supabaseUrl, supabaseKey);
    if (!adminResult) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { adminClient } = adminResult;

    const { file_path, file_name } = await req.json();
    if (!file_path) {
      return new Response(JSON.stringify({ error: "file_path is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Download the file from storage
    const { data: fileData, error: downloadError } = await adminClient.storage
      .from("policy-documents")
      .download(file_path);

    if (downloadError || !fileData) {
      console.error("Download error:", downloadError);
      return new Response(JSON.stringify({ error: "Failed to download file" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const arrayBuffer = await fileData.arrayBuffer();
    const extension = (file_name || file_path).toLowerCase().split(".").pop();

    let aiMessages: Array<{ role: string; content: string | Array<{ type: string; text?: string; image_url?: { url: string } }> }>;

    if (extension === "pdf") {
      // PDF: send as base64 to Gemini vision
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
      );
      aiMessages = [
        {
          role: "system",
          content: `You are a document extraction specialist. Extract ALL text content from the uploaded document and convert it to well-structured Markdown.\n\nRules:\n- Preserve ALL content — do not summarize or omit anything\n- Convert headings, lists, tables, and formatting to proper Markdown\n- Maintain the document's original structure and hierarchy\n- For tables, use Markdown table syntax\n- Remove page numbers, headers/footers, or watermarks\n- Output ONLY the extracted Markdown content`,
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Extract ALL text content from this PDF and convert it to well-structured Markdown. Output ONLY the Markdown content." },
            { type: "image_url", image_url: { url: `data:application/pdf;base64,${base64}` } },
          ],
        },
      ];
    } else {
      // DOCX/DOC: extract text first, then ask AI to format as Markdown
      let rawText: string;
      try {
        rawText = await extractDocxText(arrayBuffer);
      } catch (e) {
        console.error("DOCX extraction error:", e);
        return new Response(JSON.stringify({ error: "Failed to extract text from document. Ensure it is a valid .docx file." }), {
          status: 422,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (!rawText.trim()) {
        return new Response(JSON.stringify({ error: "No text could be extracted from the document" }), {
          status: 422,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      aiMessages = [
        {
          role: "system",
          content: `You are a document formatting specialist. The user will provide raw text extracted from a Word document. Convert it to well-structured Markdown.\n\nRules:\n- Preserve ALL content — do not summarize or omit anything\n- Infer headings, lists, tables from the structure\n- Use proper Markdown formatting (##, -, |, etc.)\n- Output ONLY the formatted Markdown content`,
        },
        {
          role: "user",
          content: `Convert the following raw document text to well-structured Markdown. Output ONLY the Markdown:\n\n${rawText}`,
        },
      ];
    }

    // Call AI gateway
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3",
        messages: aiMessages,
        max_tokens: 16000,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);

      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "Failed to process document with AI" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResult = await aiResponse.json();
    const extractedContent = aiResult.choices?.[0]?.message?.content || "";

    if (!extractedContent.trim()) {
      return new Response(JSON.stringify({ error: "No text could be extracted from the document" }), {
        status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate summary
    const summaryResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3",
        messages: [
          { role: "system", content: "Write a concise 1-2 sentence summary of this policy document. Be factual and direct." },
          { role: "user", content: extractedContent.substring(0, 4000) },
        ],
        max_tokens: 200,
      }),
    });

    let summary = "";
    if (summaryResponse.ok) {
      const summaryResult = await summaryResponse.json();
      summary = summaryResult.choices?.[0]?.message?.content || "";
    }

    const inferredTitle = (file_name || file_path)
      .replace(/\.[^.]+$/, "")
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (l: string) => l.toUpperCase());

    return new Response(
      JSON.stringify({ content: extractedContent, summary, inferred_title: inferredTitle, file_path }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("parse-policy-document error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
