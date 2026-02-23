import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";
import { checkRateLimit } from "../_shared/rateLimiter.ts";



interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AgentContext {
  name?: string;
  status?: string;
  systemPrompt?: string;
  templateData?: {
    identity?: string;
    taskList?: Array<{ name: string; format: string; constraint: string }>;
    outputRules?: string[];
    guardRails?: Array<{ rule: string; alternative: string }>;
    complianceAnchors?: string[];
  };
  isDeployed?: boolean;
}

interface WorkflowContext {
  name?: string;
  status?: string;
  trigger?: string;
  steps?: Array<{ name: string; aiPromptTemplate: string; humanReview: boolean; outputDescription: string }>;
  finalOutput?: string;
  stepCount?: number;
  checkpointCount?: number;
}

interface TrainerChatRequest {
  lessonId: string;
  moduleId?: string;
  sessionNumber?: number;
  messages: Message[];
  greeting?: boolean; // If true, generate a personalized greeting instead of a normal reply
  practiceConversation?: Message[]; // The learner's practice chat from the center panel
  agentContext?: AgentContext; // The learner's agent data from Agent Studio
  workflowContext?: WorkflowContext; // The learner's workflow data from Workflow Studio
  learnerState?: {
    currentCardTitle?: string;
    learningObjectives?: string[];
    learningOutcome?: string;
    progressSummary?: string;
    completedModules?: string[];
    displayName?: string;
    bankRole?: string;
    lineOfBusiness?: string;
    retrievalContext?: string; // Formatted spaced repetition questions block
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
    example_based: `LEARNING STYLE: Example-Based (Show Me First)
COACHING MOVES:
1. LEAD WITH EXAMPLE: Start every response with a concrete, relatable banking example from their department. "Here's what this looks like for a credit analyst..."
2. EXPLAIN THE PATTERN: After the example, explain the underlying principle (2-3 sentences max). "The reason this works is..."
3. CONNECT TO THEIR WORK: Ask them to map it to their specific role. "How would you adapt this for your [department] work?"
4. VERIFY UNDERSTANDING: End with a check. "Does that example click, or would another one from a different angle help?"
- When reviewing their work, compare it to an example of good output rather than listing abstract criteria
- Use their department context for all examples when possible`,

    explanation_based: `LEARNING STYLE: Explanation-Based (Help Me Understand)
COACHING MOVES:
1. FRAME THE CONCEPT: Start with what it is and why it matters. "This concept exists because..."
2. BREAK IT DOWN: Walk through the components step-by-step. Number your steps.
3. PROVIDE THE "WHY": For each step, explain the reasoning. "We do this because..."
4. SUMMARIZE: End with a 1-2 sentence recap. "So the key takeaway is..."
- When reviewing their work, explain what's working and why it's working, not just "good job"
- Anticipate follow-up questions and address them proactively`,

    logic_based: `LEARNING STYLE: Logic-Based (Show Me the Rules)
COACHING MOVES:
1. STATE THE RULE: Start with the principle or framework. "The rule is: X when Y, Z otherwise."
2. SHOW THE LOGIC: Walk through the reasoning chain. "If A, then B, because C."
3. TEST THE EDGES: Present an edge case or exception. "But what happens when..."
4. CHALLENGE: End with a scenario that tests their understanding. "Given this situation, what would you do?"
- When reviewing their work, evaluate against explicit criteria and rules, not subjective impressions
- Be precise with feedback: "This meets criterion 3 but not criterion 4 because..."`,

    hands_on: `LEARNING STYLE: Hands-On (Let Me Try)
COACHING MOVES:
1. MINIMAL SETUP: Give the shortest possible context (1-2 sentences max). Skip theory.
2. IMMEDIATE TASK: Give them something to do RIGHT NOW. "Try this: write a prompt that..."
3. QUICK FEEDBACK: When they try, give immediate, specific feedback. "Good start. Now change X."
4. ITERATE FAST: Push for rapid iteration. "That's better — now add a guard rail and try again."
- When reviewing their work, focus on what to DO differently, not what to UNDERSTAND differently
- Keep every response action-oriented — every message should end with something for them to try`,
  };
  return instructions[style] || instructions.explanation_based;
}

