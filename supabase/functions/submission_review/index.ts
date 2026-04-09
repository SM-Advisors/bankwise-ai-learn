import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";
import { checkRateLimit } from "../_shared/rateLimiter.ts";



interface SubmissionReviewRequest {
  lessonId: string;
  moduleId?: string;
  isGateModule?: boolean;
  submission: string;
  trainerCoaching?: string;
  rubric?: string | Record<string, unknown>;
  agentTemplate?: {
    identity?: string;
    taskList?: Array<{ name: string; format: string; constraint: string }>;
    outputRules?: string[];
    guardRails?: Array<{ rule: string; alternative: string }>;
    complianceAnchors?: string[];
  };
  workflowData?: {
    trigger?: string;
    steps?: Array<{ name: string; aiPromptTemplate: string; humanReview: boolean; outputDescription: string }>;
    finalOutput?: string;
  };
  departmentContext?: {
    bankRole?: string;
    lineOfBusiness?: string;
    interests?: string[]; // F&F users: personal interests instead of department
  };
  learnerState?: {
    currentCardTitle?: string;
    learningObjectives?: string[];
    learningOutcome?: string;
    attemptNumber?: number;
    progressSummary?: string;
  };
}

interface LessonChunk {
  id: string;
  text: string;
  source: string | null;
  metadata: Record<string, unknown>;
}

interface GateResult {
  passed: boolean;
  criteriaMetCount: number;
  criteriaTotalCount: number;
  gateMessage: string;
  requiredToProgress?: string[];
  areasToStrengthen?: string[];
}

interface FeedbackResponse {
  feedback: {
    summary: string;
    strengths: string[];
    issues: string[];
    areasForImprovement?: string[];
    fixes: string[];
    next_steps: string[];
  };
  gateResult?: GateResult;
}

// Normalize learning style from DB to standard format
function normalizeLearningStyle(dbStyle: string | null): string {
  const styleMap: Record<string, string> = {
    "example-based": "example_based",
    "hands-on": "hands_on",
    "explanation-based": "explanation_based",
    "logic-based": "logic_based",
  };
  return styleMap[dbStyle || ""] || "explanation_based";
}

// Get learning style instructions for feedback
function getFeedbackStyleInstructions(style: string): string {
  const instructions: Record<string, string> = {
    example_based: `FEEDBACK STYLE: Example-Based
- Include a concrete example of an improved version for each issue
- Show "before/after" comparisons where helpful
- Use industry-specific examples relevant to the learner's work context`,
    
    explanation_based: `FEEDBACK STYLE: Explanation-Based
- Explain WHY each strength works well
- Provide detailed reasoning for each issue
- Include step-by-step guidance in fixes`,
    
    logic_based: `FEEDBACK STYLE: Logic-Based
- Frame feedback as logical rules and principles
- Include verification criteria for each fix
- Reference underlying frameworks`,
    
    hands_on: `FEEDBACK STYLE: Hands-On
- Keep explanations minimal
- Focus on actionable next steps
- Provide a quick exercise to apply the feedback`,
  };
  return instructions[style] || instructions.explanation_based;
}

// Get proficiency level instructions for feedback (0-8 scale)
function getProficiencyFeedbackInstructions(level: number | null): string {
  const proficiency = level ?? 3; // Default to intermediate if not set
  
  if (proficiency <= 2) {
    return `AI PROFICIENCY: Beginner (Level ${proficiency}/8)
- Use simple language in all feedback
- Define any AI terms you mention
- Be extra encouraging and supportive
- Provide very specific, step-by-step fixes
- Avoid overwhelming with too many issues at once`;
  } else if (proficiency <= 5) {
    return `AI PROFICIENCY: Intermediate (Level ${proficiency}/8)
- Use moderate technical language
- Assume basic understanding of prompts and AI behavior
- Balance encouragement with constructive criticism
- Can reference common prompt patterns`;
  } else {
    return `AI PROFICIENCY: Advanced (Level ${proficiency}/8)
- Use precise technical language
- Focus on nuance and optimization opportunities
- Can reference advanced techniques in suggestions
- Be more direct and concise in feedback
- Challenge with higher-level improvements`;
  }
}

interface OrgPolicy {
  id: string;
  title: string;
  content: string;
  summary: string | null;
  policy_type: string;
}

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

