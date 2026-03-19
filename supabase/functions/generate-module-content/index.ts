import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";
import { checkRateLimit } from "../_shared/rateLimiter.ts";

// ─── Types ──────────────────────────────────────────────────────────────────

interface GenerateRequest {
  orgId: string;
  industrySlug: string;
  departmentSlug: string;
  moduleId: string;
  /** Static pedagogy from trainingContent.ts */
  modulePedagogy: {
    title: string;
    learningObjectives: string[];
    learningOutcome: string;
    keyPoints: string[];
    overview: string;
    practiceTaskTitle: string;
    practiceTaskInstructions: string;
    successCriteria: string[];
  };
  /** From IndustryConfig */
  industryContext: {
    name: string;
    complianceContext: string;
    scenarioGenerationContext: string;
  };
  /** Department name for personalization */
  departmentName: string;
  /** Force regeneration (skip cache) */
  forceRegenerate?: boolean;
}

interface GeneratedContent {
  examples: {
    title: string;
    good: string;
    bad?: string;
    explanation: string;
  }[];
  practiceScenario: string;
  hints: string[];
  departmentScenarios: Record<string, {
    scenario: string;
    hints: string[];
  }>;
}

// ─── Handler ────────────────────────────────────────────────────────────────

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req.headers.get("origin"));

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");

    if (!anthropicKey) {
      throw new Error("ANTHROPIC_API_KEY is not configured");
    }

    // Authenticate the caller
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

    // ── Rate limiting ────────────────────────────────────────────────────────
    const rateCheck = await checkRateLimit(
      supabaseUrl, serviceRoleKey, user.id, "generate_module_content",
      { perMinute: 5, perDay: 30 },
    );
    if (!rateCheck.allowed) {
      return new Response(
        JSON.stringify({ error: rateCheck.reason, content: null }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body: GenerateRequest = await req.json();
    const {
      orgId,
      industrySlug,
      departmentSlug,
      moduleId,
      modulePedagogy,
      industryContext,
      departmentName,
      forceRegenerate,
    } = body;

    if (!orgId || !industrySlug || !departmentSlug || !moduleId || !modulePedagogy || !industryContext) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // ── Check cache ──────────────────────────────────────────────────────────

    if (!forceRegenerate) {
      const { data: cached } = await supabaseAdmin
        .from("generated_module_content")
        .select("content")
        .eq("org_id", orgId)
        .eq("department_slug", departmentSlug)
        .eq("module_id", moduleId)
        .maybeSingle();

      if (cached?.content && Object.keys(cached.content).length > 0) {
        return new Response(
          JSON.stringify({ content: cached.content, cached: true }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    // ── Generate content via Claude ──────────────────────────────────────────

    const systemPrompt = buildSystemPrompt(industryContext, departmentName);
    const userPrompt = buildUserPrompt(modulePedagogy, departmentSlug, departmentName);

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 4000,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Anthropic API error:", res.status, errText);
      if (res.status === 429) {
        return new Response(
          JSON.stringify({ error: "AI rate limit reached. Please try again shortly.", content: null }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      throw new Error(`Anthropic API error: ${res.status}`);
    }

    const apiData = await res.json();
    const rawText = apiData.content?.[0]?.text ?? "";

    // Parse the JSON response
    let generated: GeneratedContent;
    try {
      // Extract JSON from potential markdown code block wrapper
      const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, rawText];
      generated = JSON.parse(jsonMatch[1]!.trim());
    } catch (parseErr) {
      console.error("Failed to parse generated content:", parseErr, "Raw:", rawText.substring(0, 500));
      // Return empty content on parse failure — frontend falls back to static pedagogy
      return new Response(
        JSON.stringify({ content: null, cached: false, error: "Generation produced unparseable output" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // ── Write to cache ──────────────────────────────────────────────────────

    const { error: upsertError } = await supabaseAdmin
      .from("generated_module_content")
      .upsert(
        {
          org_id: orgId,
          industry_slug: industrySlug,
          department_slug: departmentSlug,
          module_id: moduleId,
          content: generated,
        },
        { onConflict: "org_id,department_slug,module_id" },
      );

    if (upsertError) {
      console.error("Cache write failed:", upsertError);
      // Non-fatal — still return the generated content
    }

    return new Response(
      JSON.stringify({ content: generated, cached: false }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("generate-module-content error:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message || "Internal error", content: null }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

// ─── Prompt Builders ────────────────────────────────────────────────────────

function buildSystemPrompt(
  industryContext: GenerateRequest["industryContext"],
  departmentName: string,
): string {
  return `You are an expert instructional designer creating industry-specific AI training content for the SMILE learning platform.

INDUSTRY: ${industryContext.name}
DEPARTMENT FOCUS: ${departmentName}

INDUSTRY CONTEXT:
${industryContext.scenarioGenerationContext}

COMPLIANCE CONTEXT:
${industryContext.complianceContext}

YOUR TASK:
Generate realistic, immediately useful training content that feels like it was written BY someone in this industry FOR someone in this industry. Every example, scenario, and hint must use real vocabulary, real workflows, and real artifacts from this industry and department.

RULES:
- Use actual industry terminology — no generic placeholders like "professional document" or "work task"
- Scenarios must describe realistic day-to-day situations, not theoretical exercises
- Good examples should be specific enough that a practitioner would recognize the workflow
- Bad examples should show common mistakes that people in this role actually make
- Hints should give actionable, department-specific guidance
- Never include actual PII, account numbers, or confidential data — use realistic but fictional details
- Content must be appropriate for the compliance context described above

OUTPUT FORMAT:
Return a single JSON object (no markdown wrapper, no explanation) with this exact structure:
{
  "examples": [
    {
      "title": "string — descriptive title for the example pair",
      "good": "string — a well-crafted prompt example",
      "bad": "string — a poorly-crafted prompt example (optional for some modules)",
      "explanation": "string — why the good example works and the bad one doesn't"
    }
  ],
  "practiceScenario": "string — a realistic practice scenario for this department",
  "hints": ["string — department-specific hint 1", "string — hint 2", "string — hint 3"],
  "departmentScenarios": {
    "Department Name": {
      "scenario": "string — scenario tailored to this specific department",
      "hints": ["hint 1", "hint 2", "hint 3"]
    }
  }
}`;
}

function buildUserPrompt(
  pedagogy: GenerateRequest["modulePedagogy"],
  departmentSlug: string,
  departmentName: string,
): string {
  return `Generate industry-specific content for this training module:

MODULE: ${pedagogy.title} (ID: will be used internally)
OVERVIEW: ${pedagogy.overview}

LEARNING OBJECTIVES:
${pedagogy.learningObjectives.map((o, i) => `${i + 1}. ${o}`).join("\n")}

LEARNING OUTCOME: ${pedagogy.learningOutcome}

KEY POINTS:
${pedagogy.keyPoints.map((p, i) => `${i + 1}. ${p}`).join("\n")}

PRACTICE TASK: ${pedagogy.practiceTaskTitle}
INSTRUCTIONS: ${pedagogy.practiceTaskInstructions}

SUCCESS CRITERIA:
${pedagogy.successCriteria.map((c, i) => `${i + 1}. ${c}`).join("\n")}

PRIMARY DEPARTMENT: ${departmentName} (slug: ${departmentSlug})

Generate:
1. 2-3 examples (good/bad prompt pairs with explanations) that are specific to this industry and department
2. A practice scenario tailored to the primary department
3. 3-4 hints specific to this department's workflows
4. Department scenarios for 3-5 different departments in this industry (include the primary department)

Return ONLY the JSON object — no markdown, no explanation.`;
}
