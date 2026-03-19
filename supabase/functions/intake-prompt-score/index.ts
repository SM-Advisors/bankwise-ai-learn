import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";
import { checkRateLimit } from "../_shared/rateLimiter.ts";
import { getIndustryContext } from "../_shared/industryContext.ts";

interface IntakePromptScoreRequest {
  prompt: string;
  microTask?: string;
  industrySlug?: string;
}

interface CriterionScores {
  taskClarity: number;           // 0–1
  contextProvision: number;      // 0–2
  audienceAwareness: number;     // 0–1
  constraintSetting: number;     // 0–2
  riskAwareness: number;         // 0–2
  iterationReadiness: number;    // 0–1
  professionalismSignals: number; // 0–1
}

interface IntakePromptScoreResponse {
  score: number;               // 0–10
  criteria: CriterionScores;
}

function buildSystemPrompt(microTask: string, industrySlug?: string): string {
  const industryCtx = getIndustryContext(industrySlug);
  return `You are a prompt quality assessor for a professional AI training program. You score prompts written by ${industryCtx.professionalLabel}s who are learning to use AI responsibly.

THE TASK THE LEARNER WAS GIVEN:
"${microTask}"

Score the prompt on these 7 criteria. Award partial credit where appropriate.

1. TASK CLARITY (0–1 point)
   Does the prompt clearly state what the AI should produce? A prompt with no specifics scores 0. A prompt that describes the purpose, type of output, and desired outcome scores 1.

2. CONTEXT PROVISION (0–2 points)
   Does the prompt supply relevant background? Look for: mention of the professional context, the situation, the specific deliverable, or domain-specific details.
   0 = no context, 1 = minimal (1–2 elements present), 2 = rich context (3+ elements present).

3. AUDIENCE AWARENESS (0–1 point)
   Does the prompt indicate who the output is for and adjust tone accordingly? Look for: mention of the recipient, desired tone, or awareness of the communication context. Score 1 if present, 0 if absent.

4. CONSTRAINT SETTING (0–2 points)
   Does the prompt set boundaries on the output? Look for: tone guidance, length constraints, what to include or exclude, formatting instructions, or structural direction.
   0 = no constraints, 1 = 1–2 constraints mentioned, 2 = 3 or more constraints.

5. RISK AWARENESS (0–2 points)
   Does the prompt show awareness of professional risks? Look for: instructions to mark as draft/for review, avoid binding commitments, maintain compliance, exclude sensitive data, or flag content as preliminary.
   0 = no risk awareness, 1 = some awareness (1 element), 2 = strong awareness (2+ elements).

6. ITERATION READINESS (0–1 point)
   Does the prompt show awareness that AI output needs refinement? Look for: calling it a "draft", including placeholders, requesting a format that invites editing, or explicitly mentioning revision. Score 1 if present, 0 if absent.

7. PROFESSIONALISM SIGNALS (0–1 point)
   Does the prompt demonstrate effort and sophistication? Very short prompts (under ~120 characters) with no structure score 0. Prompts showing deliberate structure, multiple sentences, or organized instructions score 1.

RESPONSE FORMAT: Return ONLY valid JSON with no markdown, no code fences, no explanation text:
{
  "score": <integer 0–10, sum of all criterion scores>,
  "criteria": {
    "taskClarity": <0 or 1>,
    "contextProvision": <0, 1, or 2>,
    "audienceAwareness": <0 or 1>,
    "constraintSetting": <0, 1, or 2>,
    "riskAwareness": <0, 1, or 2>,
    "iterationReadiness": <0 or 1>,
    "professionalismSignals": <0 or 1>
  }
}`;
}

const EMPTY_CRITERIA: CriterionScores = {
  taskClarity: 0,
  contextProvision: 0,
  audienceAwareness: 0,
  constraintSetting: 0,
  riskAwareness: 0,
  iterationReadiness: 0,
  professionalismSignals: 0,
};

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get("origin"));

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not configured");
    }

    // ── Auth + rate limiting ──────────────────────────────────────────────
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) {
      return new Response(
        JSON.stringify({ error: "Missing authorization token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    const { data: { user } } = await supabaseAdmin.auth.getUser(token);
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const rateCheck = await checkRateLimit(supabaseUrl, serviceRoleKey, user.id, "intake-prompt-score");
    if (!rateCheck.allowed) {
      return new Response(
        JSON.stringify({ error: rateCheck.reason }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body: IntakePromptScoreRequest = await req.json();
    const prompt = (body.prompt || "").trim();
    const defaultMicroTask = getIndustryContext(body.industrySlug).onboardingMicroTask;
    const microTask = body.microTask || defaultMicroTask;

    // Too short to score — return 0 without calling LLM
    if (prompt.length < 15) {
      return new Response(
        JSON.stringify({ score: 0, criteria: EMPTY_CRITERIA } satisfies IntakePromptScoreResponse),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 300,
        system: buildSystemPrompt(microTask, body.industrySlug),
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!claudeRes.ok) {
      const errText = await claudeRes.text();
      console.error("Anthropic API error:", claudeRes.status, errText);
      throw new Error(`Anthropic API returned ${claudeRes.status}`);
    }

    const claudeData = await claudeRes.json();
    const responseText: string = claudeData.content?.[0]?.text ?? "";

    // Extract JSON object from response (tolerant of any surrounding whitespace)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON found in Claude response:", responseText);
      throw new Error("Claude response did not contain JSON");
    }

    const parsed: IntakePromptScoreResponse = JSON.parse(jsonMatch[0]);

    // Clamp score to valid range and ensure integer
    const score = Math.max(0, Math.min(10, Math.round(parsed.score ?? 0)));

    return new Response(
      JSON.stringify({ score, criteria: parsed.criteria ?? EMPTY_CRITERIA } satisfies IntakePromptScoreResponse),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );

  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("intake-prompt-score error:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
