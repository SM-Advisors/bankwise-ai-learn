import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type LearningStyle = "example-based" | "explanation-based" | "hands-on" | "logic-based";

interface LessonRequest {
  department: string;
  topic: string;
  topicDescription: string;
  learningStyle: LearningStyle;
}

// Based on the AI Training Interaction Preference Intake document
const learningStyleInstructions: Record<LearningStyle, string> = {
  "example-based": `Format the lesson for EXAMPLE-BASED LEARNERS (prefer examples or visuals):
- Show annotated AI outputs BEFORE providing instructions
- Include examples that highlight compliant vs. risky patterns
- Use visual prompt templates shown first
- Provide concrete before/after examples
- Include side-by-side comparisons of good vs. poor outputs
- Use annotated screenshots or output snippets described in text
- Structure: Show the example first, then explain what makes it work`,

  "explanation-based": `Format the lesson for EXPLANATION-BASED LEARNERS (prefer step-by-step guidance):
- Provide sequenced walkthroughs with clear numbered steps
- Explain rationale and policy logic explicitly at each step
- Include checklists that appear BEFORE hands-on tasks
- Use "Do this → then this" explicit flow
- Provide the "why" along with each "what"
- Include verification steps after key actions
- Structure: Explain the process, then demonstrate application`,

  "hands-on": `Format the lesson for HANDS-ON LEARNERS (prefer learning by doing):
- Place the learner directly into a safe practice task early
- Provide rapid feedback opportunities on their output
- Encourage iteration within defined guardrails
- Include practice exercises with immediate feedback points
- Minimize upfront reading—get to action quickly
- Provide scaffolded tasks that build complexity
- Structure: Brief context, then practice task, then feedback/refinement`,

  "logic-based": `Format the lesson for LOGIC-BASED LEARNERS (prefer rules and structure):
- Show decision logic and constraints EARLY, before examples
- Surface common failure modes up front
- Explain WHY certain prompts or outputs are rejected
- Include decision trees and rule frameworks
- Provide the underlying principles that govern success
- Map out edge cases and exception handling
- Structure: Rules and logic first, then application examples`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { department, topic, topicDescription, learningStyle }: LessonRequest = await req.json();

    if (!department || !topic || !learningStyle) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: department, topic, learningStyle" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const styleInstruction = learningStyleInstructions[learningStyle];

    const systemPrompt = `You are an expert AI training curriculum designer for financial institutions, specifically community and regional banks. You create practical, job-ready training content that teaches banking professionals how to apply AI in their specific roles.

IMPORTANT CONTEXT: This training adjusts HOW practice is delivered, not WHAT is taught. All learners are trained to the same behaviors, standards, and compliance expectations. The following never change regardless of learning style:
- Target workplace behaviors
- Compliance and data-handling rules
- Audit expectations and accountability
- Pass/fail success criteria

${styleInstruction}

Your lessons are:
- Specific to banking workflows (never generic AI education)
- Focused on practical outputs employees can use immediately
- Compliant with banking regulations and data privacy
- Using only non-sensitive, synthetic example data

IMPORTANT: You must respond with ONLY valid JSON matching this exact structure (no markdown, no code blocks, just raw JSON):
{
  "title": "string - lesson title",
  "objective": "string - what the learner will achieve",
  "estimatedTime": "string - e.g. '30 minutes'",
  "sections": [
    {
      "title": "string - section title",
      "content": "string - section content formatted according to the learning style"
    }
  ],
  "artifact": {
    "title": "string - what tangible output the learner will create",
    "description": "string - description of the artifact"
  }
}

Include 4-6 sections in the lesson. Each section should be substantive (200-400 words) and clearly follow the learning style format.`;

    const userPrompt = `Create a training lesson for the ${department} department on the topic: "${topic}"

Topic Description: ${topicDescription}

The learner has an ${learningStyle} learning style. Structure the ENTIRE lesson according to their preference—this affects presentation order, emphasis, and format, not the actual skills or compliance requirements taught.

Remember to:
1. Make all examples specific to banking/financial institution contexts
2. Include practical AI prompts or techniques they can use
3. Focus on the specific job output mentioned in the topic
4. Use only non-sensitive, synthetic example data
5. Ensure the format clearly reflects their learning style preference throughout`;

    console.log("Generating lesson for:", { department, topic, learningStyle });

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
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 5000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service quota exceeded. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "Failed to generate lesson. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error("No content in AI response:", data);
      return new Response(
        JSON.stringify({ error: "No lesson content generated" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Raw AI response content:", content.substring(0, 200));

    // Parse the JSON response
    let lesson;
    try {
      // Try to extract JSON from the response (in case AI added any extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        lesson = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse lesson JSON:", parseError, "Content:", content);
      return new Response(
        JSON.stringify({ error: "Failed to parse lesson content. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate required fields
    if (!lesson.title || !lesson.objective || !lesson.sections || !lesson.artifact) {
      console.error("Invalid lesson structure:", lesson);
      return new Response(
        JSON.stringify({ error: "Generated lesson has invalid structure. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Successfully generated lesson:", lesson.title);

    return new Response(
      JSON.stringify({ lesson }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-lesson function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});