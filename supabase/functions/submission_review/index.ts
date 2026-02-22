import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface SubmissionReviewRequest {
  lessonId: string;
  moduleId?: string;
  submission: string;
  rubric?: string | Record<string, unknown>;
  learnerState?: {
    currentCardTitle?: string;
    attemptNumber?: number;
    progressSummary?: string;
  };
  userId?: string; // Optional fallback if auth not available
}

interface LessonChunk {
  id: string;
  text: string;
  source: string | null;
  metadata: Record<string, unknown>;
}

interface FeedbackResponse {
  feedback: {
    summary: string;
    strengths: string[];
    issues: string[];
    fixes: string[];
    next_steps: string[];
  };
}

// Normalize learning style from DB to standard format
function normalizeLearningStyle(dbStyle: string | null): string {
  const styleMap: Record<string, string> = {
    "example-based": "example_based",
    "hands-on": "hands_on",
    "explanation-based": "explanation_based",
    "logic-based": "logic_based",
  };
  return styleMap[dbStyle || ""] || "explanation_based";
}

// Get learning style instructions for feedback
function getFeedbackStyleInstructions(style: string): string {
  const instructions: Record<string, string> = {
    example_based: `FEEDBACK STYLE: Example-Based
- Include a concrete example of an improved version for each issue
- Show "before/after" comparisons where helpful
- Use banking-specific examples`,
    
    explanation_based: `FEEDBACK STYLE: Explanation-Based
- Explain WHY each strength works well
- Provide detailed reasoning for each issue
- Include step-by-step guidance in fixes`,
    
    logic_based: `FEEDBACK STYLE: Logic-Based
- Frame feedback as logical rules and principles
- Include verification criteria for each fix
- Reference underlying frameworks`,
    
    hands_on: `FEEDBACK STYLE: Hands-On
- Keep explanations minimal
- Focus on actionable next steps
- Provide a quick exercise to apply the feedback`,
  };
  return instructions[style] || instructions.explanation_based;
}

// Get proficiency level instructions for feedback (0-8 scale)
function getProficiencyFeedbackInstructions(level: number | null): string {
  const proficiency = level ?? 3; // Default to intermediate if not set
  
  if (proficiency <= 2) {
    return `AI PROFICIENCY: Beginner (Level ${proficiency}/8)
- Use simple language in all feedback
- Define any AI terms you mention
- Be extra encouraging and supportive
- Provide very specific, step-by-step fixes
- Avoid overwhelming with too many issues at once`;
  } else if (proficiency <= 5) {
    return `AI PROFICIENCY: Intermediate (Level ${proficiency}/8)
- Use moderate technical language
- Assume basic understanding of prompts and AI behavior
- Balance encouragement with constructive criticism
- Can reference common prompt patterns`;
  } else {
    return `AI PROFICIENCY: Advanced (Level ${proficiency}/8)
- Use precise technical language
- Focus on nuance and optimization opportunities
- Can reference advanced techniques in suggestions
- Be more direct and concise in feedback
- Challenge with higher-level improvements`;
  }
}

interface BankPolicy {
  id: string;
  title: string;
  content: string;
  summary: string | null;
  policy_type: string;
}

