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

${moduleId === "1-5" ? `## MODULE 1-5 RUBRIC: ITERATION
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
- Does the final output look like it was refined through deliberate effort?` : moduleId === "1-6" ? `## MODULE 1-6 RUBRIC: SELF-REVIEW LOOPS
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
- Would the final output hold up in a real professional context?` : moduleId === "2-1" ? `## MODULE 2-1 RUBRIC: STRUCTURED PROMPTING (CLEAR FRAMEWORK)
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
- Are requirements specific enough that the learner could tell if they were met?` : moduleId === "2-3" ? `## MODULE 2-3 RUBRIC: MULTI-SHOT PROMPTING
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
- Does the new request test pattern recognition — not just produce another copy of the examples?` : moduleId === "2-5" ? `## MODULE 2-5 RUBRIC: CHAIN-OF-THOUGHT MASTERY
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
- Does the final output look different from what a single-step prompt would produce?` : moduleId === "2-6" ? `## MODULE 2-6 RUBRIC: TOOL SELECTION
This submission tests the learner's ability to identify when an AI tool is the right choice for a task — and how to interrogate a new tool using the same criteria.

3-LEVEL RUBRIC:
| Criterion | Developing | Proficient | Advanced |
|-----------|-----------|-----------|---------|
| Task Analysis | Chooses tool without analyzing the task | Analyzes the task against tool capabilities | Analysis includes task type, frequency, risk level, and compliance sensitivity |
| Data Privacy Assessment | Not addressed | Notes whether the task involves sensitive data | Identifies specific data types and checks tool's data handling policy |
| Fit vs. Gap Identification | Lists only benefits | Identifies at least 1 gap or limitation | Gaps are ranked by severity with a mitigation or workaround for each |
| Custom vs. Built-In Distinction | Confused about the difference | Correctly distinguishes when a custom agent (Session 3) would be better | Explains the threshold: when built-in tools are sufficient vs. when to build |
| Decision Quality | Vague conclusion | Clear approve/skip/investigate decision with rationale | Decision includes conditions: approved for X tasks, not for Y, with review protocol |

EVALUATION FOCUS:
- Does the analysis start with the task, not the tool?
- Is data privacy assessed before capabilities — or as an afterthought?
- Is the final decision specific enough to act on (not just "it looks useful")?
- Does the learner understand the difference between functional agents and custom agents?` : moduleId === "2-7" ? `## MODULE 2-7 RUBRIC: SESSION 2 SANDBOX (CAPSTONE)
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
- Can the learner articulate which technique they used and why it helped?` : moduleId === "3-3" && agentTemplate ? `## MODULE 3-3 RUBRIC: BUILD A BASIC AGENT
This submission is a Level 2 AI agent configured for a specific task. Evaluate COMPLETENESS and QUALITY of the agent configuration — not prompt technique.

SCORING WEIGHTS:
- Identity (20%): Clear role, scope, audience, and purpose defined
- Task List (25%): At least 2 specific tasks with formats and constraints
- Output Rules (15%): At least 2 formatting/behavior rules defined
- Guard Rails (25%): At least 2 guard rails with alternative responses + 1 out-of-scope defense
- Compliance Anchors (15%): At least 1 compliance or quality anchor that must appear in outputs

AGENT TEMPLATE DATA:
${agentTemplate.identity ? `Identity: "${agentTemplate.identity}"` : "Identity: MISSING"}
Tasks: ${agentTemplate.taskList?.filter(t => t.name).length || 0} defined${agentTemplate.taskList?.filter(t => t.name).map(t => ` (${t.name})`).join(",") || ""}
Output Rules: ${agentTemplate.outputRules?.filter(r => r.trim()).length || 0} defined
Guard Rails: ${agentTemplate.guardRails?.filter(g => g.rule.trim()).length || 0} defined
Compliance Anchors: ${agentTemplate.complianceAnchors?.filter(a => a.trim()).length || 0} defined

EVALUATION FOCUS:
- Is the agent configured for a specific, real task — not a generic "helpful assistant"?
- Are the tasks written as instructions the agent can actually follow?
- Do guard rails cover realistic out-of-scope requests for this agent's role?
- Is the identity specific enough to produce consistent, role-appropriate behavior?
- Would this agent be useful in real work without significant manual oversight?` : moduleId === "3-4" ? `## MODULE 3-4 RUBRIC: ADD KNOWLEDGE
This submission tests the learner's ability to give an agent domain knowledge that makes it a genuine specialist.

3-LEVEL RUBRIC:
| Criterion | Developing | Proficient | Advanced |
|-----------|-----------|-----------|---------|
| Knowledge Source Selection | Generic or irrelevant source | Relevant document or reference for the agent's role | Source directly addresses the task types the agent handles |
| Knowledge Integration | Source added without instructions for use | Agent told when to reference the knowledge | Agent told which tasks require the knowledge, which don't, and how to cite it |
| Specialist vs. Generalist Gap | Knowledge doesn't change the agent's behavior | Knowledge enables answers the agent couldn't give before | Knowledge closes a specific gap identified in the baseline agent |
| Accuracy & Hallucination Risk | No instructions to stay within the source | Agent told to limit answers to what's in the source | Agent told to acknowledge when a question is outside the knowledge base |

EVALUATION FOCUS:
- Does the knowledge source actually match the agent's tasks?
- Would the agent behave differently with vs. without this knowledge?
- Is the agent instructed to stay within what the knowledge source covers?
- Does the knowledge make the agent more useful — or just more confident?` : moduleId === "3-5" ? `## MODULE 3-5 RUBRIC: ADD FILES
This submission tests the learner's ability to extend an agent with file-processing capability.

3-LEVEL RUBRIC:
| Criterion | Developing | Proficient | Advanced |
|-----------|-----------|-----------|---------|
| File Type Specification | No file types specified | Specific file types defined (PDF, CSV, DOCX, etc.) | File types include handling instructions for each format |
| Processing Instructions | Vague ("process the file") | Clear instructions for what to extract or analyze | Instructions include output structure for each file type |
| Guard Rails for Files | No file-specific guard rails | Agent told what to do if a file is unreadable | Agent told what to do if a file is the wrong type, too large, or contains unexpected content |
| Privacy & Data Handling | No data handling instructions | Agent told not to store or repeat sensitive data | Specific data types identified with handling instructions (anonymize, flag, skip) |
| Output Quality | Unstructured dump of file content | Structured output tied to the agent's specific task | Output format matches what the task requires — summary, extraction, analysis, or comparison |

EVALUATION FOCUS:
- Is the agent told specifically what to do with files — not just that it can accept them?
- Are guard rails in place for file edge cases (wrong format, missing data, PII)?
- Does the output format match what the learner actually needs from the file?` : moduleId === "3-6" ? `## MODULE 3-6 RUBRIC: ADD TOOL ACCESS
This submission tests the learner's ability to transition an agent from Level 2 (advisor) to Level 3 (executor) by connecting it to tools.

3-LEVEL RUBRIC:
| Criterion | Developing | Proficient | Advanced |
|-----------|-----------|-----------|---------|
| Tool Selection Rationale | Tool added without justification | Tool is appropriate for the agent's task | Tool is the minimal escalation — avoids adding capability not needed |
| Level 2 vs. Level 3 Distinction | Confused about the difference | Correctly identifies when tool access changes the agent's behavior | Explains specific tasks that are now possible at Level 3 that were not at Level 2 |
| Human Oversight Design | No review checkpoints | At least 1 human review point before consequential action | Review checkpoints are specific: what is reviewed, by whom, and when |
| Failure & Fallback | No failure handling | Agent told what to do if a tool call fails | Agent has fallback behavior for each tool — degrade gracefully, not fail silently |
| Scope Discipline | Tool access is open-ended | Tool access is scoped to specific tasks | Tool access is the minimum required — explicit about what the tool cannot be used for |

EVALUATION FOCUS:
- Does the tool access serve the agent's specific task — or is it scope creep?
- Are human review checkpoints designed for the highest-risk actions?
- Would the agent fail gracefully if a tool is unavailable?
- Is this genuinely a Level 3 agent — or still essentially a Level 2 with an unused tool?` : moduleId === "3-7" && agentTemplate ? `## MODULE 3-7 RUBRIC: SESSION 3 SANDBOX (AGENT CAPSTONE)
This is the Session 3 Sandbox / Capstone — the learner's final agent for actual use. Evaluate as a real deliverable, not a practice exercise.

3-LEVEL RUBRIC:
| Criterion | Weight | Developing | Proficient | Advanced |
|-----------|--------|-----------|-----------|---------|
| Identity | 15% | Generic role | Role-specific with clear audience and purpose | Detailed persona with task scope, tone, and output style defined |
| Task List | 20% | 1 vague task | 2+ specific, actionable tasks | 3+ tasks with format, constraint, and edge case handling |
| Guard Rails | 25% | 0-1 generic rails | 2+ rails with specific alternatives | 3+ rails covering out-of-scope, sensitive topics, and compliance edge cases |
| Knowledge/Files/Tools | 20% | Not used | Agent has at least 1 extension (knowledge, files, or tools) | Extensions are purposeful — each one closes a specific gap |
| Real-Work Readiness | 20% | Practice scenario | Agent could be used for real tasks | Agent is configured for work the learner actually does — and they plan to use it |

AGENT TEMPLATE DATA:
${agentTemplate.identity ? `Identity: "${agentTemplate.identity}"` : "Identity: MISSING"}
Tasks: ${agentTemplate.taskList?.filter(t => t.name).length || 0} defined${agentTemplate.taskList?.filter(t => t.name).map(t => ` (${t.name})`).join(",") || ""}
Output Rules: ${agentTemplate.outputRules?.filter(r => r.trim()).length || 0} defined
Guard Rails: ${agentTemplate.guardRails?.filter(g => g.rule.trim()).length || 0} defined
Compliance Anchors: ${agentTemplate.complianceAnchors?.filter(a => a.trim()).length || 0} defined

EVALUATION FOCUS:
- Is this an agent the learner actually plans to use — not just a training exercise?
- Does the agent template reflect Session 3 skills (identity, tasks, guard rails, optional extensions)?
- Are guard rails specific to the agent's role and realistic edge cases?
- Would a colleague be able to use this agent for the same tasks?` : moduleId === "4-1" ? `## MODULE 4-1 RUBRIC: WHAT ARE FUNCTIONAL AGENTS?
This submission tests the learner's ability to identify functional agents in tools they already use and assess when to use them vs. building a custom agent.

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
- Are limitations specific — not just "it might make mistakes"?` : moduleId === "4-2" ? `## MODULE 4-2 RUBRIC: AI IN YOUR SPREADSHEET
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
- Would they be able to repeat this workflow without step-by-step guidance?` : moduleId === "4-3" ? `## MODULE 4-3 RUBRIC: AI IN YOUR PRESENTATIONS
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
- Is there evidence that the final output was usable in a professional context?` : moduleId === "4-4" ? `## MODULE 4-4 RUBRIC: AI IN YOUR INBOX
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
- Do they understand what email tasks should NOT be delegated to AI?` : moduleId === "4-5" ? `## MODULE 4-5 RUBRIC: SESSION 4 SANDBOX (FUNCTIONAL AGENTS)
This is the Session 4 Sandbox. Evaluate the learner's practical integration of functional agents into their daily workflow.

3-LEVEL RUBRIC:
| Criterion | Weight | Developing | Proficient | Advanced |
|-----------|--------|-----------|-----------|---------|
| Tool Selection | 25% | Identifies tools without clear rationale | Selects the 1-2 functional agents most relevant to their work | Ranks agents by time savings and selects based on real task frequency |
| Integration Plan | 30% | Vague intention to use AI tools | Specific plan for which tasks each agent handles | Plan includes what they will stop doing manually, what they will verify, and a 1-week trial |
| Limitation Awareness | 20% | Only benefits identified | At least 1 meaningful limitation per tool acknowledged | Clear boundary: which tasks stay manual and why |
| Reflection on Custom vs. Functional | 25% | Not addressed | Identifies at least 1 task where a custom agent (Session 3) would be better | Articulates the threshold: complexity, specificity, or frequency that tips toward custom |

EVALUATION FOCUS:
- Are the selected tools actually used in the learner's daily work?
- Is the integration plan specific enough to execute without additional guidance?
- Does the learner understand the boundary between functional and custom agents?
- Is there honest acknowledgment of what AI tools cannot do for this person's specific work?` : moduleId === "5-2" && workflowData ? `## MODULE 5-2 RUBRIC: DESIGN YOUR WORKFLOW
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
2. Use ONLY criteria from the RETRIEVED LESSON CONTENT for evaluation
3. Be specific - reference exact parts of the submission
4. Balance praise with constructive criticism
5. Tailor language complexity to the ${learningStyle.replace("_", "-")} learning style
6. If lesson content is missing, acknowledge this and evaluate on general best practices
7. Check submissions for compliance with ORGANIZATION POLICIES - flag any potential violations
8. If the submission touches on data handling, AI usage, or security, verify alignment with organizational guidelines

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
- passed = true if criteriaMetCount >= 60% of criteriaTotalCount (round up) AND no critical compliance issues are present
- The submission must show actual performance of the skills, not just awareness of them
- Be fair but rigorous — vague or surface-level submissions that don't demonstrate the specific skills should not pass
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
