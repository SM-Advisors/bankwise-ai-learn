import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";
import { checkRateLimit } from "../_shared/rateLimiter.ts";


interface Message {
  role: "user" | "assistant";
  content: string;
}

interface PracticeChatRequest {
  messages: Message[];
  moduleTitle: string;
  scenario: string;
  sessionNumber?: number;
  customSystemPrompt?: string; // User's deployed agent system prompt (Session 3)
  bankRole?: string; // User's role (Session 3 department personalization)
  lineOfBusiness?: string; // User's department (Session 3 department personalization)
  interests?: string[]; // F&F users: personal interest tags for personalization
  model?: string; // Selected model (defaults to claude-sonnet-4-6)
}

// ─── PII & COMPLIANCE PRE-PROCESSING ───────────────────────────────────────
interface ComplianceFlag {
  type: string;
  severity: "info" | "warning" | "critical";
  message: string;
}

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
      message: "Message contains potential PII (SSN, account number, or card number).",
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
      message: "Message suggests bypassing compliance procedures.",
    };
  }

  // Bulk data export detection
  const exportPhrases = [
    "export all customer", "download all", "extract all records",
    "bulk export", "dump the database", "scrape all",
  ];
  if (exportPhrases.some(phrase => lowerMessage.includes(phrase))) {
    return {
      type: "data_export",
      severity: "warning",
      message: "Message requests bulk data operations.",
    };
  }

  return null;
}

// Practice-persona safe response for flagged messages
function buildPracticeComplianceResponse(flag: ComplianceFlag): string {
  if (flag.type === "pii_sharing") {
    return "I noticed this message may contain sensitive personal information such as Social Security numbers, account numbers, or card numbers. For security, please replace any real data with placeholder values (e.g., 'SSN: XXX-XX-XXXX', 'Account #: XXXXXXXX') and resend your request.";
  }
  if (flag.type === "compliance_bypass") {
    return "I'm not able to assist with requests that involve skipping or bypassing required compliance or approval procedures. Please revise your request to work within standard bank policy guidelines.";
  }
  if (flag.type === "data_export") {
    return "Bulk data export requests require special authorization. I can help you work with individual records or summarize data within approved scope. Please revise your request accordingly.";
  }
  return "I'm unable to process this request as written. Please revise and try again.";
}

// Map lineOfBusiness enum to readable department name
function getDepartmentName(lob: string | undefined): string {
  const map: Record<string, string> = {
    accounting_finance: "Accounting & Finance",
    credit_administration: "Credit Administration",
    executive_leadership: "Executive & Leadership",
  };
  return map[lob || ""] || "";
}

