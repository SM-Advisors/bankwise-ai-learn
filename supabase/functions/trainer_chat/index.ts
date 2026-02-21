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

// Get proficiency level instructions (0-8 scale)
function getProficiencyInstructions(level: number | null): string {
  const proficiency = level ?? 3; // Default to intermediate if not set
  
  if (proficiency <= 2) {
    return `AI PROFICIENCY: Beginner (Level ${proficiency}/8)
- Use simple, everyday language - avoid jargon
- Define AI terms when you use them (e.g., "prompt", "context window")
- Provide more hand-holding and step-by-step guidance
- Assume minimal prior AI/ChatGPT experience
- Use analogies to explain concepts
- Be encouraging and patient`;
  } else if (proficiency <= 5) {
    return `AI PROFICIENCY: Intermediate (Level ${proficiency}/8)
- Use moderate technical language with brief clarifications
- Assume familiarity with basic AI concepts (prompts, responses)
- Can reference common AI patterns without full explanations
- Balance explanation with practical application
- Build on foundational knowledge`;
  } else {
    return `AI PROFICIENCY: Advanced (Level ${proficiency}/8)
- Use precise technical language freely
- Assume strong AI literacy and prompt engineering awareness
- Focus on nuance, edge cases, and optimization
- Can discuss advanced techniques (few-shot, chain-of-thought)
- Challenge with sophisticated scenarios
- Skip basic explanations`;
  }
}

interface BankPolicy {
  id: string;
  title: string;
  content: string;
  summary: string | null;
  policy_type: string;
}

interface AIPreferences {
  tone: string | null;
  verbosity: string | null;
  formatting_preference: string | null;
  role_context: string | null;
  additional_instructions: string | null;
}

interface AIMemory {
  content: string;
  context: string | null;
  is_pinned: boolean;
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

