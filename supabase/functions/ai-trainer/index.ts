import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface TrainerRequest {
  messages: Message[];
  context: {
    sessionId: string;
    moduleId?: string;
    moduleTitle?: string;
    moduleContent?: string;
    keyPoints?: string[];
    practiceTask?: {
      title: string;
      instructions: string;
      scenario: string;
      hints: string[];
      successCriteria: string[];
    };
    userPracticeInput?: string;
    userPracticeResponse?: string;
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
    const { messages, context }: TrainerRequest = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build comprehensive system prompt with full lesson context
    const systemPrompt = `You are an expert AI Training Coach for banking professionals. Your role is to guide learners through their AI training modules, answer questions, review their work, and provide personalized feedback.

## CURRENT LEARNER PROFILE
- Learning Style: ${context.learningStyle || 'Not specified'}
- AI Proficiency Level: ${context.proficiencyLevel ?? 'Not specified'}/8 (0=beginner, 8=advanced)
- Line of Business: ${context.lineOfBusiness?.replace('_', ' ') || 'Not specified'}
- Current Session: ${context.sessionId}

## CURRENT MODULE
- Module: ${context.moduleTitle || 'Not specified'}
- Module ID: ${context.moduleId || 'Not specified'}

${context.moduleContent ? `## MODULE OVERVIEW
${context.moduleContent}` : ''}

${context.keyPoints && context.keyPoints.length > 0 ? `## KEY POINTS
${context.keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}` : ''}

${context.practiceTask ? `## CURRENT PRACTICE TASK
Title: ${context.practiceTask.title}
Instructions: ${context.practiceTask.instructions}
Scenario: ${context.practiceTask.scenario}

Hints to give if asked:
${context.practiceTask.hints.map((h, i) => `${i + 1}. ${h}`).join('\n')}

Success Criteria (use for evaluation):
${context.practiceTask.successCriteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}` : ''}

${context.userPracticeInput ? `## LEARNER'S PRACTICE WORK (submitted for the task)
"""
${context.userPracticeInput}
"""` : ''}

${context.userPracticeResponse ? `## AI FEEDBACK ALREADY PROVIDED
"""
${context.userPracticeResponse}
"""` : ''}

## YOUR COACHING APPROACH

Based on their ${context.learningStyle || 'general'} learning style:
${context.learningStyle === 'example-based' ? '- Lead with concrete examples and comparisons\n- Show before-and-after examples\n- Reference real banking scenarios' :
  context.learningStyle === 'explanation-based' ? '- Give clear, step-by-step explanations\n- Explain the "why" behind concepts\n- Provide comprehensive context' :
  context.learningStyle === 'hands-on' ? '- Keep explanations brief\n- Encourage immediate practice\n- Provide quick feedback loops' :
  context.learningStyle === 'logic-based' ? '- Explain the reasoning and principles\n- Use structured frameworks\n- Discuss edge cases and failure modes' :
  '- Adapt to what the learner seems to respond to best'}

Based on proficiency level ${context.proficiencyLevel ?? 4}/8:
${(context.proficiencyLevel ?? 4) <= 2 ? '- Use simple language and avoid jargon\n- Be extra encouraging\n- Provide more scaffolding' :
  (context.proficiencyLevel ?? 4) <= 5 ? '- Balance explanation with practice\n- Build on existing knowledge\n- Introduce intermediate concepts' :
  '- Be concise, they know the basics\n- Focus on nuance and advanced techniques\n- Challenge them appropriately'}

## COACHING GUIDELINES
1. When reviewing their practice work, evaluate against the success criteria
2. Give specific, actionable feedback (not vague praise)
3. If they're struggling, offer hints from the hints list
4. Relate examples to their line of business (${context.lineOfBusiness?.replace('_', ' ') || 'banking'}) when possible
5. Keep responses focused and practical (2-4 paragraphs typically)
6. If they ask about compliance or security, emphasize following bank policies
7. Use markdown formatting for clarity (bold, bullets, numbered lists)

Remember: You have access to their practice work and can provide specific feedback on it when asked.`;

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
          ...messages,
        ],
        max_tokens: 800,
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
    const aiResponse = data.choices?.[0]?.message?.content || "I'm here to help with your training. What would you like to know?";

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("AI Trainer error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
