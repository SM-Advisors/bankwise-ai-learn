import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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

    // Verify the user is an admin
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const adminClient = createClient(supabaseUrl, supabaseKey);
    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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

    // Convert file to base64
    const arrayBuffer = await fileData.arrayBuffer();
    const base64 = btoa(
      new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
    );

    // Determine MIME type
    const extension = (file_name || file_path).toLowerCase().split(".").pop();
    let mimeType = "application/octet-stream";
    if (extension === "pdf") mimeType = "application/pdf";
    else if (extension === "docx") mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    else if (extension === "doc") mimeType = "application/msword";

    // Use Gemini to extract text from the document
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
            content: `You are a document extraction specialist. Your job is to extract ALL text content from the uploaded document and convert it to well-structured Markdown format.

Rules:
- Preserve ALL content — do not summarize or omit anything
- Convert headings, lists, tables, and formatting to proper Markdown
- Maintain the document's original structure and hierarchy
- For tables, use Markdown table syntax
- Remove any page numbers, headers/footers, or watermarks
- Do NOT add any commentary or explanation — output ONLY the extracted Markdown content`,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Extract ALL text content from this ${extension?.toUpperCase()} document and convert it to well-structured Markdown. Output ONLY the Markdown content, nothing else.`,
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${base64}`,
                },
              },
            ],
          },
        ],
        max_tokens: 16000,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);

      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: "Failed to process document with AI" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResult = await aiResponse.json();
    const extractedContent = aiResult.choices?.[0]?.message?.content || "";

    if (!extractedContent.trim()) {
      return new Response(JSON.stringify({ error: "No text could be extracted from the document" }), {
        status: 422,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Also generate a short summary
    const summaryResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: "Write a concise 1-2 sentence summary of this policy document. Be factual and direct.",
          },
          {
            role: "user",
            content: extractedContent.substring(0, 4000),
          },
        ],
        max_tokens: 200,
      }),
    });

    let summary = "";
    if (summaryResponse.ok) {
      const summaryResult = await summaryResponse.json();
      summary = summaryResult.choices?.[0]?.message?.content || "";
    }

    // Infer a title from the file name
    const inferredTitle = (file_name || file_path)
      .replace(/\.[^.]+$/, "") // remove extension
      .replace(/[-_]/g, " ") // replace dashes/underscores
      .replace(/\b\w/g, (l: string) => l.toUpperCase()); // title case

    return new Response(
      JSON.stringify({
        content: extractedContent,
        summary,
        inferred_title: inferredTitle,
        file_path,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("parse-policy-document error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