// Retrieve lesson content chunks from database
async function retrieveLessonContext(
  supabase: any,
  params: { lessonId: string; moduleId?: string; query: string; topK?: number }
): Promise<LessonChunk[]> {
  const { lessonId, moduleId, topK = 6 } = params;

  let query = supabase
    .from("lesson_content_chunks")
    .select("id, text, source, metadata")
    .eq("lesson_id", lessonId)
    .order("chunk_index", { ascending: true })
    .limit(topK);

  if (moduleId) {
    query = query.eq("module_id", moduleId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error retrieving lesson chunks:", error);
    return [];
  }

  return data || [];
}

// Retrieve active bank policies (uses service role to bypass RLS since policies are institutional data)
async function retrieveBankPolicies(supabaseUrl: string): Promise<BankPolicy[]> {
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!serviceRoleKey) {
    console.error("SUPABASE_SERVICE_ROLE_KEY not available for policy retrieval");
    return [];
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey);
  const { data, error } = await adminClient
    .from("bank_policies")
    .select("id, title, content, summary, policy_type")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Error retrieving bank policies:", error);
    return [];
  }

  console.log(`Retrieved ${data?.length || 0} bank policies`);
  return data || [];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not configured");
    }

    const requestBody: SubmissionReviewRequest = await req.json();
    const { lessonId, moduleId, submission, rubric, learnerState, userId: bodyUserId } = requestBody;

    if (!lessonId || !submission) {
      return new Response(
        JSON.stringify({ error: "lessonId and submission are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const authHeader = req.headers.get("Authorization");
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: authHeader ? { Authorization: authHeader } : {} },
    });

    // Get user ID from auth (preferred) or body (fallback)
    let userId: string | null = null;

    if (authHeader?.startsWith("Bearer ")) {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (!authError && authUser?.id) {
        userId = authUser.id;
      }
    }

    if (!userId && bodyUserId) {
      userId = bodyUserId;
    }

    // Fetch learning style and AI proficiency from user_profiles
    let learningStyle = "explanation_based";
    let aiProficiencyLevel: number | null = null;
    if (userId) {
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("learning_style, ai_proficiency_level")
        .eq("user_id", userId)
        .single();

      if (profile?.learning_style) {
        learningStyle = normalizeLearningStyle(profile.learning_style);
      }
      if (profile?.ai_proficiency_level !== undefined) {
        aiProficiencyLevel = profile.ai_proficiency_level;
      }
    }

    // Build RAG query from submission + rubric + card title
    const rubricText = typeof rubric === "string" ? rubric : JSON.stringify(rubric || {});
    const ragQuery = `${learnerState?.currentCardTitle || ""} ${submission.substring(0, 200)} ${rubricText.substring(0, 200)}`.trim();

    // Retrieve lesson context chunks
    const chunks = await retrieveLessonContext(supabase, {
      lessonId,
      moduleId,
      query: ragQuery,
      topK: 6,
    });

    // Retrieve bank policies
    const policies = await retrieveBankPolicies(supabaseUrl);

    // Build context section from chunks
    let contextSection = "";
    if (chunks.length > 0) {
      contextSection = `## RETRIEVED LESSON CONTENT & CRITERIA
Use ONLY this information to evaluate the submission:

${chunks.map((chunk, i) => `[Chunk ${i + 1}]${chunk.source ? ` (Source: ${chunk.source})` : ""}
${chunk.text}`).join("\n\n")}

---`;
    } else {
      contextSection = `## NO SPECIFIC LESSON CONTENT AVAILABLE
Evaluate the submission based on general prompt engineering best practices.
Note in your feedback that specific lesson criteria were not available.`;
    }

    // Build bank policies section
    let policiesSection = "";
    if (policies.length > 0) {
      policiesSection = `## BANK POLICIES & GUIDELINES
The following are the bank's official policies. Check submissions for compliance:

${policies.map((policy) => `### ${policy.title} (${policy.policy_type})
${policy.summary ? `**Summary:** ${policy.summary}\n` : ""}
${policy.content}`).join("\n\n")}

---`;
    }

    // Build system prompt
    const systemPrompt = `You are a strict but supportive AI Practice Reviewer for a banking AI training platform. Your job is to evaluate learner submissions and provide structured feedback.

${getFeedbackStyleInstructions(learningStyle)}

${getProficiencyFeedbackInstructions(aiProficiencyLevel)}

${contextSection}

${policiesSection}

## RUBRIC
${rubric ? (typeof rubric === "string" ? rubric : JSON.stringify(rubric, null, 2)) : "Evaluate based on clarity, specificity, context, and appropriateness for banking use cases."}

## SUBMISSION CONTEXT
- Lesson ID: ${lessonId}
${moduleId ? `- Module ID: ${moduleId}` : ""}
${learnerState?.currentCardTitle ? `- Task: ${learnerState.currentCardTitle}` : ""}
${learnerState?.attemptNumber ? `- Attempt #${learnerState.attemptNumber}` : ""}

## CRITICAL RULES
1. Return ONLY valid JSON matching the exact schema below - no extra keys, no markdown wrapping
2. Use ONLY criteria from the RETRIEVED LESSON CONTENT for evaluation
3. Be specific - reference exact parts of the submission
4. Balance praise with constructive criticism
5. Tailor language complexity to the ${learningStyle.replace("_", "-")} learning style
6. If lesson content is missing, acknowledge this and evaluate on general best practices
7. Check submissions for compliance with BANK POLICIES - flag any potential violations
8. If the submission touches on data handling, AI usage, or security, verify alignment with bank guidelines

## REQUIRED OUTPUT FORMAT (strict JSON, no extra keys)
{
  "feedback": {
    "summary": "2-3 sentence overall assessment",
    "strengths": ["specific thing done well", "another strength"],
    "issues": ["specific issue found", "another issue"],
    "fixes": ["actionable fix for issue 1", "actionable fix for issue 2"],
    "next_steps": ["what to try next", "suggested improvement"]
  }
}`;

    // Call Claude API
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1200,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: `Please review this submission and provide structured JSON feedback:\n\n---\n${submission}\n---`,
          },
        ],
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
    const responseText = claudeResponse.content?.[0]?.text || "";

    // Parse JSON from Claude's response
    let feedbackData: FeedbackResponse;
    try {
      // Try to extract JSON from the response (handle potential markdown wrapping)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        feedbackData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse Claude response:", responseText);
      // Return a fallback structured response
      feedbackData = {
        feedback: {
          summary: "Your submission has been reviewed. The AI was unable to provide structured feedback at this time.",
          strengths: ["You completed the practice task"],
          issues: ["Unable to parse detailed feedback"],
          fixes: ["Try submitting again for detailed feedback"],
          next_steps: ["Review the lesson content and try again"],
        },
      };
    }

    return new Response(
      JSON.stringify(feedbackData),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Submission review error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
