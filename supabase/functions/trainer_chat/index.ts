import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface TrainerChatRequest {
  lessonId: string;
  moduleId?: string;
  messages: Message[];
  learnerState?: {
    currentCardTitle?: string;
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

// Get learning style instructions based on normalized style
function getLearningStyleInstructions(style: string): string {
  const instructions: Record<string, string> = {
    example_based: `LEARNING STYLE: Example-Based
- Lead with a concrete, relatable example FIRST
- Then provide a short explanation of why the example works
- End with a quick check question to verify understanding
- Use banking-specific examples when possible`,
    
    explanation_based: `LEARNING STYLE: Explanation-Based
- Start with a clear, comprehensive explanation
- Break down concepts step-by-step
- Provide context and "why" before "how"
- End with a brief recap of key points`,
    
    logic_based: `LEARNING STYLE: Logic-Based
- Begin with the underlying reasoning and principles
- Present rules and frameworks systematically
- Include verification steps and edge cases
- Conclude with a small test or challenge question`,
    
    hands_on: `LEARNING STYLE: Hands-On
- Keep exposition minimal
- Provide a short checklist of action items
- Give a tiny task or exercise to try immediately
- Focus on practical application over theory`,
  };
  return instructions[style] || instructions.explanation_based;
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

  // Build query - simple text search for now (can be upgraded to vector search later)
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

    const requestBody: TrainerChatRequest = await req.json();
    const { lessonId, moduleId, messages, learnerState, userId: bodyUserId } = requestBody;

    if (!lessonId || !messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "lessonId and messages are required" }),
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
      const token = authHeader.replace("Bearer ", "");
      const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
      if (!claimsError && claimsData?.claims?.sub) {
        userId = claimsData.claims.sub as string;
      }
    }
    
    if (!userId && bodyUserId) {
      userId = bodyUserId;
    }

    // Fetch learning style from user_profiles
    let learningStyle = "explanation_based";
    if (userId) {
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("learning_style")
        .eq("user_id", userId)
        .single();

      if (profile?.learning_style) {
        learningStyle = normalizeLearningStyle(profile.learning_style);
      }
    }

    // Build RAG query from latest user message + context
    const latestUserMessage = messages.filter(m => m.role === "user").pop()?.content || "";
    const ragQuery = `${learnerState?.currentCardTitle || ""} ${latestUserMessage}`.trim();

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
      contextSection = `## RETRIEVED LESSON CONTENT
The following content chunks are from the lesson materials. Use ONLY this information to answer questions:

${chunks.map((chunk, i) => `[Chunk ${i + 1}]${chunk.source ? ` (Source: ${chunk.source})` : ""}
${chunk.text}`).join("\n\n")}

---`;
    } else {
      contextSection = `## NO LESSON CONTENT AVAILABLE
No specific lesson content was found for this query. You should:
1. Ask the learner to clarify their question
2. Suggest which lesson card might cover their topic
3. Encourage them to review the lesson materials on the left panel
DO NOT invent or assume lesson content.`;
    }

    // Build bank policies section
    let policiesSection = "";
    if (policies.length > 0) {
      policiesSection = `## BANK POLICIES & GUIDELINES
The following are the bank's official policies regarding AI usage. Reference these when relevant:

${policies.map((policy) => `### ${policy.title} (${policy.policy_type})
${policy.summary ? `**Summary:** ${policy.summary}\n` : ""}
${policy.content}`).join("\n\n")}

---`;
    }

    // Build system prompt
    const systemPrompt = `You are an AI Training Coach for a banking AI training platform. Your role is to guide learners, answer questions about lesson content, and provide personalized coaching.

${getLearningStyleInstructions(learningStyle)}

${contextSection}

${policiesSection}

## CURRENT CONTEXT
- Lesson ID: ${lessonId}
${moduleId ? `- Module ID: ${moduleId}` : ""}
${learnerState?.currentCardTitle ? `- Current Card: ${learnerState.currentCardTitle}` : ""}
${learnerState?.progressSummary ? `- Progress: ${learnerState.progressSummary}` : ""}

## CRITICAL RULES
1. Use information from BOTH the RETRIEVED LESSON CONTENT and BANK POLICIES sections above
2. For questions about bank policies, AI usage guidelines, compliance, security, or data handling, ALWAYS cite the relevant BANK POLICY by name
3. If lesson content doesn't cover the learner's question but bank policies do, answer using the policies
4. If neither source covers the question, say so clearly and suggest where they might find the information
5. NEVER invent content not found in the retrieved chunks or policies
6. Keep responses concise and actionable (2-4 short paragraphs max)
7. Adapt your response format to match the learner's ${learningStyle.replace("_", "-")} learning style
8. Use markdown formatting for clarity (bold, bullets, numbered lists)
9. If asked to review practice work, evaluate it against retrieved success criteria only`;

    // Convert messages to Claude format
    const claudeMessages = messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

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
        max_tokens: 800,
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
    const reply = claudeResponse.content?.[0]?.text || "I'm here to help with your training. What would you like to know?";

    return new Response(
      JSON.stringify({ reply }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Trainer chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
