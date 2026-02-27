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

const SYSTEM_PROMPT = `You are an expert UI/UX prototyper. Your job is to create a self-contained HTML prototype that demonstrates a software idea as a working, interactive UI.

REQUIREMENTS:
1. Output a SINGLE, complete HTML file starting with <!DOCTYPE html>
2. ALL CSS must be inline in a <style> tag in the <head>
3. ALL JavaScript must be inline in a <script> tag before </body>
4. Do NOT use any external CDN links, imports, or dependencies — the file must work completely offline
5. Do NOT use any frameworks (React, Vue, etc.) — use vanilla HTML, CSS, and JavaScript only
6. The prototype must be INTERACTIVE — buttons should work, forms should respond, data should display
7. Use modern CSS (flexbox, grid, variables, transitions) for a polished look
8. Use a clean, professional color scheme appropriate for a business/banking application
9. Include realistic placeholder data (names, dates, dollar amounts) that makes the prototype feel real
10. The UI should be responsive and look good at any width from 400px to 1200px
11. Include subtle animations/transitions for a polished feel (hover effects, smooth transitions)
12. Add a header/title bar that names the application
13. If the idea involves data, show a populated table or card grid with sample data
14. If the idea involves a process/workflow, show the steps with interactive state changes
15. If the idea involves a form, make the form functional with validation feedback

DESIGN PRINCIPLES:
- Clean, modern SaaS aesthetic with rounded corners and soft shadows
- Use a cohesive color palette (a professional blue primary + neutral grays)
- Generous whitespace and clear typography hierarchy using system fonts
- Include status indicators, badges, and icons using Unicode/emoji where helpful
- Make it feel like a real product, not a wireframe

OUTPUT FORMAT:
Return ONLY the HTML file. No explanations, no markdown code fences, no commentary before or after. Start with <!DOCTYPE html> and end with </html>.`;

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

    // ── Call Anthropic API ──────────────────────────────────────────────────
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) {
      await supabaseAdmin
        .from(targetTable)
        .update({ preview_status: "failed" })
        .eq("id", ideaId);
      throw new Error("ANTHROPIC_API_KEY is not configured");
    }

    const userMessage = `Title: ${title}\n\nDescription: ${description || "No additional description provided."}\n\nGenerate a complete, self-contained HTML file that demonstrates this idea as a working interactive prototype.`;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 16000,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Anthropic API error:", res.status, errText);
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
      throw new Error(`Anthropic API error: ${res.status}`);
    }

    const data = await res.json();
    const rawReply = data.content?.[0]?.text ?? "";

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