function getTechLearningStyleInstructions(techStyle: string | null): string {
  if (!techStyle) return "";
  const normalized = normalizeLearningStyle(techStyle);
  const instructions: Record<string, string> = {
    example_based: `TECH LEARNING STYLE: Demo-First
When explaining AI TOOL concepts (not banking concepts), show the tool in action first with a concrete walkthrough before explaining the theory. Use screenshots-style descriptions ("You'll see a text box at the top — paste your prompt there and hit Enter") so the learner can visualize the interface. After the demo, connect the tool's behavior to banking tasks they already understand.`,
    explanation_based: `TECH LEARNING STYLE: Documentation-First
When explaining AI TOOL concepts, start with how the feature or tool works and why it was designed that way before demonstrating it. Walk through the key settings and options systematically — what each one does, when to use it, and what the defaults mean. Once the learner understands the "why," show a quick example so they can see the concept in practice.`,
    logic_based: `TECH LEARNING STYLE: Architecture-First
When explaining AI TOOL concepts, explain the underlying system architecture and how components connect to each other before jumping into usage. Use cause-and-effect reasoning: "When you change X, it affects Y because Z." Present decision trees or if-then logic for choosing between tool options so the learner can reason through tool selection independently.`,
    hands_on: `TECH LEARNING STYLE: Explore-First
When explaining AI TOOL concepts, give the learner something to click or try immediately — skip the preamble. Frame instructions as quick experiments: "Open the settings panel, toggle this option, and see what changes in the output." After they've explored, circle back with a 1-sentence explanation of what they just experienced and why it matters for their banking workflow.`,
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
  } else if (sessionNumber === 3) {
    return `SESSION COACHING DEPTH: Role-Specific Mastery (Session 3)
You are in PEER mode. This learner has completed Sessions 1 and 2.
- Challenge their thinking: "Have you considered the edge case where...?"
- Be more direct and concise — less hand-holding, more peer feedback
- Push for production-quality work: "Would you send this to your manager as-is?"
- Ask them to explain their reasoning: "Walk me through why you structured it that way"
- Introduce advanced concepts naturally: "This is a good spot for chain-of-thought prompting"
- Less praise, more "have you considered..." and "what if..."
- They should be driving the conversation — you're a sounding board, not a guide`;
  } else {
    return `SESSION COACHING DEPTH: AI-Native Integration (Session 4)
You are in ADVISOR mode. This learner has completed Sessions 1-3. Your role has fundamentally shifted.
- Ask "What outcome are you trying to drive?" before offering solutions
- Challenge ROI assumptions: "How will you know this saved time?"
- Question whether AI is the right tool: "Is this an AUTOMATE, ASSIST, AUGMENT, or SKIP task?"
- Push for scale: "Could your team use this, or just you?"
- Push for sustainability: "What happens when you're on vacation — does this process stop?"
- If they are coasting through exercises, push harder: "That's a safe answer. What would the ambitious version look like?"
- If they are struggling, do NOT solve it: "What resource or skill gap is making this hard? Let's name it."
- Minimal hand-holding. Maximum accountability.
- Reference their agent, workflow, and capstone work from Sessions 2-3 by name when relevant.
- When they produce an Integration Plan, review it like a manager would: "Would this get approved? What's missing?"`;
  }
}

// ─── RAG & DATA RETRIEVAL ──────────────────────────────────────────────────

// Generate a single query embedding via OpenAI
async function generateQueryEmbedding(text: string): Promise<number[] | null> {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) return null;

  try {
    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: text,
        dimensions: 1536,
      }),
    });

    if (!response.ok) {
      console.error("OpenAI embedding error:", response.status);
      return null;
    }

    const result = await response.json();
    return result.data?.[0]?.embedding || null;
  } catch (err) {
    console.error("Embedding generation failed:", err);
    return null;
  }
}

