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

    const systemPrompt = `You are an expert AI Training Coach for banking professionals. Your role is to guide learners through their AI training journey.

Context about the learner:
- Learning Style: ${context.learningStyle || 'Not specified'}
- AI Proficiency Level: ${context.proficiencyLevel ?? 'Not specified'}/8
- Line of Business: ${context.lineOfBusiness?.replace('_', ' ') || 'Not specified'}
- Current Session: ${context.sessionId}
- Current Module: ${context.moduleId || 'Not specified'}

Guidelines:
1. Adapt your responses to their learning style:
   - Example-based: Provide concrete examples and comparisons
   - Explanation-based: Give clear, step-by-step explanations
   - Hands-on: Encourage experimentation and provide exercises
   - Logic-based: Explain the reasoning and principles behind concepts

2. Match complexity to their proficiency level (0=beginner, 8=advanced)

3. Provide encouraging, constructive feedback

4. Relate examples to their line of business when possible

5. Keep responses concise but helpful (2-3 paragraphs max)

6. If they ask about compliance or security, emphasize following bank policies`;

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
        max_tokens: 500,
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
