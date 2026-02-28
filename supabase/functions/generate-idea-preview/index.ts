import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";
import { checkRateLimit } from "../_shared/rateLimiter.ts";

interface GeneratePreviewRequest {
  ideaId: string;
  title: string;
  description: string;
  table?: "user_ideas" | "executive_submissions"; // defaults to user_ideas
}

const SYSTEM_PROMPT = `You are an expert UI/UX prototyper. Create a self-contained HTML prototype.

RULES:
1. Output ONLY a complete HTML file starting with <!DOCTYPE html>, ending with </html>
2. ALL CSS inline in <style>, ALL JS inline in <script>. NO external CDN links
3. Use vanilla HTML/CSS/JS only. Make it INTERACTIVE with working buttons/forms
4. Use modern CSS (flexbox, grid, variables). Clean professional look with blue primary color
5. Include realistic placeholder data. Responsive from 400px-1200px
6. Keep it concise but functional — focus on the core idea
7. No markdown fences, no explanations — just the HTML`;

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get("origin"));
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // ── Auth ────────────────────────────────────────────────────────────────────
  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  let userId: string | null = null;
  if (token) {
    const { data: { user } } = await supabaseAdmin.auth.getUser(token);
    userId = user?.id ?? null;
  }
  if (!userId) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  // ── Rate limit (low limits — generation is expensive) ──────────────────────
  const rateCheck = await checkRateLimit(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    userId,
    "generate-idea-preview",
    { perMinute: 3, perDay: 30 },
  );
  if (!rateCheck.allowed) {
    return new Response(
      JSON.stringify({ error: rateCheck.reason || "Rate limit exceeded. Please try again later." }),
      { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  try {
    const { ideaId, title, description, table }: GeneratePreviewRequest = await req.json();
    const targetTable = table || "user_ideas";

    if (!ideaId || !title) {
      return new Response(
        JSON.stringify({ error: "ideaId and title are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // ── Mark as generating ──────────────────────────────────────────────────
    await supabaseAdmin
      .from(targetTable)
      .update({ preview_status: "generating" })
      .eq("id", ideaId);

    // ── Call Lovable AI Gateway ────────────────────────────────────────────
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      await supabaseAdmin
        .from(targetTable)
        .update({ preview_status: "failed" })
        .eq("id", ideaId);
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const userMessage = `Title: ${title}\n\nDescription: ${description || "No additional description provided."}\n\nGenerate a concise, self-contained HTML file prototype. Keep it under 200 lines of HTML. Focus on the core UI concept.`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        max_tokens: 4000,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("AI Gateway error:", res.status, errText);
      await supabaseAdmin
        .from(targetTable)
        .update({ preview_status: "failed" })
        .eq("id", ideaId);

      if (res.status === 429) {
        return new Response(
          JSON.stringify({ error: "AI rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      throw new Error(`AI Gateway error: ${res.status}`);
    }

    const data = await res.json();
    const rawReply = data.choices?.[0]?.message?.content ?? "";

    // ── Extract HTML ────────────────────────────────────────────────────────
    // Claude may wrap in ```html ... ``` or return it directly
    let html = rawReply.trim();
    const fencedMatch = html.match(/```(?:html)?\s*\n?([\s\S]*?)```/);
    if (fencedMatch) {
      html = fencedMatch[1].trim();
    }

    // Validate it looks like HTML
    if (!html.includes("<!DOCTYPE html>") && !html.includes("<html")) {
      console.error("Generated content does not appear to be valid HTML");
      await supabaseAdmin
        .from(targetTable)
        .update({ preview_status: "failed" })
        .eq("id", ideaId);
      return new Response(
        JSON.stringify({ error: "Generation produced invalid output. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Inject a Content-Security-Policy meta tag for additional iframe security
    html = html.replace(
      /<head>/i,
      `<head>\n<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data:;">`,
    );

    // ── Save to DB ──────────────────────────────────────────────────────────
    await supabaseAdmin
      .from(targetTable)
      .update({
        preview_html: html,
        preview_status: "generated",
        preview_generated_at: new Date().toISOString(),
      })
      .eq("id", ideaId);

    return new Response(
      JSON.stringify({ success: true, html }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Preview generation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