async function retrieveLessonContext(
  supabase: any,
  params: { lessonId: string; moduleId?: string; query: string; topK?: number; learningStyle?: string }
): Promise<LessonChunk[]> {
  const { lessonId, moduleId, query: ragQuery, topK = 6, learningStyle = 'universal' } = params;

  // Try vector similarity search first
  const queryEmbedding = await generateQueryEmbedding(ragQuery);

  if (queryEmbedding) {
    try {
      const { data, error } = await supabase.rpc("match_lesson_chunks", {
        query_embedding: JSON.stringify(queryEmbedding),
        match_count: topK,
        filter_lesson_id: lessonId,
        filter_module_id: moduleId || null,
        similarity_threshold: 0.3,
        filter_learning_style: learningStyle,
      });

      if (!error && data && data.length > 0) {
        console.log(`Vector search returned ${data.length} chunks (top similarity: ${data[0]?.similarity?.toFixed(3)})`);
        return data;
      }

      if (error) {
        console.error("Vector search error, falling back to sequential:", error.message);
      }
    } catch (rpcErr) {
      console.error("RPC call failed, falling back to sequential:", rpcErr);
    }
  }

  // Fallback: sequential chunk retrieval (original behavior)
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
  const corsHeaders = getCorsHeaders(req.headers.get("origin"));
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
      practiceConversation,
      agentContext,
      workflowContext,
      learnerState,
      userId: bodyUserId,
    } = requestBody;

    console.log("[trainer_chat] practiceConversation received:", practiceConversation ? `${practiceConversation.length} messages` : "none");

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

    // Rate limiting
    if (userId) {
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (supabaseServiceKey) {
        const rateCheck = await checkRateLimit(supabaseUrl, supabaseServiceKey, userId, "trainer_chat");
        if (!rateCheck.allowed) {
          return new Response(
            JSON.stringify({ error: rateCheck.reason }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
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
- If this is Session 2, 3, or 4, briefly reference what they learned in the previous session
- End with something encouraging about the current module they're about to start
- Do NOT explain how the workspace works (they already know)
- Do NOT be generic. Make it feel like you know them.
- Keep it warm but professional — you're a banking colleague, not a cheerleader

${effectiveSessionNumber >= 2 && (moduleId === `${effectiveSessionNumber}-1`) ? `KNOWLEDGE CHECK (Retrieval Practice):
Before your standard greeting, include a brief warm-up. Frame it as: "Before we dive in, let's warm up with a few quick questions from last session — no grades, just keeping the concepts fresh."

Present these 3 questions (one at a time is fine, or all together):
${effectiveSessionNumber === 2 ? `1. Name the 5 letters of the CLEAR framework and what each stands for.
2. List 3 types of data you should NEVER include in a prompt.
3. Describe one step from the VERIFY checklist.` : effectiveSessionNumber === 3 ? `1. What are the 5 sections of an agent template?
2. Name the 3 types of agent tests (from Module 2-6).
3. What is the difference between a guard rail and a compliance anchor?` : `1. Name the 3 pillars of the compliance framework from Module 3-2.
2. Describe one workflow you built and its human review checkpoints.
3. What advanced prompting technique did you apply in your Session 3 capstone?`}

These are NOT graded — they are retrieval practice. Note which ones the learner struggles with and use that to calibrate your coaching depth for this session. After the knowledge check, proceed to your normal greeting about the current module.` : ""}

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
          model: "claude-sonnet-4-6",
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

    // ─── DASHBOARD MODE ───────────────────────────────────────────────
    const isDashboardMode = lessonId === 'dashboard';

    // ─── COMPLIANCE PRE-PROCESSING ─────────────────────────────────────
    const latestUserMessage = messages.filter(m => m.role === "user").pop()?.content || "";
    const complianceFlag = detectComplianceIssues(latestUserMessage);
    let complianceCoachingBlock = "";
    if (complianceFlag) {
      complianceCoachingBlock = buildComplianceCoachingBlock(complianceFlag);
    }

    // ─── RAG RETRIEVAL ───────────────────────────────────────────────────
    let contextSection = "";
    let policiesSection = "";

    if (isDashboardMode) {
      // Dashboard mode: skip RAG and bank policies, inject module navigation map
      contextSection = `## MODULE NAVIGATION MAP
You can direct learners to specific modules. Here is the complete curriculum:

Session 1: AI Foundations & Prompting (6 modules)
- Module 1-1: What AI Can Do For You (AI basics, banking use cases, 5 elements of a prompt)
- Module 1-2: The CLEAR Framework (Context, Length, Examples, Audience, Requirements + 5-Element mapping)
- Module 1-3: Context & Data Security (5 context types, PII sanitization, synthetic data)
- Module 1-4: Iteration & Refinement (iterative improvement + Troubleshooting Ladder)
- Module 1-5: Verifying AI Output (hallucination types, VERIFY checklist)
- Module 1-6: Session 1 Capstone (CLEAR + iterate + VERIFY exercise)

Session 2: Building Your AI Agent (6 modules)
- Module 2-1: From Prompts to Agents (bridge from CLEAR to agent architecture, CLEAR-to-agent mapping)
- Module 2-2: Agent Architecture (4 pillars, guard rails, compliance anchors, prompt security)
- Module 2-3: Custom Instructions Template (5-section template builder)
- Module 2-4: Tool Integration & Evaluation (evaluating data source connections)
- Module 2-5: Your Living Agent (agent iteration, sharing, measuring effectiveness)
- Module 2-6: Build Your Agent Capstone (assemble + test agent + Living Agent Plan)

Session 3: Role-Specific Training (5 modules)
- Module 3-1: Department AI Use Cases (role-specific prompt examples)
- Module 3-2: Compliance & AI (3 pillars, pre-task compliance checklist, when NOT to use AI)
- Module 3-3: Workflow Examples (multi-step AI workflows for banking)
- Module 3-4: Advanced Techniques (chain-of-thought, multi-shot, self-review, decomposition)
- Module 3-5: Capstone Project (real banking task with advanced techniques)

Session 4: AI-Native Integration (5 modules)
- Module 4-1: Your AI Audit (AI Eligibility Matrix — Automate/Assist/Augment/Skip)
- Module 4-2: Team AI Conventions (shared templates, naming, governance standards)
- Module 4-3: Measuring AI ROI (time savings baseline, quality metrics)
- Module 4-4: AI Tool Landscape (6-point evaluation checklist for any AI tool)
- Module 4-5: AI Integration Plan Capstone (1-page plan for manager presentation)

When recommending a module, say: "Head to Session X — [title]" and briefly explain why it's relevant.
To navigate there, they click the session card on the dashboard.`;
      policiesSection = "";
    } else {
      // Normal mode: RAG retrieval + bank policies
      const ragQuery = `${learnerState?.currentCardTitle || ""} ${latestUserMessage}`.trim();

      const chunks = await retrieveLessonContext(supabase, {
        lessonId,
        moduleId,
        query: ragQuery,
        topK: 6,
        learningStyle,
      });

      const policies = await retrieveBankPolicies(supabaseUrl);

      // Build context section from chunks
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
      if (policies.length > 0) {
        policiesSection = `## BANK POLICIES & GUIDELINES
The following are the bank's official policies regarding AI usage. Reference these when relevant:

${policies.map((policy) => `### ${policy.title} (${policy.policy_type})
${policy.summary ? `**Summary:** ${policy.summary}\n` : ""}
${policy.content}`).join("\n\n")}

---`;
      }
    }

    // ─── BUILD FULL SYSTEM PROMPT ──────────────────────────────────────
    const dashboardCoachingDepth = `SESSION COACHING DEPTH: Dashboard Navigator
You are in NAVIGATOR mode. The learner is on the dashboard, not in a training module.
- Be helpful and concise — this is a quick-help context, not a lesson
- Direct them to specific modules when they ask about topics
- If they ask "where should I start?", check their progress and suggest the next uncompleted module
- If they ask about a topic, map it to the right module and explain what they'll learn there
- Keep responses to 2-3 sentences max — they can go deeper in the actual module
- Reference their completed modules to avoid repeating content`;

    const systemPrompt = `${buildAndreaPersona()}

${buildSocraticRules()}

${isDashboardMode ? dashboardCoachingDepth : getSessionCoachingDepth(effectiveSessionNumber)}

## RESPONSE FORMAT — CRITICAL
You MUST respond with valid JSON in this exact format:
{
  "reply": "Your response here",
  "suggestedPrompts": ["Follow-up 1", "Follow-up 2"],
  "coachingAction": "socratic|explain|review|celebrate|redirect",
  "hintAvailable": true/false,
  "memorySuggestion": { "content": "Concise insight to remember", "reason": "Why this is worth saving" },
  "shareSuggestion": { "type": "idea|friction_point|agent|workflow", "summary": "1-sentence description of what to share", "destinations": ["community", "my_ideas", "executive"] },
  "promptSaveSuggestion": { "promptText": "The full prompt text to save", "suggestedTitle": "Short descriptive title", "suggestedCategory": "Category name" },
  "skillObservation": { "skill": "context_setting|specificity|data_security|formatting|compliance|clear_framework|iteration|audience_awareness", "level": "emerging|developing|proficient|advanced", "evidence": "1 sentence describing the behavior you observed" },
  "levelSuggestion": { "currentLevel": "beginner|intermediate|advanced|expert", "proposedLevel": "beginner|intermediate|advanced|expert", "rationale": "2-3 sentences explaining why this level change is warranted", "evidenceSummary": "Brief list of behaviors observed that support this change" }
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
- "memorySuggestion" (OPTIONAL — include only when genuinely useful, NOT on every message): Suggest saving an insight when the learner:
  - Has a learning breakthrough or "aha moment"
  - Discovers a useful prompting technique or pattern
  - States a work preference or workflow that Andrea should remember
  - Grasps a key concept worth reinforcing later
  - Completes a strong practice conversation (after review)
  The "content" should be concise (1 sentence) and written as a fact about the learner, e.g. "Prefers structured prompts with role + task + context format" or "Learned that specificity in prompts dramatically improves AI output quality". The "reason" is a short note for the learner explaining why this is worth saving (shown in the UI). Omit this field entirely when there's nothing noteworthy to save.
- "shareSuggestion" (OPTIONAL — include RARELY, only when genuinely noteworthy, not on every message): Suggest sharing when:
  - The learner explicitly asks to share something ("share this", "post this to the community", "send this to the Chief AI Officer")
  - The learner describes a painful or widespread friction point that colleagues would benefit from hearing about
  - The learner has a genuinely novel AI use case idea worth broadcasting to the organization
  - The learner has deployed a working agent or workflow that could help others
  - DO NOT suggest sharing for routine practice tasks, generic insights, or minor observations
  Fields: "type" (idea|friction_point|agent|workflow), "summary" (1 sentence describing what would be shared, written as a title-like description), "destinations" (array of applicable destinations from: "community", "my_ideas", "executive" — include "executive" only for high-impact ideas or when user requests it). Omit this field entirely when there is nothing genuinely worth sharing.
- "promptSaveSuggestion" (OPTIONAL — include when the learner crafts a genuinely well-structured, reusable prompt): Include when the learner's prompt uses CLEAR framework elements, includes guard rails, or demonstrates advanced techniques that would be useful to reuse. Roughly 1 in 5-10 messages when reviewing practice. Fields: "promptText" (the exact prompt text to save), "suggestedTitle" (short descriptive name, e.g. "Credit Memo Draft Prompt"), "suggestedCategory" (one of: Credit / Lending, Compliance / Risk, Finance / Accounting, Operations, Customer Service, General, Agent Template, Workflow). The UI will show a one-click "Save to Prompt Library" button. Omit this field for generic or low-quality prompts.
- "skillObservation" (OPTIONAL — include when you clearly observe the learner demonstrating a specific skill at a specific level): Use this to silently record what you see. Only one skill per message. Include when:
  - The learner writes a prompt and you can clearly assess one skill (e.g., "context_setting" at "proficient" because they included role + scenario + output format)
  - Do NOT include for vague or ambiguous interactions where skill level is unclear
  - Skills: context_setting, specificity, data_security, formatting, compliance, clear_framework, iteration, audience_awareness
  - Levels: emerging (aware but struggling), developing (attempting with gaps), proficient (doing it well), advanced (exceptional, teaches others)
  - "evidence": Describe the specific behavior you observed (1 sentence)
  Omit this field when no clear skill observation can be made.
- "levelSuggestion" (OPTIONAL — include VERY RARELY, at most once per session, only when you have strong evidence for a proficiency level change): Suggest when:
  - The learner has demonstrated consistent quality across 3+ messages that clearly places them at a different level than their current profile
  - The gap is significant (at least 1 full level up or down)
  - NEVER suggest more than one level change per conversation
  - currentLevel and proposedLevel must be from: beginner, intermediate, advanced, expert
  - This will be shown to the user as a suggestion they can accept or decline
  Omit this field in almost all messages — this should be rare and meaningful.

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

${practiceConversation && practiceConversation.length > 0 ? `## LEARNER'S PRACTICE CONVERSATION (${practiceConversation.length} messages)
IMPORTANT: The learner has a practice conversation in the center panel. You CAN see it — it is provided below. DO NOT say you cannot see their conversation. When they ask you to review it, analyze the conversation shown here:

${practiceConversation.map((m, i) => `[${i + 1}] **${m.role === "user" ? "Learner's Prompt" : "AI Response"}:** ${m.content}`).join("\n\n")}

---
REVIEW INSTRUCTIONS: When the learner asks you to review their practice conversation (or mentions "review", "check", "look at", "feedback on" their practice):
1. You HAVE their full conversation above — reference specific prompts by number
2. Comment on the QUALITY of the learner's prompts (specificity, structure, context provided)
3. Note how the AI's response quality reflected their prompt quality
4. Suggest specific improvements to their prompting technique
5. Reference the module's success criteria when evaluating
6. If they haven't submitted for review yet, you can still comment on what you're seeing

---` : ""}

${agentContext ? `## LEARNER'S AI AGENT
The learner is building a custom AI agent in the Agent Studio. Here is their current agent:
- Agent Name: ${agentContext.name || "Unnamed"}
- Status: ${agentContext.status || "draft"}${agentContext.isDeployed ? " (DEPLOYED for Session 3)" : ""}
${agentContext.templateData?.identity ? `- Identity: ${agentContext.templateData.identity}` : ""}
${agentContext.templateData?.taskList?.filter(t => t.name).length ? `- Tasks: ${agentContext.templateData.taskList.filter(t => t.name).map(t => t.name).join(", ")}` : ""}
${agentContext.templateData?.outputRules?.filter(r => r.trim()).length ? `- Output Rules: ${agentContext.templateData.outputRules.filter(r => r.trim()).join("; ")}` : ""}
${agentContext.templateData?.guardRails?.filter(g => g.rule.trim()).length ? `- Guard Rails: ${agentContext.templateData.guardRails.filter(g => g.rule.trim()).map(g => g.rule).join("; ")}` : ""}
${agentContext.templateData?.complianceAnchors?.filter(a => a.trim()).length ? `- Compliance Anchors: ${agentContext.templateData.complianceAnchors.filter(a => a.trim()).join("; ")}` : ""}

AGENT COACHING RULES:
- When the learner is working on their agent (Session 2, modules 2-3 or 2-6), reference their agent template sections specifically
- Suggest improvements to specific sections: "Your guard rails could include a redirect for investment advice"
- Celebrate deployment: "Your agent is live for Session 3 — exciting!"
- If their template is incomplete, guide them to fill in missing sections
- Comment on system prompt quality: word count, specificity, banking relevance
- Never write the entire template for them — guide them to do it themselves
---

` : ""}${workflowContext ? `## LEARNER'S AI WORKFLOW
The learner is building an AI workflow in the Workflow Studio. Here is their current workflow:
- Workflow Name: ${workflowContext.name || "Unnamed"}
- Status: ${workflowContext.status || "draft"}
${workflowContext.trigger ? `- Trigger: ${workflowContext.trigger}` : "- Trigger: NOT SET"}
${workflowContext.steps?.filter(s => s.name).length ? `- Steps: ${workflowContext.steps.filter(s => s.name).map((s, i) => `${i + 1}. ${s.name}${s.humanReview ? " [REVIEW]" : ""}`).join(", ")}` : "- Steps: NONE DEFINED"}
- Review Checkpoints: ${workflowContext.checkpointCount ?? workflowContext.steps?.filter(s => s.humanReview && s.name).length ?? 0}
${workflowContext.finalOutput ? `- Final Output: ${workflowContext.finalOutput}` : "- Final Output: NOT SET"}

WORKFLOW COACHING RULES:
- Help them structure their workflow with clear step boundaries
- Ensure at least 2 human review checkpoints exist — this is the compliance mechanism
- Suggest step refinements: "What if you split step 2 into analysis and formatting?"
- Push for specific AI prompt templates in each step, not vague descriptions
- Celebrate when the workflow has a clear trigger, 3+ steps, and review checkpoints
- If they have fewer than 2 review checkpoints, flag it immediately
- Never build the entire workflow for them — guide them to structure it themselves
---

` : ""}## CURRENT CONTEXT
- Session: ${effectiveSessionNumber}
- Lesson ID: ${lessonId}
${moduleId ? `- Module ID: ${moduleId}` : ""}
${learnerState?.currentCardTitle ? `- Current Module: ${learnerState.currentCardTitle}` : ""}
${learnerState?.learningOutcome ? `- Module Goal: ${learnerState.learningOutcome}` : ""}
${learnerState?.learningObjectives?.length ? `- This Module's Objectives:\n${learnerState.learningObjectives.map(o => `  • ${o}`).join("\n")}` : ""}
${learnerState?.progressSummary ? `- Learner's Practice: ${learnerState.progressSummary}` : ""}
${displayName ? `- Learner Name: ${displayName}` : ""}
${bankRole ? `- Learner Role: ${bankRole}` : ""}
${lineOfBusiness ? `- Department: ${lineOfBusiness}` : ""}
${employerBankName ? `- Bank: ${employerBankName}` : ""}

${learnerState?.retrievalContext ? learnerState.retrievalContext : ""}
${(() => {
      // ─── MICRO-ADAPTATION: analyze conversation patterns ───
      const userMessages = messages.filter((m: { role: string; content: string }) => m.role === "user");
      const msgCount = userMessages.length;
      const shortMessages = userMessages.filter((m: { role: string; content: string }) => m.content.length < 30).length;
      const questionMessages = userMessages.filter((m: { role: string; content: string }) => m.content.includes("?")).length;
      const struggling = msgCount >= 4 && (shortMessages / msgCount > 0.6 || questionMessages / msgCount > 0.7);
      const accelerating = msgCount >= 3 && shortMessages === 0 && questionMessages / msgCount < 0.2;

      if (struggling) {
        return `## MICRO-ADAPTATION: STRUGGLING LEARNER DETECTED
This learner has sent ${msgCount} messages, many of which are short or questions. They may be confused or unsure how to proceed.
- Switch to more supportive mode: offer a concrete example before asking them to try
- Break the current concept into smaller steps
- Ask: "Would it help if I showed you what a good version looks like for your role?"
- Do NOT increase difficulty until they demonstrate understanding`;
      } else if (accelerating) {
        return `## MICRO-ADAPTATION: ACCELERATING LEARNER DETECTED
This learner is engaging confidently with detailed, substantive messages.
- Increase challenge: ask deeper follow-up questions
- Skip basic explanations they clearly understand
- Push toward production quality: "This is good — now make it examiner-ready"
- Introduce the next concept naturally if they've mastered the current one`;
      }
      return "";
    })()}

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
10. If compliance coaching is required above, address it FIRST before anything else
${effectiveSessionNumber >= 2 ? `11. VERIFY INTEGRATION: When reviewing any AI-generated output the learner shows you in Sessions 2-4, check whether they applied VERIFY. If they present output without verification commentary, ask: "Before we move on — did you run VERIFY on this? What would you check first?" Reinforce the habit across all sessions.` : ""}
12. PROMPT LIBRARY: When the learner crafts a prompt that is well-structured, reusable, and banking-relevant — especially prompts that use CLEAR framework elements, include guard rails, or demonstrate advanced techniques — suggest they save it to their Prompt Library. Frame it naturally: "That prompt is solid and reusable — you might want to save it to your Prompt Library so you can pull it up next time you need a [task type]." Do NOT suggest this for every prompt — only genuinely reusable, high-quality ones (roughly 1 in 5-10 messages).`;

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
        model: "claude-sonnet-4-6",
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

    // Persist skill observation silently (fire-and-forget, non-blocking)
    if (userId && parsed.skillObservation) {
      const obs = parsed.skillObservation;
      supabase
        .from("skill_observations")
        .insert({
          user_id: userId,
          observed_skill: obs.skill,
          observed_level: obs.level,
          evidence: obs.evidence,
          module_id: moduleId || null,
          session_number: effectiveSessionNumber,
        })
        .then(() => {});
    }

    // Persist level change request if suggested — expire any existing pending first, then insert
    if (userId && parsed.levelSuggestion) {
      const ls = parsed.levelSuggestion;
      (async () => {
        // Mark any existing pending requests as expired before creating a new one
        await supabase
          .from("level_change_requests")
          .update({ status: "expired" })
          .eq("user_id", userId)
          .eq("status", "pending");
        // Now insert the fresh request
        await supabase
          .from("level_change_requests")
          .insert({
            user_id: userId,
            current_level: ls.currentLevel,
            proposed_level: ls.proposedLevel,
            rationale: ls.rationale,
            evidence_summary: ls.evidenceSummary,
            status: "pending",
          });
      })();
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
  shareSuggestion?: { type: string; summary: string; destinations: string[] };
  promptSaveSuggestion?: { promptText: string; suggestedTitle: string; suggestedCategory: string };
  skillObservation?: { skill: string; level: string; evidence: string };
  levelSuggestion?: { currentLevel: string; proposedLevel: string; rationale: string; evidenceSummary: string };
} {
  const defaults = {
    reply: "I'm here to help with your training. What would you like to work on?",
    suggestedPrompts: [] as string[],
    coachingAction: "explain",
    hintAvailable: false,
  };

  const extractShareSuggestion = (parsed: Record<string, unknown>) => {
    const s = parsed.shareSuggestion as Record<string, unknown> | undefined;
    if (!s || typeof s !== "object") return {};
    if (!s.type || !s.summary || !Array.isArray(s.destinations)) return {};
    return { shareSuggestion: { type: s.type as string, summary: s.summary as string, destinations: s.destinations as string[] } };
  };

  const extractSkillObservation = (parsed: Record<string, unknown>) => {
    const o = parsed.skillObservation as Record<string, unknown> | undefined;
    if (!o || typeof o !== "object") return {};
    if (!o.skill || !o.level || !o.evidence) return {};
    return { skillObservation: { skill: o.skill as string, level: o.level as string, evidence: o.evidence as string } };
  };

  const extractPromptSaveSuggestion = (parsed: Record<string, unknown>) => {
    const p = parsed.promptSaveSuggestion as Record<string, unknown> | undefined;
    if (!p || typeof p !== "object") return {};
    if (!p.promptText || !p.suggestedTitle || !p.suggestedCategory) return {};
    return { promptSaveSuggestion: { promptText: p.promptText as string, suggestedTitle: p.suggestedTitle as string, suggestedCategory: p.suggestedCategory as string } };
  };

  const extractLevelSuggestion = (parsed: Record<string, unknown>) => {
    const l = parsed.levelSuggestion as Record<string, unknown> | undefined;
    if (!l || typeof l !== "object") return {};
    if (!l.currentLevel || !l.proposedLevel || !l.rationale || !l.evidenceSummary) return {};
    return { levelSuggestion: { currentLevel: l.currentLevel as string, proposedLevel: l.proposedLevel as string, rationale: l.rationale as string, evidenceSummary: l.evidenceSummary as string } };
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
      ...extractShareSuggestion(parsed),
      ...extractPromptSaveSuggestion(parsed),
      ...extractSkillObservation(parsed),
      ...extractLevelSuggestion(parsed),
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
          ...extractShareSuggestion(parsed),
          ...extractPromptSaveSuggestion(parsed),
          ...extractSkillObservation(parsed),
          ...extractLevelSuggestion(parsed),
        };
      } catch {
        return { ...defaults, reply: rawText };
      }
    }
    // Plain text response
    return { ...defaults, reply: rawText };
  }
}
