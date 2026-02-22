import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not configured");
    }

    const { messages, moduleTitle, scenario, sessionNumber, customSystemPrompt, bankRole, lineOfBusiness }: PracticeChatRequest = await req.json();

    // Build department context block for Session 3
    const departmentName = getDepartmentName(lineOfBusiness);
    const departmentContext = (bankRole || departmentName) ? `
DEPARTMENT CONTEXT:
${departmentName ? `The user works in: ${departmentName}` : ""}
${bankRole ? `Their role: ${bankRole}` : ""}
Tailor your responses to be relevant to their department. Use terminology, examples, and realistic scenarios appropriate for their line of business.` : "";

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
${departmentContext}

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
${departmentContext}

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

3. BANKING REALISM:
   - Use appropriate banking terminology in your responses
   - If they ask you to draft something, draft it properly
   - If they ask for analysis, provide realistic analysis
   - Reference realistic regulatory frameworks (OCC, FDIC, etc.) when relevant
   - Use realistic but clearly fake data (Jane Doe, Acme Corp, etc.)

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
        model: "claude-sonnet-4-20250514",
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