    // Fetch AI preferences and pinned memories
    let aiPreferences: AIPreferences | null = null;
    let aiMemories: AIMemory[] = [];
    if (userId) {
      const { data: prefs } = await supabase
        .from("ai_user_preferences")
        .select("tone, verbosity, formatting_preference, role_context, additional_instructions")
        .eq("user_id", userId)
        .single();
      if (prefs) aiPreferences = prefs as AIPreferences;

      const { data: mems } = await supabase
        .from("ai_memories")
        .select("content, context, is_pinned")
        .eq("user_id", userId)
        .eq("is_active", true)
        .eq("is_pinned", true)
        .limit(10);
      if (mems) aiMemories = mems as AIMemory[];
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
    const systemPrompt = `You are Andrea, a friendly AI Training Coach for a banking AI training platform. Your role is to review the learner's practice prompts and responses, and provide subtle guidance to help them improve.

COACHING STYLE:
- Be warm and personable, like a supportive colleague
- Give SUBTLE NUDGES, not constant detailed feedback
- Only offer help when asked or when you notice a clear opportunity to improve
- Celebrate wins briefly, don't over-praise
- When reviewing work, focus on 1-2 key improvements, not everything at once
- Use encouraging language: "You might try..." or "One thing that could help..." rather than "You should..."

RESPONSE FORMAT — CRITICAL:
- Keep your main reply CONCISE: 2-3 sentences maximum for normal responses
- Only give longer responses (up to 5 sentences) when explicitly asked for detail, reviewing practice work, or showing examples
- Use markdown sparingly—bold for emphasis only
- Never write long paragraphs or bulleted lists unless the learner asks for detail

RESPONSE STRUCTURE — MANDATORY:
You MUST respond with valid JSON in this exact format:
{
  "reply": "Your concise response here (2-3 sentences max)",
  "suggestedPrompts": ["Follow-up prompt 1", "Follow-up prompt 2"]
}

The "suggestedPrompts" array should contain 2-3 short follow-up questions or actions the learner might want to take next. These should be:
- Relevant to the current module and conversation
- Phrased as things the learner would say to you
- Short (under 60 characters each)
- Examples: "Show me an example for my role", "How can I improve this?", "What should I focus on next?"

${getLearningStyleInstructions(learningStyle)}

${getProficiencyInstructions(aiProficiencyLevel)}

${contextSection}

${policiesSection}

${aiPreferences ? `## USER AI PREFERENCES
- Preferred tone: ${aiPreferences.tone || 'professional'}
- Verbosity: ${aiPreferences.verbosity || 'balanced'}
- Formatting: ${aiPreferences.formatting_preference || 'mixed'}
${aiPreferences.role_context ? `- Role context: ${aiPreferences.role_context}` : ""}
${aiPreferences.additional_instructions ? `- Custom instructions: ${aiPreferences.additional_instructions}` : ""}

Adapt your responses to match these preferences while maintaining your coaching role.

---` : ""}

${aiMemories.length > 0 ? `## LEARNER MEMORIES (Pinned)
The learner has saved these key insights. Reference them when relevant:
${aiMemories.map((m, i) => `${i + 1}. ${m.content}${m.context ? ` (from: ${m.context})` : ""}`).join("\n")}

---` : ""}

## CURRENT CONTEXT
- Lesson ID: ${lessonId}
${moduleId ? `- Module ID: ${moduleId}` : ""}
${learnerState?.currentCardTitle ? `- Current Card: ${learnerState.currentCardTitle}` : ""}
${learnerState?.progressSummary ? `- Learner's Practice: ${learnerState.progressSummary}` : ""}

## CRITICAL RULES
1. ALWAYS respond with valid JSON containing "reply" and "suggestedPrompts"
2. Keep replies concise (2-3 sentences) unless reviewing practice work
3. Give ONE actionable suggestion at a time, not a list
4. If the learner asks for help, give a gentle hint first, not the full answer
5. Reference bank policies ONLY when directly relevant to the question
6. If their practice looks good, just say so briefly and encourage them to submit
7. Never lecture—be a helpful colleague, not a teacher
8. Adapt your tone to match the learner's ${learningStyle.replace("_", "-")} learning style`;

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
    const rawText = claudeResponse.content?.[0]?.text || "";

    // Try to parse structured JSON response
    let reply = "I'm here to help with your training. What would you like to know?";
    let suggestedPrompts: string[] = [];

    try {
      // Try parsing the entire response as JSON
      const parsed = JSON.parse(rawText);
      if (parsed.reply) {
        reply = parsed.reply;
        suggestedPrompts = Array.isArray(parsed.suggestedPrompts) ? parsed.suggestedPrompts.slice(0, 4) : [];
      } else {
        // If JSON but no reply field, use raw text
        reply = rawText;
      }
    } catch {
      // If not valid JSON, try to extract JSON from the response
      const jsonMatch = rawText.match(/\{[\s\S]*"reply"[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          reply = parsed.reply || rawText;
          suggestedPrompts = Array.isArray(parsed.suggestedPrompts) ? parsed.suggestedPrompts.slice(0, 4) : [];
        } catch {
          reply = rawText;
        }
      } else {
        // Plain text response — use as-is
        reply = rawText;
      }
    }

    // Detect compliance exceptions in the user's message
    const userMessage = (messages.filter(m => m.role === "user").pop()?.content || "").toLowerCase();
    let exceptionFlag = false;
    let exceptionType: string | null = null;

    // PII detection: SSN patterns, account numbers, customer names in quotes
    const piiPatterns = [
      /\b\d{3}-?\d{2}-?\d{4}\b/,          // SSN
      /\baccount\s*#?\s*\d{6,}\b/i,         // Account numbers
      /\brouting\s*#?\s*\d{9}\b/i,          // Routing numbers
      /\b\d{13,19}\b/,                       // Credit card numbers
    ];
    if (piiPatterns.some(p => p.test(userMessage))) {
      exceptionFlag = true;
      exceptionType = "pii_sharing";
    }

    // Compliance bypass detection
    const bypassPhrases = [
      "skip compliance", "ignore policy", "bypass", "skip the review",
      "without approval", "skip audit", "no need to check", "forget the rules",
    ];
    if (!exceptionFlag && bypassPhrases.some(phrase => userMessage.includes(phrase))) {
      exceptionFlag = true;
      exceptionType = "compliance_bypass";
    }

    // Data export detection
    const exportPhrases = [
      "export all customer", "download all", "extract all records",
      "bulk export", "dump the database", "scrape all",
    ];
    if (!exceptionFlag && exportPhrases.some(phrase => userMessage.includes(phrase))) {
      exceptionFlag = true;
      exceptionType = "data_export";
    }

    // Inappropriate use detection
    const inappropriatePhrases = [
      "write my resignation", "personal tax", "my homework",
      "not work related", "personal use", "for my side business",
    ];
    if (!exceptionFlag && inappropriatePhrases.some(phrase => userMessage.includes(phrase))) {
      exceptionFlag = true;
      exceptionType = "inappropriate_use";
    }

    // Log prompt telemetry (fire-and-forget, non-blocking)
    if (userId) {
      supabase
        .from("prompt_events")
        .insert({
          user_id: userId,
          session_id: lessonId ? parseInt(lessonId) : null,
          module_id: moduleId || null,
          event_type: "prompt_submitted",
          exception_flag: exceptionFlag,
          exception_type: exceptionType,
        })
        .then(() => {});
    }

    return new Response(
      JSON.stringify({ reply, suggestedPrompts }),
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
