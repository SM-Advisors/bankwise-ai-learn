import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";
import { checkRateLimit } from "../_shared/rateLimiter.ts";
import { getIndustryContext } from "../_shared/industryContext.ts";



interface Message {
  role: "user" | "assistant";
  content: string;
}

interface PracticeChatRequest {
  messages: Message[];
  moduleTitle: string;
  scenario: string;
  sessionNumber?: number;
  industrySlug?: string;
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get("origin"));
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // ── Auth identity + rate limiting ─────────────────────────────────────────
  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");
  let userId: string | null = null;
  if (token) {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: { user } } = await supabaseAdmin.auth.getUser(token);
    userId = user?.id ?? null;
  }
  if (userId) {
    const rateCheck = await checkRateLimit(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      userId,
      "practice_chat",
    );
    if (!rateCheck.allowed) {
      return new Response(
        JSON.stringify({ error: rateCheck.reason || "Rate limit exceeded. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
  }

  try {
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not configured");
    }

    const { messages, moduleTitle, scenario, sessionNumber, industrySlug }: PracticeChatRequest = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "messages array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const industryCtx = getIndustryContext(industrySlug);

    const systemPrompt = `You are an AI assistant being used by a ${industryCtx.professionalLabel} as part of their day-to-day work. You are NOT a coach or tutor — you are the actual AI tool they are practicing with.

## YOUR ROLE
You are a general-purpose AI assistant (like ChatGPT or Claude) that a professional is using at their desk. Respond naturally and helpfully to whatever they ask.

## SCENARIO CONTEXT
The user is working on: "${moduleTitle}"
${scenario ? `\nSituation: ${scenario}` : ""}

## CRITICAL BEHAVIOR RULES

1. MIRROR PROMPT QUALITY: The quality of your response should directly reflect the quality of their prompt.
   - Vague prompt → Give a generic, surface-level response (so they learn specificity matters)
   - Specific prompt with clear context → Give a detailed, tailored response (so they see the payoff)
   - Prompt with output format specified → Match that format exactly
   - Prompt missing key details → Respond but note what you'd need to do better

2. ACT LIKE A REAL AI TOOL:
   - Respond as a helpful AI assistant would in a real work scenario
   - Do NOT mention that this is a training exercise
   - Do NOT coach them on prompt technique (that's someone else's job)
   - Do NOT break the fourth wall or reference "the module" or "the exercise"
   - If they ask you something outside the scenario, respond naturally

3. ${industryCtx.realismInstructions}

4. RESPONSE LENGTH:
   - Match response length to what a real AI tool would provide
   - Short prompts get shorter responses
   - Detailed requests get detailed responses
   - Don't pad responses — be as concise as the task demands

5. BE HONEST ABOUT LIMITATIONS:
   - If they ask for something you can't do (access real systems, look up real data), say so naturally
   - Suggest what information they'd need to provide for you to help`;

    const claudeMessages = messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 1500,
        system: systemPrompt,
        messages: claudeMessages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Claude API error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error(`Claude API error: ${response.status}`);
    }

    const claudeResponse = await response.json();
    const reply = claudeResponse.content?.[0]?.text || "I'd be happy to help. Could you provide more details about what you need?";

    return new Response(
      JSON.stringify({ reply }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Practice chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
