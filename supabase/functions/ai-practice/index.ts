import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface PracticeRequest {
  prompt: string;
  context: {
    sessionId: string;
    moduleId?: string;
    moduleTitle?: string;
    taskTitle?: string;
    taskInstructions?: string;
    scenario?: string;
    successCriteria?: string[];
    learningStyle?: string;
    proficiencyLevel?: number;
    lineOfBusiness?: string;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, context }: PracticeRequest = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build evaluation system prompt
    const systemPrompt = `You are an AI Practice Evaluator for a banking AI training platform. Your job is to evaluate a learner's practice prompt/response and provide constructive feedback.

## LEARNER CONTEXT
- Learning Style: ${context.learningStyle || 'Not specified'}
- AI Proficiency Level: ${context.proficiencyLevel ?? 4}/8
- Line of Business: ${context.lineOfBusiness?.replace('_', ' ') || 'Banking'}
- Current Session: ${context.sessionId}
- Current Module: ${context.moduleTitle || 'Not specified'}

## PRACTICE TASK
Title: ${context.taskTitle || 'Practice Exercise'}
Instructions: ${context.taskInstructions || 'Complete the practice task'}
Scenario: ${context.scenario || 'General banking scenario'}

## SUCCESS CRITERIA
${context.successCriteria ? context.successCriteria.map((c, i) => `${i + 1}. ${c}`).join('\n') : 'Evaluate for clarity, specificity, and appropriateness'}

## YOUR EVALUATION APPROACH

1. **Acknowledge the effort** - Start with what they did well
2. **Evaluate against criteria** - Check each success criterion
3. **Provide specific feedback** - Point to exact parts that could improve
4. **Give actionable suggestions** - Concrete next steps, not vague advice
5. **Encourage iteration** - Suggest they refine and resubmit

Adapt your feedback style to their proficiency level:
- Level 0-2: Be very encouraging, explain concepts gently
- Level 3-5: Balance praise with constructive critique
- Level 6-8: Be direct, focus on nuance and advanced techniques

Format your response with clear sections using markdown.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Please evaluate the following practice submission for the task "${context.taskTitle || 'Practice Exercise'}":\n\n---\n${prompt}\n---\n\nProvide constructive feedback based on the success criteria.` },
        ],
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please contact your administrator." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "Your practice response has been received. The AI trainer can provide more detailed feedback.";

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("AI Practice error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
