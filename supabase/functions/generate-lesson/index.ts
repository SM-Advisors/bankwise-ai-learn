import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type LearningStyle = "visual" | "procedural" | "conceptual";

interface LessonRequest {
  department: string;
  topic: string;
  topicDescription: string;
  learningStyle: LearningStyle;
}

const learningStyleInstructions = {
  visual: `Format the lesson for VISUAL LEARNERS:
- Use diagrams described in text (e.g., "Diagram: [description of flowchart/framework]")
- Create bulleted visual structures with clear hierarchies
- Use frameworks and matrices where applicable
- Include visual metaphors and analogies
- Structure content with clear visual separation
- Use bullet points extensively with indentation to show relationships`,

  procedural: `Format the lesson for PROCEDURAL/STEP-BY-STEP LEARNERS:
- Use numbered steps throughout (Step 1, Step 2, etc.)
- Include checklists with clear action items
- Structure as "Do this → then this" flows
- Provide explicit sequential instructions
- Include decision trees with clear if/then logic
- Add verification checkpoints after key steps`,

  conceptual: `Format the lesson for CONCEPTUAL/STRATEGIC LEARNERS:
- Lead with mental models and principles
- Explain the "why" before the "how"
- Include strategic framing and context
- Discuss tradeoffs and considerations
- Connect to broader banking/finance principles
- Emphasize decision frameworks and judgment criteria`,
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

Your lessons are:
- Specific to banking workflows (never generic AI education)
- Focused on practical outputs employees can use immediately
- Tailored to the learning style requested
- Using only non-sensitive example data

${styleInstruction}

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

Include 3-5 sections in the lesson. Each section should be substantive (150-300 words).`;

    const userPrompt = `Create a training lesson for the ${department} department on the topic: "${topic}"

Topic Description: ${topicDescription}

The learner has a ${learningStyle} learning style. Structure the entire lesson accordingly.

Remember to:
1. Make all examples specific to banking/financial institution contexts
2. Include practical AI prompts or techniques they can use
3. Focus on the specific job output mentioned in the topic
4. Use only non-sensitive example data`;

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
        max_tokens: 4000,
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