// ─── MULTI-PROVIDER MODEL ROUTING ──────────────────────────────────────────
async function callModel(
  model: string,
  systemPrompt: string,
  messages: Message[],
  maxTokens = 1500,
): Promise<string> {
  // ── Anthropic (claude-*) ──────────────────────────────────────────────────
  if (model.startsWith("claude-")) {
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY is not configured");

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Anthropic API error:", res.status, errText);
      if (res.status === 429) throw new Error("rate_limit");
      throw new Error(`Anthropic API error: ${res.status}`);
    }

    const data = await res.json();
    return data.content?.[0]?.text ?? "";
  }

  // ── OpenAI (gpt-*) ────────────────────────────────────────────────────────
  if (model.startsWith("gpt-")) {
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) return "**GPT-4o** isn't available in this environment yet — an OpenAI API key hasn't been configured. Switch back to **Claude Sonnet 4.6** using the model selector to continue.";

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        messages: [{ role: "system", content: systemPrompt }, ...messages],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("OpenAI API error:", res.status, errText);
      if (res.status === 429) throw new Error("rate_limit");
      throw new Error(`OpenAI API error: ${res.status}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? "";
  }

  // ── Google Generative AI (gemini-*) ───────────────────────────────────────
  if (model.startsWith("gemini-")) {
    const GOOGLE_AI_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY");
    if (!GOOGLE_AI_API_KEY) return "**Gemini 2.5 Flash** isn't available in this environment yet — a Google AI API key hasn't been configured. Switch back to **Claude Sonnet 4.6** using the model selector to continue.";

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GOOGLE_AI_API_KEY}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: messages.map(m => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
          })),
          generationConfig: { maxOutputTokens: maxTokens },
        }),
      },
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error("Google AI API error:", res.status, errText);
      if (res.status === 429) throw new Error("rate_limit");
      throw new Error(`Google AI API error: ${res.status}`);
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  }

  throw new Error(`Unknown model: ${model}`);
}

// ─── MAIN HANDLER ───────────────────────────────────────────────────────────
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
      "ai-practice",
    );
    if (!rateCheck.allowed) {
      return new Response(
        JSON.stringify({ error: rateCheck.reason || "Rate limit exceeded. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
  }

  try {
    const {
      messages,
      moduleTitle,
      scenario,
      sessionNumber,
      customSystemPrompt,
      bankRole,
      lineOfBusiness,
      interests,
      model: requestedModel,
    }: PracticeChatRequest = await req.json();

    const model = requestedModel || "claude-sonnet-4-6";

    // Determine if this is a Friends & Family (non-banker) user
    const isFF = !lineOfBusiness && interests && interests.length > 0;

    // Build context block — department for bankers, interests for F&F users
    const departmentName = getDepartmentName(lineOfBusiness);
    const departmentContext = (bankRole || departmentName) ? `
DEPARTMENT CONTEXT:
${departmentName ? `The user works in: ${departmentName}` : ""}
${bankRole ? `Their role: ${bankRole}` : ""}
Tailor your responses to be relevant to their department. Use terminology, examples, and realistic scenarios appropriate for their line of business.` : "";

    const interestsContext = isFF ? `
PERSONALIZATION CONTEXT — CRITICAL:
This learner is NOT a banker. They are a general user whose personal interests are: ${interests!.join(", ")}.
- IGNORE any banking framing in the scenario below — reframe it entirely around their interests
- Replace banking tasks with equivalent tasks from their world (e.g. a "credit memo" becomes a "project summary", a "loan application" becomes a freelance proposal, etc.)
- Do NOT use banking terminology, regulatory frameworks, or financial institution examples
- Use examples, language, and contexts that feel natural and relevant to their stated interests
- Make the exercise feel personal and fun, not like a banking simulation` : "";

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "messages array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use custom system prompt if provided (deployed agent for Session 3), otherwise use default
    const systemPrompt = customSystemPrompt
      ? `${customSystemPrompt}

---
SCENARIO CONTEXT:
The user is working on: "${moduleTitle}"
${scenario ? `Situation: ${scenario}` : ""}
${departmentContext}${interestsContext}

META-INSTRUCTIONS:
- Stay in character as the agent described above
- Use appropriate banking terminology and realistic fake data
- Mirror prompt quality — vague prompts get generic responses, specific prompts get tailored ones
- Do NOT mention training, exercises, or modules — act as a real AI tool
- Follow all guard rails, output rules, and compliance anchors defined in the system prompt above`
      : `You are an AI assistant being used by a banking professional as part of their day-to-day work. You are NOT a coach or tutor — you are the actual AI tool they are practicing with.

## YOUR ROLE
You are a general-purpose AI assistant (like ChatGPT or Claude) that a banker is using at their desk. Respond naturally and helpfully to whatever they ask.

## SCENARIO CONTEXT
The user is working on: "${moduleTitle}"
${scenario ? `\nSituation: ${scenario}` : ""}
${departmentContext}${interestsContext}

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

${isFF ? `3. PERSONAL REALISM:
   - This is NOT a banking user — never use banking terminology, regulatory frameworks, or financial examples
   - Reframe all tasks and examples around the user's interests: ${interests?.join(", ") || "general topics"}
   - Use realistic but clearly fake data appropriate to their context (fictional names, made-up companies, etc.)
   - Make responses feel relevant and natural for someone with those interests` : `3. BANKING REALISM:
   - Use appropriate banking terminology in your responses
   - If they ask you to draft something, draft it properly
   - If they ask for analysis, provide realistic analysis
   - Reference realistic regulatory frameworks (OCC, FDIC, etc.) when relevant
   - Use realistic but clearly fake data (Jane Doe, Acme Corp, etc.)`}

4. RESPONSE LENGTH:
   - Match response length to what a real AI tool would provide
   - Short prompts get shorter responses
   - Detailed requests get detailed responses
   - Don't pad responses — be as concise as the task demands

5. BE HONEST ABOUT LIMITATIONS:
   - If they ask for something you can't do (access real systems, look up real data), say so naturally
   - Suggest what information they'd need to provide for you to help`;

    // ── PII / Compliance pre-check ──────────────────────────────────────────
    const latestUserMessage = [...messages].reverse().find(m => m.role === "user")?.content || "";
    const complianceFlag = detectComplianceIssues(latestUserMessage);
    if (complianceFlag) {
      console.warn(`[ai-practice] Compliance flag: ${complianceFlag.type} (${complianceFlag.severity})`);
      return new Response(
        JSON.stringify({
          reply: buildPracticeComplianceResponse(complianceFlag),
          complianceFlag: { type: complianceFlag.type, severity: complianceFlag.severity },
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const claudeMessages = messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    console.log(`[ai-practice] Routing to model: ${model}`);

    let reply: string;
    try {
      reply = await callModel(model, systemPrompt, claudeMessages);
    } catch (modelError) {
      const errMsg = modelError instanceof Error ? modelError.message : String(modelError);
      if (errMsg === "rate_limit") {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw modelError;
    }

    return new Response(
      JSON.stringify({ reply: reply || "I'd be happy to help. Could you provide more details about what you need?" }),
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
