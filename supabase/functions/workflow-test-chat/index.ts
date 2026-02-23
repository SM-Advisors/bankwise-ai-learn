import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders } from "../_shared/cors.ts";



interface Message {
  role: "user" | "assistant";
  content: string;
}

interface WorkflowStep {
  name: string;
  aiPromptTemplate: string;
  humanReview: boolean;
  outputDescription: string;
}

interface WorkflowTestRequest {
  workflowName: string;
  currentStep: WorkflowStep;
  currentStepIndex: number;
  totalSteps: number;
  messages: Message[];
  previousStepOutputs?: string[];
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

    const { workflowName, currentStep, currentStepIndex, totalSteps, messages, previousStepOutputs }: WorkflowTestRequest = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "messages array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build step-specific system prompt
    const systemPrompt = `You are an AI assistant executing Step ${currentStepIndex + 1} of ${totalSteps} in the "${workflowName}" workflow.

## YOUR CURRENT STEP
Step Name: ${currentStep.name}
Step ${currentStepIndex + 1} of ${totalSteps}
${currentStep.aiPromptTemplate ? `\nAI INSTRUCTIONS FOR THIS STEP:\n${currentStep.aiPromptTemplate}` : ""}
${currentStep.outputDescription ? `\nEXPECTED OUTPUT: ${currentStep.outputDescription}` : ""}

${previousStepOutputs && previousStepOutputs.length > 0 ? `## CONTEXT FROM PREVIOUS STEPS
${previousStepOutputs.map((output, i) => `Step ${i + 1} Output:\n${output}`).join("\n\n")}

Use the above context to inform your response for this step.` : ""}

## META-INSTRUCTIONS
1. STAY IN ROLE: You are the AI tool executing this specific workflow step. Follow the step instructions above.
2. BANKING REALISM: Use appropriate banking terminology. Reference realistic regulatory frameworks when relevant. Use realistic but clearly fake data (Jane Doe, Acme Corp, etc.).
3. STEP-SPECIFIC: Focus only on this step's task. Don't try to do the entire workflow in one response.
4. MIRROR PROMPT QUALITY: If the user provides vague input, give a generic response. If they provide specific input with context, give a detailed, tailored response.
5. OUTPUT FORMAT: Match the expected output description if one is provided.
6. Do NOT mention that this is a training exercise or test. Act as a real AI tool.`;

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
        model: "claude-sonnet-4-5",
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
    const reply = claudeResponse.content?.[0]?.text || "I'd be happy to help with this workflow step.";

    return new Response(
      JSON.stringify({ reply }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Workflow test chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