// Retrieve lesson content chunks from database (vector similarity with sequential fallback)
async function retrieveLessonContext(
  supabase: any,
  params: { lessonId: string; moduleId?: string; query: string; topK?: number }
): Promise<LessonChunk[]> {
  const { lessonId, moduleId, query: ragQuery, topK = 6 } = params;

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

// Retrieve active org policies (uses service role to bypass RLS since policies are institutional data)
async function retrieveOrgPolicies(supabaseUrl: string): Promise<OrgPolicy[]> {
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!serviceRoleKey) {
    console.error("SUPABASE_SERVICE_ROLE_KEY not available for policy retrieval");
    return [];
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey);
  const { data, error } = await adminClient
    .from("org_policies")
    .select("id, title, content, summary, policy_type")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Error retrieving org policies:", error);
    return [];
  }

  console.log(`Retrieved ${data?.length || 0} org policies`);
  return data || [];
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

    const requestBody: SubmissionReviewRequest = await req.json();
    const { lessonId, moduleId, isGateModule, submission, rubric, agentTemplate, workflowData, departmentContext, learnerState } = requestBody;

    if (!lessonId || !submission) {
      return new Response(
        JSON.stringify({ error: "lessonId and submission are required" }),
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

    // Get authenticated user ID
    let userId: string | null = null;

    if (authHeader?.startsWith("Bearer ")) {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (!authError && authUser?.id) {
        userId = authUser.id;
      }
    }

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Rate limiting
    if (userId) {
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (supabaseServiceKey) {
        const rateCheck = await checkRateLimit(supabaseUrl, supabaseServiceKey, userId, "submission_review");
        if (!rateCheck.allowed) {
          return new Response(
            JSON.stringify({ error: rateCheck.reason }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
    }

    // Fetch learning style and AI proficiency from user_profiles
    let learningStyle = "explanation_based";
    let aiProficiencyLevel: number | null = null;
    if (userId) {
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("learning_style, ai_proficiency_level")
        .eq("user_id", userId)
        .single();

      if (profile?.learning_style) {
        learningStyle = normalizeLearningStyle(profile.learning_style);
      }
      if (profile?.ai_proficiency_level !== undefined) {
        aiProficiencyLevel = profile.ai_proficiency_level;
      }
    }

    // Build RAG query from submission + rubric + card title
    const rubricText = typeof rubric === "string" ? rubric : JSON.stringify(rubric || {});
    const ragQuery = `${learnerState?.currentCardTitle || ""} ${submission.substring(0, 200)} ${rubricText.substring(0, 200)}`.trim();

    // Retrieve lesson context chunks
    const chunks = await retrieveLessonContext(supabase, {
      lessonId,
      moduleId,
      query: ragQuery,
      topK: 6,
    });

    // Retrieve organization policies
    const policies = await retrieveOrgPolicies(supabaseUrl);

    // Build context section from chunks
    let contextSection = "";
    if (chunks.length > 0) {
      contextSection = `## RETRIEVED LESSON CONTENT & CRITERIA
Use ONLY this information to evaluate the submission:

${chunks.map((chunk, i) => `[Chunk ${i + 1}]${chunk.source ? ` (Source: ${chunk.source})` : ""}
${chunk.text}`).join("\n\n")}

---`;
    } else {
      contextSection = `## NO SPECIFIC LESSON CONTENT AVAILABLE
Evaluate the submission based on general prompt engineering best practices.
Note in your feedback that specific lesson criteria were not available.`;
    }

    // Build organization policies section
    let policiesSection = "";
    if (policies.length > 0) {
      policiesSection = `## ORGANIZATION POLICIES & GUIDELINES
The following are the organization's official policies. Check submissions for compliance:

${policies.map((policy) => `### ${policy.title} (${policy.policy_type})
${policy.summary ? `**Summary:** ${policy.summary}\n` : ""}
${policy.content}`).join("\n\n")}

---`;
    }

    // Build system prompt
    const systemPrompt = `You are a strict but supportive AI Practice Reviewer for a professional AI training platform. Your job is to evaluate learner submissions and provide structured feedback.

${getFeedbackStyleInstructions(learningStyle)}

${getProficiencyFeedbackInstructions(aiProficiencyLevel)}

${contextSection}

${policiesSection}

${moduleId === "1-6" ? `## MODULE 1-6 RUBRIC: ITERATION
This submission tests the learner's ability to treat AI output as a starting draft and refine it through directed iteration rather than accepting or rejecting the first result.

3-LEVEL RUBRIC:
| Criterion | Developing | Proficient | Advanced |
|-----------|-----------|-----------|---------|
| Iteration Count | Single attempt only | 2 clear iterations with identifiable changes | 3+ iterations with a stated reason for each change |
| Change Specificity | Vague changes ("make it better") | Each follow-up identifies a specific gap in the previous output | Each change targets a specific element (tone, length, format, detail level) with explicit direction |
| Output Improvement | Output is not meaningfully better | Each iteration produces a measurable improvement | Final output is clearly superior to the first — and the learner can explain why |
| Diagnosis Skill | No diagnosis of what was wrong | Identifies the issue before asking for a fix | Diagnoses the root cause, not just a symptom (e.g., "the framing was wrong, not just the length") |

EVALUATION FOCUS:
- Does the submission show at least 2 distinct iterations, not just one prompt and one result?
- Does each iteration build on the previous one — or is the learner starting over?
- Is the learner diagnosing and directing, or just hoping the next attempt is better?
- Does the final output look like it was refined through deliberate effort?` : moduleId === "2-2" ? `## MODULE 2-2 RUBRIC: SELF-REVIEW LOOPS
This submission tests the learner's ability to build a two-prompt generate-then-critique workflow.

3-LEVEL RUBRIC:
| Criterion | Developing | Proficient | Advanced |
|-----------|-----------|-----------|---------|
| Two-Prompt Structure | Single prompt only | Clear generate + critique-revise sequence | Structured workflow with explicit handoff between generation and review |
| Checklist Quality | Fewer than 3 criteria | 5+ specific criteria relevant to the deliverable | Criteria use measurable ratings (Fully Met / Partially Met / Missing) |
| Criteria Specificity | Generic ("is it good?") | Criteria tied to the specific deliverable type | Criteria differentiate between formatting, accuracy, and completeness dimensions |
| Combined Coverage | Only checks formatting | Covers formatting and some content quality | Self-review covers formatting, completeness, tone, and flags factual items for human verification |

EVALUATION FOCUS:
- Does the learner actually prompt the AI to critique and revise its own output — not just ask a follow-up?
- Is the review checklist specific to the deliverable type (not generic)?
- Does the final output reflect the review — is it actually improved?
- Does the learner understand what AI can self-check vs. what requires human verification?` : moduleId === "1-7" ? `## MODULE 1-7 RUBRIC: SESSION 1 SANDBOX (CAPSTONE)
This is the Session 1 Sandbox. Evaluate the learner's independent application of Session 1 techniques to a real work task — no guided steps, no scaffolding.

3-LEVEL RUBRIC:
| Criterion | Weight | Developing | Proficient | Advanced |
|-----------|--------|-----------|-----------|---------|
| Real Work Application | 25% | Hypothetical or practice scenario | An actual work task they could use today | A task they have actually used AI for, with authentic context |
| Iteration | 25% | 1 version only | 2 iterations with identifiable changes | 3+ iterations with stated reasons for each refinement |
| Self-Review | 25% | No review applied | Critiqued the output before finalizing | Used a specific checklist or criterion set to improve the output |
| Output Quality | 25% | Generic or AI-flavored text | Usable in their actual work context | Production-quality — could be sent, saved, or acted on immediately |

EVALUATION FOCUS:
- Is this a real work task, not a training exercise invented for the assignment?
- Are there at least 2 iterations showing directed improvement?
- Did the learner apply any form of self-review before submitting?
- Would the final output hold up in a real professional context?` : moduleId === "2-3" ? `## MODULE 2-3 RUBRIC: STRUCTURED PROMPTING (CLEAR FRAMEWORK)
This submission tests the learner's ability to apply the CLEAR Framework to write a precise, structured prompt for a specific, high-stakes, or complex task.

CLEAR Framework: Context → Length/Format → Examples → Audience → Requirements

3-LEVEL RUBRIC:
| Criterion | Developing | Proficient | Advanced |
|-----------|-----------|-----------|---------|
| Context (C) | Missing or generic ("I work in finance") | Specific role, department, and task established | Context explains the situation, constraints, and why the task matters |
| Length/Format (L) | No format specified | Output format and approximate length defined | Format specification includes structure, sections, and constraints on what to exclude |
| Examples (E) | No examples provided | 1 relevant example showing the desired style/format | Examples demonstrate both what to include AND what to avoid |
| Audience (A) | No audience specified | Audience identified (e.g., "branch manager") | Audience specification includes knowledge level, decision role, and what they need to act |
| Requirements (R) | No explicit requirements | 2+ requirements listed | Requirements are specific, testable, and ranked by priority |
| Professional Relevance | Generic prompt with no work context | Task uses appropriate professional terminology | Real task from their actual work — usable without modification |

EVALUATION FOCUS:
- Are all 5 CLEAR elements present — Context, Length/Format, Examples, Audience, Requirements?
- Are elements specific to the learner's professional context, not generic placeholders?
- Does the prompt produce a different (better) output than a casual ask would?
- Are requirements specific enough that the learner could tell if they were met?` : moduleId === "2-5" ? `## MODULE 2-5 RUBRIC: OUTLINE EXPANDER
This submission tests the learner's ability to provide a structural skeleton and let the AI fill in the substance — controlling shape while delegating content.

3-LEVEL RUBRIC:
| Criterion | Developing | Proficient | Advanced |
|-----------|-----------|-----------|---------|
| Outline Structure | No outline provided, or just a single topic with no sections | 4–7 distinct sections with clear headers or labels | Sections are logically ordered, each with a one-line description of scope |
| Delegation of Substance | Learner wrote most of the content themselves | AI was asked to expand the outline into detailed content | AI expanded each section and learner iterated on the structure (added, removed, or reordered sections) |
| Iteration | Single prompt, no revision | At least one structural revision (add/remove/reorder a section) | Multiple structural iterations that show the learner controlling the shape, not just accepting the first result |
| Work Relevance | Generic or hypothetical document | Document is tied to a real professional task (report, memo, proposal, training material, plan) | Document is immediately usable in the learner's actual work context |
| Outline + Template Combination | No output format specified | Some format guidance given (e.g., "as a memo") | Explicitly combined outline control with an output template for full structural and format control |

EVALUATION FOCUS:
- Did the learner provide the skeleton and let the AI fill in the substance — or did they write the content themselves?
- Did the learner iterate on the structure, not just the content?
- Is the document relevant to their actual professional context?
- Bonus: did they combine the Outline Expander with output templating for maximum control?` : moduleId === "2-6" ? `## MODULE 2-6 RUBRIC: MULTI-SHOT PROMPTING
This submission tests the learner's ability to use examples to teach an AI consistent output patterns.

3-LEVEL RUBRIC:
| Criterion | Developing | Proficient | Advanced |
|-----------|-----------|-----------|---------|
| Example Count & Consistency | Fewer than 3 examples or inconsistent format | 3 examples with consistent structure across all | 3+ examples that demonstrate both invariants and meaningful variation |
| Format Invariants | No identifiable pattern | Clear structural pattern repeats across examples | Pattern is explicit with annotation of what must stay constant |
| Compliance/Quality Element | No quality element present | At least 1 quality or compliance element appears in all examples | Elements are varied but consistently present across examples |
| Annotations | No annotations | Annotations explain why each example was selected | Annotations highlight what the AI should learn from each example |
| Request Specificity | Vague request for "more like this" | Request is specific and different from the examples | Request tests whether the AI learned the pattern, not just repeated it |

EVALUATION FOCUS:
- Do the examples teach a reusable pattern, not just provide templates?
- Is there enough variation to prevent overfitting to one scenario?
- Does the new request test pattern recognition — not just produce another copy of the examples?` : moduleId === "2-8" ? `## MODULE 2-8 RUBRIC: CHAIN-OF-THOUGHT REASONING
This submission tests the learner's ability to design multi-step reasoning prompts that produce auditable, traceable analysis.

3-LEVEL RUBRIC:
| Criterion | Developing | Proficient | Advanced |
|-----------|-----------|-----------|---------|
| Step Structure | Fewer than 3 steps, loosely connected | 5 structured steps with clear instructions for each | Steps build logically with explicit dependencies between them |
| Cross-Referencing | Steps are independent silos | Later steps reference outputs from earlier steps | Each step cites specific upstream data it depends on |
| Individual Evaluation | Elements treated as a single block | Each element evaluated individually before cross-analysis | Individual evaluations include thresholds and contextual interpretation |
| Confidence & Justification | No confidence indicator | Final assessment includes a confidence level | Confidence level includes justification tied to evidence quality |
| Auditability | Could not trace reasoning | Major conclusions traceable to source steps | Examiner could trace each conclusion to its specific source |

EVALUATION FOCUS:
- Does the prompt force sequential reasoning rather than a single-pass summary?
- Are step dependencies explicit (e.g., "Using the analysis from Step 2, evaluate...")?
- Would someone else be able to audit the chain of reasoning?
- Does the final output look different from what a single-step prompt would produce?` : moduleId === "2-9" ? `## MODULE 2-9 RUBRIC: WEB SEARCH
This submission tests the learner's ability to know when to turn web search on versus off — and to articulate the trade-off.

3-LEVEL RUBRIC:
| Criterion | Developing | Proficient | Advanced |
|-----------|-----------|-----------|---------|
| Toggle Usage | Never toggled web search, or left it on/off for everything | Toggled web search on and off for different prompts | Toggled deliberately with a clear reason for each state |
| ON Identification | Cannot identify when search adds value | Correctly identifies at least one task that benefits from web search (current data, recent events, live info) | Identifies multiple categories where search is essential and explains why |
| OFF Identification | Assumes search is always better | Correctly identifies at least one task where search is unnecessary (drafting, brainstorming, analysis) | Explains the cost of unnecessary search (latency, noise, distraction from reasoning) |
| Comparison | No comparison attempted | Compared at least one prompt with search on vs. off | Articulated specific differences in response quality, speed, or source relevance |
| Source Awareness | Accepts all search results uncritically | Notes that search results vary in quality | Identifies when a search result should be verified against a trusted source |

EVALUATION FOCUS:
- Did the learner actually toggle web search during the conversation?
- Can they explain WHY search was on or off for a specific prompt — not just that it was?
- Did they compare the same or similar prompt both ways?
- Do they understand the trade-off: grounding vs. noise, accuracy vs. speed?
- Did they verify or question any search-generated facts?` : moduleId === "2-10" ? `## MODULE 2-10 RUBRIC: SESSION 2 SANDBOX (CAPSTONE)
This is the Session 2 Sandbox. Evaluate independent application of Session 2 techniques to a real work task — structured prompting, output templating, multi-shot, chain-of-thought, or tool selection.

3-LEVEL RUBRIC:
| Criterion | Weight | Developing | Proficient | Advanced |
|-----------|--------|-----------|-----------|---------|
| Real Work Application | 25% | Hypothetical scenario | A real task from their actual work | A task they have iterated on, with authentic professional context |
| Technique Application | 35% | Session 1 techniques only | At least 1 Session 2 technique applied correctly | 2+ Session 2 techniques applied intentionally with rationale for each |
| Output Quality | 25% | AI-flavored generic text | Usable output for their actual work | Production-quality output — specific, professional, ready to use |
| Reflection | 15% | No reflection | Names the technique(s) they used | Explains WHY each technique choice improved the output |

EVALUATION FOCUS:
- Is this a real work task that would benefit from the structured techniques in Session 2?
- Is at least one Session 2 technique applied correctly (not just mentioned)?
- Does the output reflect the technique — not just a well-worded prompt?
- Can the learner articulate which technique they used and why it helped?` : moduleId === "3-3" ? `## MODULE 3-3 RUBRIC: BUILDING YOUR FIRST SKILL
This submission tests the learner's ability to build a complete skill with all six anatomy components.

3-LEVEL RUBRIC:
| Criterion | Weight | Developing | Proficient | Advanced |
|-----------|--------|-----------|-----------|---------|
| Identity | 15% | Generic or vague role | Clear role with scope and audience | Detailed identity with task scope, tone, and domain context |
| Trigger Definition | 10% | No trigger defined | Trigger described in general terms | Specific, testable trigger condition that maps to real work events |
| Procedure Completeness | 25% | Vague instructions | Step-by-step procedure that can be followed | Procedure handles variations and edge cases with decision logic |
| Standards Specificity | 15% | No standards or generic quality language | At least 2 specific output standards | Standards are measurable and testable — not aspirational |
| Guardrails Testability | 25% | No guardrails or vague aspirations | At least 2 specific guardrails with clear boundaries | Guardrails are testable: you can verify whether each one held or was violated |
| Output Format Clarity | 10% | No output format specified | Output format described in general terms | Output format includes structure, length, and content requirements |

EVALUATION FOCUS:
- Does the skill address a specific, real task — not a generic "helpful assistant"?
- Is the procedure detailed enough for the skill to produce consistent output?
- Are guardrails specific and testable — not vague aspirational statements?
- Would this skill produce useful output for the learner's actual work?` : moduleId === "3-4" ? `## MODULE 3-4 RUBRIC: ADDING KNOWLEDGE TO YOUR SKILL
This submission tests the learner's ability to give a skill domain knowledge that makes it a genuine specialist.

3-LEVEL RUBRIC:
| Criterion | Weight | Developing | Proficient | Advanced |
|-----------|--------|-----------|-----------|---------|
| Knowledge Source Selection | 30% | Generic or irrelevant source | Relevant document or reference for the skill's domain | Source directly addresses the task types the skill handles |
| Integration Quality | 40% | Source added without instructions for use | Skill output references the knowledge appropriately | Skill told which tasks require the knowledge, which don't, and how to cite it |
| Before/After Comparison | 30% | No comparison provided | Notes that output improved with knowledge | Specific before/after examples showing how knowledge changed the quality |

EVALUATION FOCUS:
- Does the knowledge source actually match the skill's tasks?
- Would the skill behave differently with vs. without this knowledge?
- Can the learner articulate the specific improvement knowledge provides?` : moduleId === "3-5" ? `## MODULE 3-5 RUBRIC: SKILLS + PROJECTS
This submission tests the learner's ability to combine skills and projects into a working configuration.

3-LEVEL RUBRIC:
| Criterion | Weight | Developing | Proficient | Advanced |
|-----------|--------|-----------|-----------|---------|
| Combination Quality | 30% | Skill and project loosely related | Skill integrated into project with clear purpose | Skill and project complement each other — the combination is more powerful than either alone |
| Reusability Test | 40% | Skill only works in one context | Skill tested in at least 2 different project contexts | Skill produces consistent quality across multiple contexts with evidence |
| Configuration Roadmap | 30% | No roadmap or vague intentions | Plan for 1-2 additional skills or projects | Prioritized roadmap with rationale for what to build next based on impact |

EVALUATION FOCUS:
- Does the skill work well inside the project context?
- Has the learner tested the skill in more than one scenario?
- Is the roadmap specific and prioritized by impact?` : moduleId === "3-6" ? `## MODULE 3-6 RUBRIC: SHARING AND SCALING
This submission tests the learner's ability to share skills, collect feedback, and identify domain expertise for scaling.

3-LEVEL RUBRIC:
| Criterion | Weight | Developing | Proficient | Advanced |
|-----------|--------|-----------|-----------|---------|
| Peer Feedback Quality | 30% | No peer feedback collected | Feedback collected from at least one peer with specific observations | Feedback led to at least one concrete improvement in the skill |
| Skill Wish List Specificity | 40% | Vague list of potential skills | At least 3 specific skills with defined tasks and domains | Skills prioritized by impact with clear rationale for sequencing |
| Domain Expertise Identification | 30% | No domain expertise considered | Identifies at least one colleague whose expertise could improve a skill | Specific plan for extracting and encoding domain expertise into skill knowledge |

EVALUATION FOCUS:
- Did peer testing reveal something the learner missed?
- Is the skill wish list specific enough to act on?
- Does the learner understand how domain expertise maps to skill knowledge?` : moduleId === "3-7" && agentTemplate ? `## MODULE 3-7 RUBRIC: SESSION 3 SANDBOX (SKILLS & PROJECTS CAPSTONE)
This is the Session 3 Sandbox / Capstone — the learner's skills and project configuration for actual use. Evaluate as a real deliverable, not a practice exercise.

3-LEVEL RUBRIC:
| Criterion | Weight | Developing | Proficient | Advanced |
|-----------|--------|-----------|-----------|---------|
| Identity | 15% | Generic role | Role-specific with clear audience and purpose | Detailed persona with task scope, tone, and output style defined |
| Task List | 20% | 1 vague task | 2+ specific, actionable tasks | 3+ tasks with format, constraint, and edge case handling |
| Guard Rails | 25% | 0-1 generic rails | 2+ rails with specific alternatives | 3+ rails covering out-of-scope, sensitive topics, and compliance edge cases |
| Knowledge/Project Integration | 20% | Not used | Skill has knowledge or is integrated into a project | Extensions are purposeful — each one closes a specific gap |
| Real-Work Readiness | 20% | Practice scenario | Skill could be used for real tasks | Skill is configured for work the learner actually does — and they plan to use it |

AGENT TEMPLATE DATA:
${agentTemplate.identity ? `Identity: "${agentTemplate.identity}"` : "Identity: MISSING"}
Tasks: ${agentTemplate.taskList?.filter(t => t.name).length || 0} defined${agentTemplate.taskList?.filter(t => t.name).map(t => ` (${t.name})`).join(",") || ""}
Output Rules: ${agentTemplate.outputRules?.filter(r => r.trim()).length || 0} defined
Guard Rails: ${agentTemplate.guardRails?.filter(g => g.rule.trim()).length || 0} defined
Compliance Anchors: ${agentTemplate.complianceAnchors?.filter(a => a.trim()).length || 0} defined

EVALUATION FOCUS:
- Is this a skill the learner actually plans to use — not just a training exercise?
- Does the skill definition reflect Session 3 concepts (identity, procedure, standards, guardrails, knowledge)?
- Are guard rails specific to the skill's role and realistic edge cases?
- Would a colleague be able to use this skill for the same tasks?` : moduleId === "4-2" ? `## MODULE 4-2 RUBRIC: AGENTS AS SKILL ORCHESTRATORS
This submission tests the learner's ability to design an agent wrapper around an existing skill with all six anatomy components.

3-LEVEL RUBRIC:
| Criterion | Weight | Developing | Proficient | Advanced |
|-----------|--------|-----------|-----------|---------|
| Six Anatomy Components | 25% | Missing 2+ components | All six components present (skills, triggers, decision logic, guardrails, escalation, audit trail) | All six components are detailed and internally consistent |
| Guardrail Testability | 25% | Vague aspirational statements | Guardrails are specific and verifiable | Guardrails include test scenarios that would verify each one |
| Escalation Path Specificity | 20% | Just says "escalate" | Specifies when to escalate and to whom | Specifies what information the agent provides during handoff |
| Audit Trail Completeness | 15% | No audit trail or vague logging | Specifies what gets logged | Logs enough to reconstruct any decision the agent made |
| Trigger Definition Clarity | 15% | No clear trigger | Trigger is defined in general terms | Trigger is specific, testable, and maps to a real event |

EVALUATION FOCUS:
- Are all six agent anatomy components present and coherent?
- Are guardrails specific and testable — not vague aspirational statements?
- Is the escalation path detailed enough to be actionable?
- Could you reconstruct the agent's decisions from the audit trail?` : moduleId === "4-3" ? `## MODULE 4-3 RUBRIC: BUILD A WORKING AGENT
This submission tests the learner's ability to build and test an agent across four scenario types.

3-LEVEL RUBRIC:
| Criterion | Weight | Developing | Proficient | Advanced |
|-----------|--------|-----------|-----------|---------|
| Normal Test Pass | 20% | Agent does not complete normal tasks | Agent completes normal case tasks correctly | Agent handles normal tasks efficiently with high-quality output |
| Edge Test Handling | 20% | Edge cases not tested | Agent handles edge cases or escalates appropriately | Agent's decision logic for edge cases is documented and consistent |
| Out-of-Scope Refusal | 25% | Agent attempts out-of-scope tasks | Agent refuses or escalates out-of-scope tasks | Agent provides clear explanation of why the task is out of scope |
| Guardrail Hold | 25% | Guardrails not tested or they fail | Guardrails hold under deliberate testing | Multiple guardrail test scenarios documented, all passing |
| Iteration Evidence | 10% | No iteration documented | At least one change made based on test results | Multiple iterations with documented before/after improvements |

EVALUATION FOCUS:
- Did the learner run all four test types?
- Do guardrails hold under deliberate testing — not just normal use?
- Is there evidence of iteration based on test failures?
- Would this agent be safe to deploy based on the test results?` : moduleId === "4-5" ? `## MODULE 4-5 RUBRIC: GOVERNANCE AND COMPLIANCE
This submission tests the learner's ability to write a governance brief covering all six framework components.

3-LEVEL RUBRIC:
| Criterion | Weight | Developing | Proficient | Advanced |
|-----------|--------|-----------|-----------|---------|
| Six Governance Components | 30% | Missing 2+ components | All six present (Authorization, Monitoring, Audit Trail, Exception Handling, Review Cadence, Kill Switch) | All six are detailed with specific owners, timelines, and criteria |
| Audit Trail Specificity | 25% | Vague logging described | Specifies what gets logged and retention period | Logs include decision reconstruction capability and compliance-ready format |
| Kill Switch Definition | 15% | No kill switch or vague emergency plan | Specifies who can disable and how | Includes both manual disable and automatic shutdown triggers |
| Approval Chain Identification | 15% | No approval chain | Identifies who would need to approve | Maps to existing organizational processes (change management, model risk, etc.) |
| Review Cadence Definition | 15% | No review schedule | Specifies a review frequency | Review cadence tied to specific triggers (policy changes, incident reports, quarterly cycle) |

EVALUATION FOCUS:
- Does the governance brief cover all six components?
- Is the audit trail specific enough for regulatory examination?
- Is the kill switch accessible and clearly defined?
- Does the learner know who in their organization would approve this?` : moduleId === "5-1" ? `## MODULE 5-1 RUBRIC: WHAT ARE FUNCTIONAL AGENTS?
This submission tests the learner's ability to identify functional agents in tools they already use and assess when to use them vs. building a custom skill or agent.

3-LEVEL RUBRIC:
| Criterion | Developing | Proficient | Advanced |
|-----------|-----------|-----------|---------|
| Tool Identification | Identifies AI features without calling them agents | Correctly identifies 2+ functional agents in existing tools | Identifies functional agents with specific capability descriptions and use cases |
| Custom vs. Functional Distinction | Confused about the difference | Correctly distinguishes when to use each type | Explains the decision threshold: task specificity, frequency, compliance sensitivity |
| Use Case Relevance | Hypothetical use cases | Use cases from their actual daily work | Use cases ranked by effort-to-value ratio with implementation readiness |
| Limitation Awareness | Lists only benefits | Identifies at least 1 meaningful limitation | Limitations include data privacy considerations and what functional agents cannot do |

EVALUATION FOCUS:
- Does the learner correctly name specific functional agents (not generic "AI features")?
- Is the custom vs. functional distinction correctly applied to their actual work context?
- Are limitations specific — not just "it might make mistakes"?` : moduleId === "5-2" ? `## MODULE 5-2 RUBRIC: AI IN YOUR SPREADSHEET
This submission tests the learner's ability to use AI features in their spreadsheet tool to accelerate data work.

3-LEVEL RUBRIC:
| Criterion | Developing | Proficient | Advanced |
|-----------|-----------|-----------|---------|
| Task Selection | Generic or hypothetical data task | A real data task from their actual work | A data task that was previously slow, error-prone, or avoided |
| AI Feature Application | Describes the feature without using it | Documents a specific AI feature used for a specific task | Documents the before/after with a clear description of what the AI did vs. what they reviewed |
| Output Verification | No verification described | Notes that output should be checked | Identifies specific values or patterns that require manual verification |
| Reusability | One-time use | Describes how to repeat the same task | Creates a reusable pattern or formula they can apply to future similar data |

EVALUATION FOCUS:
- Is this a real data task, not a demo or constructed example?
- Is the AI feature applied to a task where it provides genuine value?
- Does the learner verify critical outputs — not just trust the AI result?
- Would they be able to repeat this workflow without step-by-step guidance?` : moduleId === "5-3" ? `## MODULE 5-3 RUBRIC: AI IN YOUR PRESENTATIONS
This submission tests the learner's ability to use AI features in their presentation tool to accelerate slide creation and improve quality.

3-LEVEL RUBRIC:
| Criterion | Developing | Proficient | Advanced |
|-----------|-----------|-----------|---------|
| Task Selection | Generic slide content | A real presentation task from their work | A presentation that was actually needed — or one they are working on now |
| AI Feature Application | Describes the feature in theory | Applies AI to a specific slide or section | Applies AI to multiple stages (structure, content, visual, speaker notes) |
| Voice & Brand Preservation | No mention of review or editing | Notes that AI-generated content was reviewed | Identifies specific edits made to align AI output with their voice and brand |
| Time/Quality Assessment | No comparison | Notes it was faster or higher quality | Honest comparison: faster AND what they had to fix before it was usable |

EVALUATION FOCUS:
- Was the AI applied to a real presentation need?
- Did the learner review and edit the AI output — or just accept it?
- Is there evidence that the final output was usable in a professional context?` : moduleId === "5-4" ? `## MODULE 5-4 RUBRIC: AI IN YOUR INBOX
This submission tests the learner's ability to use AI features in their email client for routine communications while maintaining professional voice.

3-LEVEL RUBRIC:
| Criterion | Developing | Proficient | Advanced |
|-----------|-----------|-----------|---------|
| Task Selection | Generic email scenarios | A real email task from their work (drafting, summarizing, or triaging) | A task where AI handling would save meaningful time — and they applied it |
| AI Feature Application | Describes the feature without using it | Documents a specific feature applied to a specific email task | Documents multiple task types: drafting, summarizing, and identifying action items |
| Voice Preservation | No mention of editing | Notes that the draft was edited for voice | Identifies specific AI-generated phrases they changed to match their professional style |
| Compliance & Sensitivity | No mention of sensitive content | Notes what NOT to use AI for in their email context | Specific exclusions: client data, regulatory communications, sensitive internal topics |

EVALUATION FOCUS:
- Is this a real email task from their actual work?
- Did they edit the AI output to match their voice — or send it unedited?
- Do they understand what email tasks should NOT be delegated to AI?` : moduleId === "5-5" ? `## MODULE 5-5 RUBRIC: SESSION 5 SANDBOX (FUNCTIONAL AGENTS)
This is the Session 5 Sandbox. Evaluate the learner's practical integration of functional agents into their daily workflow.

3-LEVEL RUBRIC:
| Criterion | Weight | Developing | Proficient | Advanced |
|-----------|--------|-----------|-----------|---------|
| Tool Selection | 25% | Identifies tools without clear rationale | Selects the 1-2 functional agents most relevant to their work | Ranks agents by time savings and selects based on real task frequency |
| Integration Plan | 30% | Vague intention to use AI tools | Specific plan for which tasks each agent handles | Plan includes what they will stop doing manually, what they will verify, and a 1-week trial |
| Limitation Awareness | 20% | Only benefits identified | At least 1 meaningful limitation per tool acknowledged | Clear boundary: which tasks stay manual and why |
| Reflection on Custom vs. Functional | 25% | Not addressed | Identifies at least 1 task where a custom skill or agent (Sessions 3-4) would be better | Articulates the threshold: complexity, specificity, or frequency that tips toward custom |

EVALUATION FOCUS:
- Are the selected tools actually used in the learner's daily work?
- Is the integration plan specific enough to execute without additional guidance?
- Does the learner understand the boundary between functional and custom skills/agents?
- Is there honest acknowledgment of what AI tools cannot do for this person's specific work?` : moduleId === "6-2" && workflowData ? `## MODULE 6-2 RUBRIC: DESIGN YOUR WORKFLOW
This submission is a multi-step AI workflow. Evaluate COMPLETENESS and QUALITY of the workflow design.

SCORING WEIGHTS:
- Trigger (15%): Clear, specific event that starts the workflow
- Steps (30%): At least 3 distinct steps with clear AI + human roles
- Review Checkpoints (25%): At least 2 human review points built into the sequence
- Prompt Templates (20%): Each step has a clear AI prompt template that could be used immediately
- Final Output (10%): Clear description of the deliverable

WORKFLOW DATA:
Trigger: ${workflowData.trigger || "MISSING"}
Steps: ${workflowData.steps?.filter(s => s.name).length || 0} defined${workflowData.steps?.filter(s => s.name).map(s => ` (${s.name}${s.humanReview ? " [review]" : ""})`).join(",") || ""}
Review Checkpoints: ${workflowData.steps?.filter(s => s.humanReview && s.name).length || 0}
Final Output: ${workflowData.finalOutput || "MISSING"}

EVALUATION FOCUS:
- Is the trigger specific to a real event in the learner's work?
- Do steps alternate between AI work and human review — not all AI in sequence?
- Are prompt templates specific enough to use immediately?
- Would this workflow be reusable by a colleague without additional explanation?
- Does the workflow include a review checkpoint before any output leaves the team?` : `## RUBRIC
${rubric ? (typeof rubric === "string" ? rubric : JSON.stringify(rubric, null, 2)) : "Evaluate based on clarity, specificity, context, and appropriateness for the learner's professional use cases."}`}

${departmentContext?.lineOfBusiness ? `## DEPARTMENT CONTEXT
The learner works in: ${departmentContext.lineOfBusiness === "accounting_finance" ? "Accounting & Finance" : departmentContext.lineOfBusiness === "credit_administration" ? "Credit Administration" : departmentContext.lineOfBusiness === "executive_leadership" ? "Executive & Leadership" : departmentContext.lineOfBusiness}
${departmentContext.bankRole ? `Their role: ${departmentContext.bankRole}` : ""}
Evaluate whether the submission is relevant to their department. Note if examples and terminology are appropriate for their line of business.` : departmentContext?.interests?.length ? `## LEARNER CONTEXT (PERSONAL USER)
This learner is not an enterprise user. Their interests are: ${departmentContext.interests.join(", ")}.
Do NOT penalize them for lacking industry-specific terminology. Instead, evaluate whether they demonstrate understanding of the core AI concepts in the module. Credit creative use of analogies drawn from their interests.` : ""}

## SUBMISSION CONTEXT
- Lesson ID: ${lessonId}
${moduleId ? `- Module ID: ${moduleId}` : ""}
${learnerState?.currentCardTitle ? `- Task: ${learnerState.currentCardTitle}` : ""}
${learnerState?.learningOutcome ? `- Module Goal: ${learnerState.learningOutcome}` : ""}
${learnerState?.learningObjectives?.length ? `- This Module's Objectives (evaluate whether submission demonstrates these):\n${learnerState.learningObjectives.map((o: string) => `  • ${o}`).join("\n")}` : ""}
${learnerState?.attemptNumber ? `- Attempt #${learnerState.attemptNumber}` : ""}

## CRITICAL RULES
1. Return ONLY valid JSON matching the exact schema below - no extra keys, no markdown wrapping
2. Evaluate ONLY against the learning objectives and task instructions listed in SUBMISSION CONTEXT above. If the RETRIEVED LESSON CONTENT references objectives from a different module or session, IGNORE those — only use content that directly relates to THIS module's task.
3. Be specific - reference exact parts of the submission
4. Balance praise with constructive criticism
5. Tailor language complexity to the ${learningStyle.replace("_", "-")} learning style
6. If lesson content is missing, evaluate based on the learning objectives and task listed in SUBMISSION CONTEXT above
7. Check submissions for compliance with ORGANIZATION POLICIES - flag any potential violations
8. If the submission touches on data handling, AI usage, or security, verify alignment with organizational guidelines
9. NEVER require criteria from other modules. If a criterion mentions concepts not taught in this module's task, it belongs in "areasForImprovement" (informational), NOT in "issues" or "requiredToProgress"

## REQUIRED OUTPUT FORMAT (strict JSON, no extra keys)
${isGateModule ? `{
  "feedback": {
    "summary": "2-3 sentence overall assessment",
    "strengths": ["specific thing done well", "another strength"],
    "issues": ["ONLY issues that directly violate the task criteria or learning objectives listed above"],
    "areasForImprovement": ["optional observations that go beyond the task criteria — nice-to-know but NOT required to pass"],
    "fixes": ["actionable fix for each issue listed above (task-criteria issues only)"],
    "next_steps": ["what to try next", "suggested improvement"]
  },
  "gateResult": {
    "passed": true or false,
    "criteriaMetCount": number of learning objectives clearly demonstrated in the submission,
    "criteriaTotalCount": total number of learning objectives for this module,
    "gateMessage": "1-2 sentences explaining the gate decision — what was strong or what must be demonstrated to pass",
    "requiredToProgress": ["blocking criteria not yet met — ONLY include if passed=false"],
    "areasToStrengthen": ["non-blocking growth areas — include regardless of pass/fail"]
  }
}

GATE EVALUATION RULES:
- Evaluate each learning objective listed under "This Module's Objectives" above
- passed = true if criteriaMetCount >= 50% of criteriaTotalCount (round up) AND no critical compliance issues are present
- For Session 1 early modules (lesson ID "1", modules like 1-1, 1-2, 1-3): be LENIENT. These are introductory and the learner is just getting started. If they show genuine effort and basic engagement with the task, pass them. Do not require perfection for foundational modules.
- If this is attempt #2 or higher, be MORE lenient — the learner has already received feedback and is trying again. Give credit for effort and improvement over the prior attempt.
- The submission must show actual engagement with the task, not just awareness of the topic
- Be supportive — the goal is to help learners progress, not to block them on technicalities
- CRITICAL DISTINCTION: Only flag as "issues" things that directly fail the task criteria for THIS module. Everything else (general best practices, advanced techniques not yet taught, style preferences) should go in "areasForImprovement" — these are informational and do NOT block the learner from passing. The learner should be able to read them, learn from them, and still move forward.` : `{
  "feedback": {
    "summary": "2-3 sentence overall assessment",
    "strengths": ["specific thing done well", "another strength"],
    "issues": ["ONLY issues that directly violate the task criteria for this module"],
    "areasForImprovement": ["optional observations beyond the task criteria — informational, not blocking"],
    "fixes": ["actionable fix for each issue (task-criteria issues only)"],
    "next_steps": ["what to try next", "suggested improvement"]
  }
}`}`;

    // Call Claude API
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 1200,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: `Please review this submission and provide structured JSON feedback:\n\n---\n${submission}\n---`,
          },
        ],
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
    const responseText = claudeResponse.content?.[0]?.text || "";

    // Parse JSON from Claude's response
    let feedbackData: FeedbackResponse;
    try {
      // Try to extract JSON from the response (handle potential markdown wrapping)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        feedbackData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse Claude response:", responseText);
      // Return a fallback structured response
      feedbackData = {
        feedback: {
          summary: "Your submission has been reviewed. The AI was unable to provide structured feedback at this time.",
          strengths: ["You completed the practice task"],
          issues: ["Unable to parse detailed feedback"],
          fixes: ["Try submitting again for detailed feedback"],
          next_steps: ["Review the lesson content and try again"],
        },
      };
    }

    // Persist rubric score to DB (fire-and-forget, non-blocking)
    if (userId) {
      const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (serviceKey) {
        createClient(supabaseUrl, serviceKey)
          .from("submission_scores")
          .insert({
            user_id: userId,
            session_id: lessonId || "unknown",
            module_id: moduleId || null,
            attempt_number: learnerState?.attemptNumber || 1,
            scores: feedbackData.feedback,
            summary: feedbackData.feedback.summary || "",
          })
          .then(() => {});
      }
    }

    return new Response(
      JSON.stringify({
        ...feedbackData,
        // All modules now gate progression — always pass through gateResult
        ...(feedbackData.gateResult
          ? { gateResult: feedbackData.gateResult }
          : {}),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Submission review error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
