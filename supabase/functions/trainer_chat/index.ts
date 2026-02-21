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
  sessionNumber?: number;
  messages: Message[];
  greeting?: boolean; // If true, generate a personalized greeting instead of a normal reply
  learnerState?: {
    currentCardTitle?: string;
    progressSummary?: string;
    completedModules?: string[];
    displayName?: string;
    bankRole?: string;
    lineOfBusiness?: string;
  };
  userId?: string;
}

interface LessonChunk {
  id: string;
  text: string;
  source: string | null;
  metadata: Record<string, unknown>;
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

interface ComplianceFlag {
  type: string;
  severity: "info" | "warning" | "critical";
  message: string;
}

// ─── COMPLIANCE PRE-PROCESSING ─────────────────────────────────────────────
// Runs BEFORE the Claude call so Andrea can coach about compliance issues
function detectComplianceIssues(userMessage: string): ComplianceFlag | null {
  const lowerMessage = userMessage.toLowerCase();

  // PII detection: SSN patterns, account numbers, routing numbers, credit cards
  const piiPatterns = [
    /\b\d{3}-?\d{2}-?\d{4}\b/,          // SSN
    /\baccount\s*#?\s*\d{6,}\b/i,         // Account numbers
    /\brouting\s*#?\s*\d{9}\b/i,          // Routing numbers
    /\b\d{13,19}\b/,                       // Credit card numbers
  ];
  if (piiPatterns.some(p => p.test(userMessage))) {
    return {
      type: "pii_sharing",
      severity: "critical",
      message: "The learner's message contains what appears to be real PII (personal identifiable information such as SSN, account number, or card number).",
    };
  }

  // Compliance bypass detection
  const bypassPhrases = [
    "skip compliance", "ignore policy", "bypass", "skip the review",
    "without approval", "skip audit", "no need to check", "forget the rules",
  ];
  if (bypassPhrases.some(phrase => lowerMessage.includes(phrase))) {
    return {
      type: "compliance_bypass",
      severity: "warning",
      message: "The learner is attempting to bypass or skip compliance procedures.",
    };
  }

  // Data export detection
  const exportPhrases = [
    "export all customer", "download all", "extract all records",
    "bulk export", "dump the database", "scrape all",
  ];
  if (exportPhrases.some(phrase => lowerMessage.includes(phrase))) {
    return {
      type: "data_export",
      severity: "warning",
      message: "The learner is requesting bulk data export which may violate data handling policies.",
    };
  }

  // Inappropriate use detection
  const inappropriatePhrases = [
    "write my resignation", "personal tax", "my homework",
    "not work related", "personal use", "for my side business",
  ];
  if (inappropriatePhrases.some(phrase => lowerMessage.includes(phrase))) {
    return {
      type: "inappropriate_use",
      severity: "info",
      message: "The learner appears to be using AI training tools for non-work purposes.",
    };
  }

  return null;
}

// Build compliance coaching injection for the system prompt
function buildComplianceCoachingBlock(flag: ComplianceFlag): string {
  const responses: Record<string, string> = {
    pii_sharing: `COMPLIANCE COACHING ALERT (CRITICAL):
The learner's message contains what appears to be real PII data.
Your response MUST:
1. Immediately and warmly remind them to NEVER include real customer data in AI prompts
2. Suggest using synthetic/fake data instead (e.g., "Try using 'Jane Doe, account #000-000' as a placeholder")
3. Explain that even in training, building the habit of protecting data matters
4. Reference the bank's data handling policy if available in BANK POLICIES section
Do NOT ignore this. Address it directly but without shaming them.`,

    compliance_bypass: `COMPLIANCE COACHING ALERT (WARNING):
The learner is suggesting bypassing compliance procedures in their prompt.
Your response MUST:
1. Acknowledge their frustration with process (empathize first)
2. Explain that part of effective AI prompting in banking is BUILDING compliance into workflows, not around them
3. Suggest reframing: "What if we built a prompt that makes compliance faster, not skippable?"
4. This is a great teaching moment — compliance-aware prompting is a key skill`,

    data_export: `COMPLIANCE COACHING ALERT (WARNING):
The learner is requesting bulk data operations in their prompt.
Your response MUST:
1. Note that bulk data operations require special authorization in banking
2. Suggest scoping down: "Let's practice with a single record first"
3. Teach them about data minimization in AI prompts — only request what you need
4. Reference data handling policies if available`,

    inappropriate_use: `COMPLIANCE COACHING ALERT (INFO):
The learner appears to be using the training for non-work purposes.
Your response should:
1. Gently redirect: "I'm best at helping with banking AI tasks — let's focus there"
2. Don't be harsh — just steer back to the training content
3. Suggest a relevant exercise from the current module instead`,
  };

  return responses[flag.type] || "";
}

// ─── LEARNING STYLE ────────────────────────────────────────────────────────
function normalizeLearningStyle(dbStyle: string | null): string {
  const styleMap: Record<string, string> = {
    "example-based": "example_based",
    "hands-on": "hands_on",
    "explanation-based": "explanation_based",
    "logic-based": "logic_based",
  };
  return styleMap[dbStyle || ""] || "explanation_based";
}

function getLearningStyleInstructions(style: string): string {
  const instructions: Record<string, string> = {
    example_based: `LEARNING STYLE: Example-Based
- Lead with a concrete, relatable banking example FIRST
- Then provide a short explanation of why the example works
- End with a quick check question to verify understanding
- Use the learner's specific department context when possible`,

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

function getTechLearningStyleInstructions(techStyle: string | null): string {
  if (!techStyle) return "";
  const normalized = normalizeLearningStyle(techStyle);
  const instructions: Record<string, string> = {
    example_based: `TECH LEARNING STYLE: Demo-First
When explaining AI TOOL concepts (not banking concepts), show the tool in action first.`,
    explanation_based: `TECH LEARNING STYLE: Documentation-First
When explaining AI TOOL concepts, start with how the feature/tool works before demonstrating.`,
    logic_based: `TECH LEARNING STYLE: Architecture-First
When explaining AI TOOL concepts, explain the underlying system and how components connect.`,
    hands_on: `TECH LEARNING STYLE: Explore-First
When explaining AI TOOL concepts, give the learner something to click/try immediately.`,
  };
  return instructions[normalized] || "";
}

// ─── PROFICIENCY LEVELS ────────────────────────────────────────────────────
function getProficiencyInstructions(level: number | null): string {
  const proficiency = level ?? 3;

  if (proficiency <= 2) {
    return `AI PROFICIENCY: Beginner (Level ${proficiency}/8)
- Use simple, everyday language — avoid jargon
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

// ─── SESSION-AWARE COACHING DEPTH ──────────────────────────────────────────
function getSessionCoachingDepth(sessionNumber: number): string {
  if (sessionNumber <= 1) {
    return `SESSION COACHING DEPTH: Foundations (Session ${sessionNumber})
You are in HAND-HOLDING mode. This learner is just starting out.
- Explain concepts thoroughly — assume they've never prompted an AI before
- Offer examples proactively, even if not asked
- After each response, check in: "Does that make sense?" or "Want me to show you what that looks like?"
- Be generous with encouragement — they're building confidence
- If they make a mistake, frame it as "most people start here" not "that's wrong"
- Suggest next steps clearly: "Now try..." or "Your next step is..."`;
  } else if (sessionNumber === 2) {
    return `SESSION COACHING DEPTH: Agent Building (Session 2)
You are in COLLABORATIVE mode. This learner completed Session 1 foundations.
- Ask before telling: "What do you think the next step should be?" before giving the answer
- Reference Session 1 concepts they should know: "Remember the CLEAR framework from Session 1?"
- Expect them to attempt before asking for help
- Give hints, not answers: "Think about what context the AI needs here"
- Push them to be specific: "Good start — can you make the output format more precise?"
- When they succeed, note what they did well specifically (not generic praise)`;
  } else {
    return `SESSION COACHING DEPTH: Role-Specific Mastery (Session 3)
You are in PEER mode. This learner has completed Sessions 1 and 2.
- Challenge their thinking: "Have you considered the edge case where...?"
- Be more direct and concise — less hand-holding, more peer feedback
- Push for production-quality work: "Would you send this to your manager as-is?"
- Ask them to explain their reasoning: "Walk me through why you structured it that way"
- Introduce advanced concepts naturally: "This is a good spot for chain-of-thought prompting"
- Less praise, more "have you considered..." and "what if..."
- They should be driving the conversation — you're a sounding board, not a guide`;
  }
}

// ─── RAG & DATA RETRIEVAL ──────────────────────────────────────────────────
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

  return data || [];
}

// ─── ANDREA'S PERSONA ──────────────────────────────────────────────────────
function buildAndreaPersona(): string {
  return `You are Andrea, an AI Training Coach for banking professionals learning to use AI effectively.

## WHO YOU ARE — 5 PERSONA ANCHORS (Never break character)

1. DIRECT BUT WARM: You don't hedge or over-qualify. When something needs fixing, you say so — kindly, but clearly. You never say "Great job!" when the work needs improvement. You say "That's close — the compliance clause is missing. Here's why it matters."

2. BANKING-SAVVY: You speak banking naturally. You reference credit committees, BSA/AML reviews, loan documentation, board reports, and regulatory examinations like someone who's been in the industry. Use real banking vocabulary — don't genericize. Say "underwriting memo" not "professional document."

3. QUIETLY ENCOURAGING: You celebrate progress with specifics, not hollow praise. Instead of "Great work!", say "Your output format is much tighter than your first attempt — the tabular layout works well for credit summaries." Action-empathy over hollow-empathy.

4. SOLUTION-FOCUSED: Every critique comes with a concrete path forward. Never point out a problem without immediately suggesting how to fix it. "The tone is too casual for a board report. Try framing the opening as: [specific suggestion]."

5. KNOWS SHE'S AI: You're honest about what you are. You don't pretend to have worked at a bank. You say things like "I can't review your actual loan file, but I can help you build the prompt that would." This builds trust through transparency.`;
}

// ─── SOCRATIC COACHING RULES ───────────────────────────────────────────────
function buildSocraticRules(): string {
  return `## SOCRATIC COACHING RULE
When a learner asks a conceptual question (e.g., "How do I write a good prompt?", "What makes a prompt effective?"):
1. Respond with ONE clarifying question first to understand their specific context
2. Examples: "What kind of task are you working on — a data lookup, a draft, or an analysis?" or "Which department is this for?"
3. THEN tailor your explanation to their answer

EXCEPTIONS — give the direct answer immediately if:
- They've already provided their specific context/scenario in the question
- They explicitly say "just tell me" or "give me the answer"
- They're on attempt 3+ of the same task (they're stuck, not exploring)
- They're asking about a factual/procedural topic with one right answer
- The conversation already has 4+ messages (context has been established)`;
}

// ─── MAIN SERVER ───────────────────────────────────────────────────────────
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
    const {
      lessonId,
      moduleId,
      sessionNumber,
      messages,
      greeting,
      learnerState,
      userId: bodyUserId,
    } = requestBody;

    // For greeting requests, messages can be empty
    if (!greeting && (!lessonId || !messages || !Array.isArray(messages))) {
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

    // Fetch full user profile (learning style, proficiency, tech style, role)
    let learningStyle = "explanation_based";
    let techLearningStyle: string | null = null;
    let aiProficiencyLevel: number | null = null;
    let displayName: string | null = null;
    let bankRole: string | null = null;
    let lineOfBusiness: string | null = null;
    let employerBankName: string | null = null;

    if (userId) {
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("learning_style, tech_learning_style, ai_proficiency_level, display_name, bank_role, line_of_business, employer_bank_name")
        .eq("user_id", userId)
        .single();

      if (profile) {
        if (profile.learning_style) learningStyle = normalizeLearningStyle(profile.learning_style);
        if (profile.tech_learning_style) techLearningStyle = profile.tech_learning_style;
        if (profile.ai_proficiency_level !== undefined) aiProficiencyLevel = profile.ai_proficiency_level;
        displayName = profile.display_name;
        bankRole = profile.bank_role;
        lineOfBusiness = profile.line_of_business;
        employerBankName = profile.employer_bank_name;
      }
    }

    // Use learnerState overrides if profile data not available
    if (!displayName && learnerState?.displayName) displayName = learnerState.displayName;
    if (!bankRole && learnerState?.bankRole) bankRole = learnerState.bankRole;
    if (!lineOfBusiness && learnerState?.lineOfBusiness) lineOfBusiness = learnerState.lineOfBusiness;

    // Fetch AI preferences and memories (pinned + recent unpinned)
    let aiPreferences: AIPreferences | null = null;
    let aiMemories: AIMemory[] = [];
    if (userId) {
      const { data: prefs } = await supabase
        .from("ai_user_preferences")
        .select("tone, verbosity, formatting_preference, role_context, additional_instructions")
        .eq("user_id", userId)
        .single();
      if (prefs) aiPreferences = prefs as AIPreferences;

      // Fetch ALL active memories (pinned + unpinned), max 15
      const { data: mems } = await supabase
        .from("ai_memories")
        .select("content, context, is_pinned")
        .eq("user_id", userId)
        .eq("is_active", true)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(15);
      if (mems) aiMemories = mems as AIMemory[];
    }

    // Determine session number
    const effectiveSessionNumber = sessionNumber || (lessonId ? parseInt(lessonId) : 1);

    // ─── HANDLE GREETING REQUEST ─────────────────────────────────────
    if (greeting) {
      const completedCount = learnerState?.completedModules?.length || 0;
      const greetingPrompt = buildAndreaPersona() + `\n\n` +
        getSessionCoachingDepth(effectiveSessionNumber) + `\n\n` +
        `Generate a SHORT, personalized greeting (3-4 sentences max) for this learner who just opened the training workspace.

LEARNER CONTEXT:
- Name: ${displayName || "there"}
- Role: ${bankRole || "banking professional"}
- Bank: ${employerBankName || "their bank"}
- Line of Business: ${lineOfBusiness || "general banking"}
- AI Proficiency: Level ${aiProficiencyLevel ?? 3}/8
- Current Session: ${effectiveSessionNumber}
- Modules Completed: ${completedCount}
${learnerState?.currentCardTitle ? `- Starting Module: ${learnerState.currentCardTitle}` : ""}

${aiMemories.length > 0 ? `THINGS YOU REMEMBER ABOUT THIS LEARNER:\n${aiMemories.slice(0, 5).map(m => `- ${m.content}`).join("\n")}` : ""}

GREETING RULES:
- Use their name if available
- Reference their specific role/department naturally
- If they've completed modules before, acknowledge their progress
- If this is Session 2 or 3, briefly reference what they learned in the previous session
- End with something encouraging about the current module they're about to start
- Do NOT explain how the workspace works (they already know)
- Do NOT be generic. Make it feel like you know them.
- Keep it warm but professional — you're a banking colleague, not a cheerleader

RESPONSE FORMAT — MANDATORY:
{
  "reply": "Your personalized greeting here",
  "suggestedPrompts": ["relevant first action 1", "relevant first action 2", "relevant first action 3"],
  "coachingAction": "celebrate"
}`;

      const greetingResponse = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 400,
          system: greetingPrompt,
          messages: [{ role: "user", content: "Generate my greeting." }],
        }),
      });

      if (!greetingResponse.ok) {
        // Fallback greeting if API fails
        const fallbackName = displayName ? `, ${displayName}` : "";
        return new Response(
          JSON.stringify({
            reply: `Hi${fallbackName}! Ready to dive into Session ${effectiveSessionNumber}? I'm Andrea, your AI training coach. Let's get started!`,
            suggestedPrompts: ["What will I learn in this module?", "Show me an example", "I have a question about AI"],
            coachingAction: "celebrate",
            hintAvailable: false,
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const greetingData = await greetingResponse.json();
      const greetingRaw = greetingData.content?.[0]?.text || "";
      const parsed = parseAndreaResponse(greetingRaw);
      return new Response(
        JSON.stringify(parsed),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ─── COMPLIANCE PRE-PROCESSING ─────────────────────────────────────
    const latestUserMessage = messages.filter(m => m.role === "user").pop()?.content || "";
    const complianceFlag = detectComplianceIssues(latestUserMessage);
    let complianceCoachingBlock = "";
    if (complianceFlag) {
      complianceCoachingBlock = buildComplianceCoachingBlock(complianceFlag);
    }

    // ─── RAG RETRIEVAL ───────────────────────────────────────────────────
    const ragQuery = `${learnerState?.currentCardTitle || ""} ${latestUserMessage}`.trim();

    const chunks = await retrieveLessonContext(supabase, {
      lessonId,
      moduleId,
      query: ragQuery,
      topK: 6,
    });

    const policies = await retrieveBankPolicies(supabaseUrl);

    // Build context section from chunks
    let contextSection = "";
    if (chunks.length > 0) {
      contextSection = `## RETRIEVED LESSON CONTENT
The following content chunks are from the lesson materials. Use this information to ground your responses:

${chunks.map((chunk, i) => `[Chunk ${i + 1}]${chunk.source ? ` (Source: ${chunk.source})` : ""}
${chunk.text}`).join("\n\n")}

---`;
    } else {
      contextSection = `## NO LESSON CONTENT AVAILABLE
No specific lesson content was found for this module. You should:
1. Draw on your banking AI knowledge to help the learner
2. Be transparent: "I don't have the specific lesson content loaded, but here's what I know..."
3. Encourage them to click on the module in the left panel to review the content
DO NOT invent specific lesson content that doesn't exist.`;
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

    // ─── BUILD FULL SYSTEM PROMPT ──────────────────────────────────────
    const systemPrompt = `${buildAndreaPersona()}

${buildSocraticRules()}

${getSessionCoachingDepth(effectiveSessionNumber)}

## RESPONSE FORMAT — CRITICAL
You MUST respond with valid JSON in this exact format:
{
  "reply": "Your response here",
  "suggestedPrompts": ["Follow-up 1", "Follow-up 2"],
  "coachingAction": "socratic|explain|review|celebrate|redirect",
  "hintAvailable": true/false
}

FIELD DEFINITIONS:
- "reply": Your main response. Keep it CONCISE: 2-3 sentences for normal responses. Up to 5 sentences when reviewing practice work or showing examples. Use markdown sparingly — bold for emphasis only.
- "suggestedPrompts": 2-3 short follow-up actions (under 60 chars each), phrased as things the LEARNER would say to you.
- "coachingAction": What type of response this is:
  - "socratic" — you're asking a clarifying question before answering
  - "explain" — you're explaining a concept or giving information
  - "review" — you're reviewing their practice work
  - "celebrate" — you're acknowledging a win or progress
  - "redirect" — you're steering them back on track
- "hintAvailable": Set to true if you're holding back a specific hint or example that could help them. The UI will show a "Get hint" button.

${complianceCoachingBlock ? `## COMPLIANCE COACHING REQUIRED\n${complianceCoachingBlock}\n\n---\n` : ""}

${getLearningStyleInstructions(learningStyle)}

${getTechLearningStyleInstructions(techLearningStyle)}

${getProficiencyInstructions(aiProficiencyLevel)}

${contextSection}

${policiesSection}

${aiPreferences ? `## USER AI PREFERENCES
- Preferred tone: ${aiPreferences.tone || 'professional'}
- Verbosity: ${aiPreferences.verbosity || 'balanced'}
- Formatting: ${aiPreferences.formatting_preference || 'mixed'}
${aiPreferences.role_context ? `- Role context: ${aiPreferences.role_context}` : ""}
${aiPreferences.additional_instructions ? `- Custom instructions: ${aiPreferences.additional_instructions}` : ""}

Adapt your responses to match these preferences while maintaining your coaching persona.

---` : ""}

${aiMemories.length > 0 ? `## LEARNER MEMORIES
The learner has saved these insights. Reference them when relevant:
${aiMemories.map((m, i) => `${i + 1}. ${m.is_pinned ? "[PINNED] " : ""}${m.content}${m.context ? ` (from: ${m.context})` : ""}`).join("\n")}

---` : ""}

## CURRENT CONTEXT
- Session: ${effectiveSessionNumber}
- Lesson ID: ${lessonId}
${moduleId ? `- Module ID: ${moduleId}` : ""}
${learnerState?.currentCardTitle ? `- Current Module: ${learnerState.currentCardTitle}` : ""}
${learnerState?.progressSummary ? `- Learner's Practice: ${learnerState.progressSummary}` : ""}
${displayName ? `- Learner Name: ${displayName}` : ""}
${bankRole ? `- Learner Role: ${bankRole}` : ""}
${lineOfBusiness ? `- Department: ${lineOfBusiness}` : ""}
${employerBankName ? `- Bank: ${employerBankName}` : ""}

## CRITICAL RULES
1. ALWAYS respond with valid JSON containing ALL required fields
2. Keep replies concise (2-3 sentences) unless reviewing practice work or showing examples
3. Give ONE actionable suggestion at a time, not a list
4. Follow the SOCRATIC COACHING RULE for conceptual questions
5. Match the SESSION COACHING DEPTH for this session
6. Reference bank policies ONLY when directly relevant
7. If their practice looks good, say so specifically and encourage them to submit
8. Never lecture — be a banking colleague who happens to be great at AI
9. Use their name occasionally (not every message) if you know it
10. If compliance coaching is required above, address it FIRST before anything else`;

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
        max_tokens: 1000,
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

    // Parse Andrea's structured response
    const parsed = parseAndreaResponse(rawText);

    // Add compliance flag to response if detected (for frontend/telemetry)
    if (complianceFlag) {
      parsed.complianceFlag = complianceFlag;
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
          exception_flag: !!complianceFlag,
          exception_type: complianceFlag?.type || null,
        })
        .then(() => {});
    }

    return new Response(
      JSON.stringify(parsed),
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

// ─── RESPONSE PARSER ─────────────────────────────────────────────────────────
function parseAndreaResponse(rawText: string): {
  reply: string;
  suggestedPrompts: string[];
  coachingAction: string;
  hintAvailable: boolean;
  confidenceNote?: string;
  complianceFlag?: ComplianceFlag;
  memorySuggestion?: { content: string; reason: string };
} {
  const defaults = {
    reply: "I'm here to help with your training. What would you like to work on?",
    suggestedPrompts: [] as string[],
    coachingAction: "explain",
    hintAvailable: false,
  };

  try {
    const parsed = JSON.parse(rawText);
    return {
      reply: parsed.reply || defaults.reply,
      suggestedPrompts: Array.isArray(parsed.suggestedPrompts) ? parsed.suggestedPrompts.slice(0, 4) : [],
      coachingAction: parsed.coachingAction || "explain",
      hintAvailable: !!parsed.hintAvailable,
      ...(parsed.confidenceNote ? { confidenceNote: parsed.confidenceNote } : {}),
      ...(parsed.memorySuggestion ? { memorySuggestion: parsed.memorySuggestion } : {}),
    };
  } catch {
    // Try to extract JSON from the response
    const jsonMatch = rawText.match(/\{[\s\S]*"reply"[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          reply: parsed.reply || defaults.reply,
          suggestedPrompts: Array.isArray(parsed.suggestedPrompts) ? parsed.suggestedPrompts.slice(0, 4) : [],
          coachingAction: parsed.coachingAction || "explain",
          hintAvailable: !!parsed.hintAvailable,
          ...(parsed.confidenceNote ? { confidenceNote: parsed.confidenceNote } : {}),
          ...(parsed.memorySuggestion ? { memorySuggestion: parsed.memorySuggestion } : {}),
        };
      } catch {
        return { ...defaults, reply: rawText };
      }
    }
    // Plain text response
    return { ...defaults, reply: rawText };
  }
}
