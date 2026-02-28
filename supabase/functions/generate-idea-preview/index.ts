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

const SYSTEM_PROMPT = `You are an expert UI/UX prototyper who builds FULLY FUNCTIONAL, multi-screen interactive prototypes. Your prototypes feel like real applications — users can click through complete workflows, fill out forms, see data change, and experience the full flow from start to finish.

CRITICAL — INTERACTIVITY IS THE #1 PRIORITY:
Your prototype MUST be a working application, not a static mockup. Every button must do something. Every form must submit. Every workflow must flow from step 1 through completion. The user should be able to click through the ENTIRE experience as if it were a real app.

TECHNICAL REQUIREMENTS:
1. Output a SINGLE, complete HTML file starting with <!DOCTYPE html>
2. ALL CSS in a <style> tag in the <head>
3. ALL JavaScript in a <script> tag before </body>
4. ZERO external dependencies — no CDN links, no imports, fully self-contained and offline-capable
5. Vanilla HTML, CSS, and JavaScript only — no frameworks

HOW TO BUILD INTERACTIVITY:
- Use JavaScript to manage APPLICATION STATE — maintain a state object that tracks the current screen, form data, selections, and progress
- Build a SCREEN/VIEW SYSTEM — create multiple views (divs) and show/hide them based on navigation. Use a simple router pattern: each "page" is a div, and navigation functions swap which one is visible
- EVERY button must have an onclick handler that either navigates to another screen, updates state, opens a modal, or triggers a visible change
- Forms must COLLECT input values and DISPLAY them on the next screen (e.g., a review/confirmation step that shows what the user entered)
- Include REALISTIC MULTI-STEP WORKFLOWS: Step 1 → Step 2 → Step 3 → Confirmation → Success, with a progress indicator showing where the user is
- Add DYNAMIC DATA: tables that can be sorted/filtered, lists where items can be added/removed, counters that update
- Show FEEDBACK for every action: success messages, loading states, confirmation dialogs, toast notifications
- Include NAVIGATION: a sidebar or tab bar that lets users move between different sections of the app

WORKFLOW PATTERNS TO USE (pick what fits the idea):
- Multi-step form wizard with progress bar, back/next buttons, and validation
- Dashboard with clickable cards that drill down into detail views
- List/table view → detail view → edit view → save confirmation
- Request/approval workflow: submit → review → approve/reject → notification
- Settings panel with toggleable options that persist visually

DESIGN:
- Professional SaaS look: navy (#202735) primary, orange (#dd4124) accent, clean whites and grays
- Rounded corners (8-12px), soft box shadows, generous padding
- System font stack: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
- Clear visual hierarchy with consistent spacing (8px grid)
- Status badges, progress bars, and icons using Unicode symbols
- Smooth CSS transitions on all interactive elements (0.2s ease)
- Responsive layout that works from 400px to 1200px width

SAMPLE DATA:
Include realistic banking/business data — real-sounding names, plausible dollar amounts, realistic dates, department names, status values. Make it feel like a populated production app, not lorem ipsum.

OUTPUT:
Return ONLY the HTML file. No explanations, no code fences, no commentary. Start with <!DOCTYPE html> and end with </html>.`;

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

    const userMessage = `Title: ${title}\n\nDescription: ${description || "No additional description provided."}\n\nBuild a FULLY INTERACTIVE prototype where every button works, every form submits, and the user can click through the COMPLETE workflow from start to finish. Include multiple screens/views with navigation between them. This should feel like a working app demo, not a static mockup.`;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 32000,
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
