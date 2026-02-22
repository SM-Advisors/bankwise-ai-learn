import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders } from "../_shared/cors.ts";



interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AgentTestChatRequest {
  systemPrompt: string;
  messages: Message[];
  agentId?: string;
  testType?: string;
}

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

    const { systemPrompt, messages, agentId, testType }: AgentTestChatRequest = await req.json();

    if (!systemPrompt || !messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "systemPrompt and messages array are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Wrap the user's system prompt in a meta-instruction envelope
    // This ensures the AI stays in character as a banking agent
    const wrappedSystemPrompt = `${systemPrompt}

---
META-INSTRUCTIONS (invisible to the end user — these govern your behavior):

1. STAY IN CHARACTER: You are the AI agent described above. Never break character or acknowledge that you are being "tested." Respond as if this is a real interaction with a banking professional.

2. BANKING REALISM: Use appropriate banking terminology. Reference realistic regulatory frameworks (OCC, FDIC, CFPB, etc.) when relevant. Use realistic but clearly fake data (Jane Doe, Acme Corp, Account #000-0000, etc.).

3. FOLLOW THE SYSTEM PROMPT FAITHFULLY:
   - If the system prompt defines an identity, use it
   - If tasks are listed, only perform those tasks
   - If output rules are specified, follow them precisely
   - If guard rails are defined, enforce them (redirect or decline as instructed)
   - If compliance anchors are listed, include those exact phrases in relevant outputs

4. MIRROR PROMPT QUALITY: The quality of your response should reflect the quality of the input prompt. Vague prompts get generic responses. Specific prompts get tailored responses.

5. RESPONSE LENGTH: Match response length to what a real AI agent would provide. Don't pad responses — be as concise as the task demands.

6. BE HONEST ABOUT LIMITATIONS: If asked to do something outside your defined tasks, handle it according to the guard rails. If no guard rail applies, politely redirect to your defined scope.`;

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
        system: wrappedSystemPrompt,
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
    const reply = claudeResponse.content?.[0]?.text || "I'd be happy to help. Could you provide more details?";

    console.log(`[agent-test-chat] Agent: ${agentId || "unknown"}, Type: ${testType || "freeform"}, Messages: ${messages.length}`);

    return new Response(
      JSON.stringify({ reply }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Agent test chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
