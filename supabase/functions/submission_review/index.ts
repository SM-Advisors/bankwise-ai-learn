import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";
import { checkRateLimit } from "../_shared/rateLimiter.ts";



interface SubmissionReviewRequest {
  lessonId: string;
  moduleId?: string;
  isGateModule?: boolean;
  submission: string;
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
  userId?: string; // Optional fallback if auth not available
}

interface LessonChunk {
  id: string;
  text: string;
  source: string | null;
  metadata: Record<string, unknown>;
}

interface FeedbackResponse {
  feedback: {
    summary: string;
    strengths: string[];
    issues: string[];
    fixes: string[];
    next_steps: string[];
  };
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
- Use banking-specific examples`,
    
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

interface BankPolicy {
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

// Retrieve active bank policies (uses service role to bypass RLS since policies are institutional data)
async function retrieveBankPolicies(supabaseUrl: string): Promise<BankPolicy[]> {
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!serviceRoleKey) {
    console.error("SUPABASE_SERVICE_ROLE_KEY not available for policy retrieval");
    return [];
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey);
  const { data, error } = await adminClient
    .from("bank_policies")
    .select("id, title, content, summary, policy_type")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Error retrieving bank policies:", error);
    return [];
  }

  console.log(`Retrieved ${data?.length || 0} bank policies`);
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
    const { lessonId, moduleId, isGateModule, submission, rubric, agentTemplate, workflowData, departmentContext, learnerState, userId: bodyUserId } = requestBody;

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

    // Get user ID from auth (preferred) or body (fallback)
    let userId: string | null = null;

    if (authHeader?.startsWith("Bearer ")) {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (!authError && authUser?.id) {
        userId = authUser.id;
      }
    }

    if (!userId && bodyUserId) {
      userId = bodyUserId;
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

    // Retrieve bank policies
    const policies = await retrieveBankPolicies(supabaseUrl);

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

    // Build bank policies section
    let policiesSection = "";
    if (policies.length > 0) {
      policiesSection = `## BANK POLICIES & GUIDELINES
The following are the bank's official policies. Check submissions for compliance:

${policies.map((policy) => `### ${policy.title} (${policy.policy_type})
${policy.summary ? `**Summary:** ${policy.summary}\n` : ""}
${policy.content}`).join("\n\n")}

---`;
    }

    // Build system prompt
    const systemPrompt = `You are a strict but supportive AI Practice Reviewer for a banking AI training platform. Your job is to evaluate learner submissions and provide structured feedback.

${getFeedbackStyleInstructions(learningStyle)}

${getProficiencyFeedbackInstructions(aiProficiencyLevel)}

${contextSection}

${policiesSection}

${moduleId === "1-5" ? `## MODULE 1-5 RUBRIC: VERIFYING AI OUTPUT
This submission tests the learner's ability to identify AI hallucinations and apply the VERIFY checklist.

3-LEVEL RUBRIC:
| Criterion | Developing | Proficient | Advanced |
|-----------|-----------|-----------|---------|
| Error Detection | Identifies 0-1 of 3 errors | Identifies 2 of 3 errors | Identifies all 3 errors |
| Error Categorization | Does not categorize error types | Correctly categorizes most errors | Correctly categorizes all errors (fabricated number, invented citation, logic error) |
| Verification Steps | Vague ("check it") | Describes a specific verification step for each error | Maps each error to a specific VERIFY letter with concrete source to check |

EVALUATION FOCUS:
- Did the learner identify the fabricated DSCR ratio?
- Did the learner catch the invented OCC Bulletin 2025-03 citation?
- Did the learner spot the incorrect Debt-to-Equity formula (Revenue/Equity instead of Debt/Equity)?
- Are verification steps specific (e.g., "look up OCC Bulletin 2025-03") not generic ("review for accuracy")?` : moduleId === "1-6" ? `## MODULE 1-6 RUBRIC: SESSION 1 CAPSTONE
This is the Session 1 Capstone. Evaluate using the 3-level rubric across all Session 1 skills.

3-LEVEL RUBRIC:
| Criterion | Weight | Developing | Proficient | Advanced |
|-----------|--------|-----------|-----------|---------|
| CLEAR Framework | 25% | 1-3 elements present | All 5 present | All 5 with depth + banking specificity |
| Iteration | 20% | 1 version only | 2 iterations with identifiable changes | 3+ iterations with improvement rationale |
| VERIFY Application | 25% | Generic "I would check it" | 2+ specific items to verify | Maps specific output elements to VERIFY steps with sources |
| Data Security | 15% | No mention of constraints | Constraints present | Proactive synthetic data + security context |
| Banking Quality | 15% | Generic business prompt | Banking terminology correct | Production-quality, usable in real work |

EVALUATION FOCUS:
- Does the prompt use all CLEAR letters with banking-specific content?
- Are there at least 2 iterations showing concrete improvements?
- Does the VERIFY reflection identify specific items (ratios, citations, logic) to check?
- Is all customer data anonymized?
- Would this prompt produce output usable in a real banking context?` : moduleId === "2-1" ? `## MODULE 2-1 RUBRIC: FROM PROMPTS TO AGENTS (BRIDGE)
This submission tests the learner's ability to map CLEAR framework elements to agent architecture sections.

3-LEVEL RUBRIC:
| Criterion | Developing | Proficient | Advanced |
|-----------|-----------|-----------|---------|
| CLEAR-to-Agent Mapping | Maps 0-2 sections | Maps 4 of 5 sections correctly | Maps all 5 with detailed explanations |
| Agent vs Prompt Decision | No rationale provided | Provides a clear rationale | Rationale includes frequency, compliance, and team benefit analysis |
| Conceptual Understanding | Confuses prompts and agents | Correctly distinguishes persistent vs one-off | Articulates continuum with nuanced examples |

EVALUATION FOCUS:
- Does the learner correctly map Context → Identity, Requirements → Task List, Length/Format → Output Rules, etc.?
- Is their agent-vs-prompt decision justified with specific reasons (frequency, compliance, sharing)?
- Do they demonstrate understanding that agent architecture is persistent CLEAR?` : moduleId === "2-5" ? `## MODULE 2-5 RUBRIC: YOUR LIVING AGENT
This submission tests the learner's ability to plan agent iteration, sharing, and measurement.

3-LEVEL RUBRIC:
| Criterion | Developing | Proficient | Advanced |
|-----------|-----------|-----------|---------|
| Monitoring Plan | Vague ("see how it goes") | 2+ specific behaviors to watch | Specific behaviors tied to expected failure modes |
| Iteration Strategy | No guard rail identified | Names a specific guard rail to add | Guard rail tied to realistic edge case with alternative response |
| Effectiveness Measurement | No metric defined | One task with time estimate | Task with time-before, time-after, and quality indicator |
| Sharing Strategy | Not addressed | Identifies a colleague | Identifies colleague, what to customize, and what stays universal |

EVALUATION FOCUS:
- Are monitoring targets specific to their agent's role and task list?
- Is the expected guard rail based on a realistic edge case for their department?
- Does the effectiveness metric include both time savings and quality indicators?
- Would their sharing plan actually work for a colleague?` : moduleId === "2-3" && agentTemplate ? `## AGENT TEMPLATE RUBRIC (MODULE 2-3)
This submission is an AI agent template from the Agent Studio. Evaluate template COMPLETENESS and QUALITY, not prompt technique.

SCORING WEIGHTS:
- Identity (20%): Clear role, department, audience, and purpose defined
- Task List (25%): At least 2 specific tasks with formats and constraints
- Output Rules (15%): At least 2 formatting/behavior rules defined
- Guard Rails (25%): At least 2 guard rails with alternative responses + 1 prompt injection defense
- Compliance Anchors (15%): At least 1 exact phrase that must appear in outputs

AGENT TEMPLATE DATA:
${agentTemplate.identity ? `Identity: "${agentTemplate.identity}"` : "Identity: MISSING"}
Tasks: ${agentTemplate.taskList?.filter(t => t.name).length || 0} defined${agentTemplate.taskList?.filter(t => t.name).map(t => ` (${t.name})`).join(",") || ""}
Output Rules: ${agentTemplate.outputRules?.filter(r => r.trim()).length || 0} defined
Guard Rails: ${agentTemplate.guardRails?.filter(g => g.rule.trim()).length || 0} defined
Compliance Anchors: ${agentTemplate.complianceAnchors?.filter(a => a.trim()).length || 0} defined

EVALUATION FOCUS:
- Are the tasks specific to a banking function (not generic)?
- Do guard rails cover common edge cases (personal advice, legal questions, off-topic)?
- Are compliance anchors real regulatory phrases (FDCPA, TILA, ECOA disclosures)?
- Is the identity specific enough to produce consistent behavior?
- Would this template produce a useful, safe AI agent for banking?` : moduleId === "2-6" && agentTemplate ? `## SESSION 2 CAPSTONE RUBRIC (MODULE 2-6)
This is the Session 2 Capstone. Evaluate the complete agent including template, testing, and Living Agent Plan.

3-LEVEL RUBRIC:
| Criterion | Weight | Developing | Proficient | Advanced |
|-----------|--------|-----------|-----------|---------|
| Identity | 15% | Generic role | Banking-specific role with audience | Detailed persona with departmental context |
| Task List | 20% | 1 vague task | 2+ specific banking tasks | 3+ tasks with format, constraint, and edge case handling |
| Guard Rails | 25% | 0-1 generic rails | 2+ rails with alternatives | 3+ rails including injection defense + compliance redirect |
| Testing | 25% | 1 test type only | All 3 types attempted | All 3 with thoughtful scenarios + gap analysis |
| Living Agent Plan | 15% | Not provided | Generic plan | Specific monitoring criteria + first iteration target |

AGENT TEMPLATE DATA:
${agentTemplate.identity ? `Identity: "${agentTemplate.identity}"` : "Identity: MISSING"}
Tasks: ${agentTemplate.taskList?.filter(t => t.name).length || 0} defined${agentTemplate.taskList?.filter(t => t.name).map(t => ` (${t.name})`).join(",") || ""}
Output Rules: ${agentTemplate.outputRules?.filter(r => r.trim()).length || 0} defined
Guard Rails: ${agentTemplate.guardRails?.filter(g => g.rule.trim()).length || 0} defined
Compliance Anchors: ${agentTemplate.complianceAnchors?.filter(a => a.trim()).length || 0} defined

EVALUATION FOCUS:
- Does the agent template cover all 5 sections with banking-specific content?
- Are all 3 test types present (standard, edge case, out-of-scope)?
- Does the Living Agent Plan include specific monitoring criteria (not just "see how it goes")?
- Does the plan name a specific guard rail they expect to add and why?
- Would this agent be shareable with a colleague in the same role?` : moduleId === "3-3" && workflowData ? `## WORKFLOW RUBRIC
This submission is an AI workflow from the Workflow Studio. Evaluate workflow COMPLETENESS and QUALITY.

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
- Is the trigger specific to a real banking event (not generic)?
- Do steps alternate between AI work and human review — not all AI in sequence?
- Are prompt templates specific enough to use immediately?
- Would this workflow be reusable by a colleague without additional explanation?
- Does the workflow respect compliance requirements (review before external output)?` : moduleId === "3-5" ? `## CAPSTONE RUBRIC
This is the Session 3 Capstone submission. Evaluate against ALL training objectives from Sessions 1-3.

3-LEVEL RUBRIC:
| Criterion | Weight | Developing | Proficient | Advanced |
|-----------|--------|-----------|-----------|---------|
| CLEAR Framework | 20% | 1-3 elements | All 5 present | All 5 with depth + banking specificity |
| Advanced Technique | 20% | No technique applied | 1 technique applied correctly | Technique deeply embedded with justification |
| Compliance Awareness | 20% | No mention | Data handling and decision boundaries addressed | Full compliance checklist applied with documentation |
| Department Relevance | 20% | Generic business task | Banking-specific task | Role-specific task with realistic scenario |
| Reflection Quality | 20% | No reflection or generic | Identifies a strength and limitation | Honest assessment with specific next steps |

EVALUATION FOCUS:
- Does this look like real work, not a hypothetical exercise?
- Are there 3+ prompts showing iteration and refinement?
- Is all customer data properly anonymized?
- Would the final output be usable in a real banking context?
- Is the reflection honest about what AI did well and where it fell short?
- Has the learner applied VERIFY to their output?` : moduleId === "4-1" ? `## MODULE 4-1 RUBRIC: YOUR AI AUDIT
This submission tests the learner's ability to audit their work week using the AI Eligibility Matrix.

3-LEVEL RUBRIC:
| Criterion | Developing | Proficient | Advanced |
|-----------|-----------|-----------|---------|
| Task Identification | Fewer than 5 tasks, mostly generic | 8+ specific tasks from actual work | 10+ tasks with frequency and time estimates |
| Matrix Categorization | Tasks placed without justification | Each task categorized with brief rationale | Categories include frequency, suitability analysis, and compliance considerations |
| AUTOMATE Plans | No agent/workflow described | Top 3 AUTOMATE tasks have agent descriptions | AUTOMATE tasks include detailed workflow with review checkpoints |
| SKIP Recognition | No SKIP tasks identified | 1+ SKIP task with reasoning | SKIP tasks demonstrate nuanced understanding of AI limitations |

EVALUATION FOCUS:
- Are tasks from their actual work, not hypothetical banking activities?
- Does the matrix categorization reflect genuine task analysis?
- Do AUTOMATE plans reference skills from Sessions 2-3 (agents, workflows)?
- Is the SKIP reasoning honest and specific?` : moduleId === "4-2" ? `## MODULE 4-2 RUBRIC: TEAM AI CONVENTIONS
This submission tests the learner's ability to draft practical team AI standards.

3-LEVEL RUBRIC:
| Criterion | Developing | Proficient | Advanced |
|-----------|-----------|-----------|---------|
| Coverage | Fewer than 3 of 5 areas addressed | All 5 areas covered | All 5 with department-specific details |
| Naming Convention | Vague ("name them clearly") | Specific pattern with example | Pattern with version control and ownership |
| Compliance Review | Not addressed | Regular cadence defined | Regular + triggered reviews with responsible parties |
| Documentation Standard | Generic | Specific AI-assisted marking language | Marking + audit trail + VERIFY documentation |
| Implementability | Theoretical | Could be implemented this week | Manager-ready with approval path |

EVALUATION FOCUS:
- Is the naming convention specific enough to use immediately?
- Does the compliance review include both regular and triggered cadences?
- Is the documentation standard specific language, not a vague principle?
- Could their manager approve this document as-is?` : moduleId === "4-3" ? `## MODULE 4-3 RUBRIC: MEASURING AI ROI
This submission tests the learner's ability to quantify AI impact with honest measurement.

3-LEVEL RUBRIC:
| Criterion | Developing | Proficient | Advanced |
|-----------|-----------|-----------|---------|
| Task Selection | Hypothetical task | Real task they have used AI for | Task with multiple data points over time |
| Time Measurement | No specific numbers | Before and after estimates | Timed measurements with methodology |
| Quality Assessment | Not addressed | One quality improvement noted | Multiple quality dimensions with examples |
| Honesty | Only positives | Acknowledges at least one limitation | Includes errors caught, limitations, and honest assessment |
| Recommendation | Vague | Specific and actionable | Includes expansion plan with projected ROI |

EVALUATION FOCUS:
- Is this a real task they have actually used AI for?
- Are time estimates reasonable and honest?
- Does the quality assessment go beyond "it's faster"?
- Is the manager recommendation specific enough to act on?` : moduleId === "4-4" ? `## MODULE 4-4 RUBRIC: AI TOOL LANDSCAPE
This submission tests the learner's ability to evaluate AI tools using the 6-point checklist.

3-LEVEL RUBRIC:
| Criterion | Developing | Proficient | Advanced |
|-----------|-----------|-----------|---------|
| Checklist Coverage | Fewer than 4 of 6 criteria addressed | All 6 criteria addressed | All 6 with specific evidence or research notes |
| Data Privacy Assessment | Vague ("seems secure") | Specific retention/training policy noted | Full privacy analysis with gaps identified |
| Output Quality Testing | No banking-specific test | Tested with 1 banking scenario | Tested with 3+ scenarios with quality ratings |
| Gap Identification | No concerns noted | 1+ concern identified | Concerns ranked by severity with mitigation paths |
| Recommendation Quality | Vague or missing | Clear approve/reject with rationale | Phased recommendation with deployment plan |

EVALUATION FOCUS:
- Does the evaluation address the data privacy question first (dealbreaker criterion)?
- Is the output quality assessment based on actual banking tasks, not generic demos?
- Are gaps and concerns honest and specific?
- Is the recommendation actionable by IT or compliance?` : moduleId === "4-5" ? `## MODULE 4-5 RUBRIC: AI INTEGRATION PLAN (SESSION 4 CAPSTONE)
This is the Session 4 Capstone — the culmination of the entire SMILE curriculum. Evaluate as a real deliverable.

3-LEVEL RUBRIC:
| Criterion | Weight | Developing | Proficient | Advanced |
|-----------|--------|-----------|-----------|---------|
| Task Prioritization | 20% | Generic list | Mapped to AI Eligibility Matrix | Prioritized with time savings estimates |
| Agent/Workflow Inventory | 20% | References exist | Describes capabilities and gaps | Includes iteration plans and sharing strategy |
| ROI Baseline | 20% | No measurement | One task measured | Multiple tasks with quantified savings |
| Team Conventions | 20% | Not addressed | Basic standards described | Complete, department-specific standards |
| Implementation Plan | 20% | Vague timeline | 30-day plan with milestones | Weekly milestones with accountability measures |

EVALUATION FOCUS:
- Does the plan reference actual work from Sessions 2-3 (specific agents, workflows)?
- Are ROI figures grounded in real measurement, not estimates?
- Is the 30-day timeline specific (weekly milestones with concrete deliverables)?
- Would a manager approve this plan and allocate resources?
- Does the plan include what they chose NOT to automate (SKIP tasks)?
- Is this a 1-page document, not a meandering essay?` : moduleId === "E1-1" ? `## MODULE E1-1 RUBRIC: CHAIN-OF-THOUGHT MASTERY
This submission tests the learner's ability to design multi-step reasoning prompts that produce auditable analysis.

3-LEVEL RUBRIC:
| Criterion | Developing | Proficient | Advanced |
|-----------|-----------|-----------|---------|
| Step Structure | Fewer than 3 steps, loosely connected | 5 structured steps with clear instructions for each | Steps build logically with explicit dependencies between them |
| Cross-Referencing | Steps are independent silos | Later steps reference outputs from earlier steps | Each step cites specific upstream data it depends on |
| Individual Evaluation | Ratios treated as a single block | Each ratio evaluated individually before cross-analysis | Individual evaluations include thresholds and contextual interpretation |
| Confidence & Justification | No confidence indicator | Final assessment includes a confidence level | Confidence level includes justification tied to evidence quality |
| Auditability | Could not trace reasoning | Major conclusions traceable to source steps | Examiner could trace each conclusion to its specific source |

EVALUATION FOCUS:
- Does the prompt force sequential reasoning rather than a single-pass summary?
- Are step dependencies explicit (e.g., "Using the DSCR from Step 2, evaluate...")?
- Would an examiner be able to audit the chain of reasoning?` : moduleId === "E1-2" ? `## MODULE E1-2 RUBRIC: MULTI-SHOT PROMPTING
This submission tests the learner's ability to use examples to teach an AI consistent output patterns.

3-LEVEL RUBRIC:
| Criterion | Developing | Proficient | Advanced |
|-----------|-----------|-----------|---------|
| Example Count & Consistency | Fewer than 3 examples or inconsistent format | 3 examples with consistent structure across all | 3+ examples that demonstrate both invariants and meaningful variation |
| Format Invariants | No identifiable pattern | Clear structural pattern repeats across examples | Pattern is explicit with annotation of what must stay constant |
| Compliance Element | No compliance element | At least 1 compliance element appears in all examples | Compliance elements are varied but consistently present |
| Annotations | No annotations | Annotations explain why each example was selected | Annotations highlight what the AI should learn from each example |
| Request Specificity | Vague request for "more like this" | Request is specific and different from the examples | Request tests whether the AI learned the pattern, not just repeated it |

EVALUATION FOCUS:
- Do the examples teach a reusable pattern, not just provide templates?
- Is there enough variation to prevent overfitting to one scenario?
- Does the compliance element demonstrate how to embed regulatory language naturally?` : moduleId === "E1-3" ? `## MODULE E1-3 RUBRIC: SELF-REVIEW LOOPS
This submission tests the learner's ability to build a two-prompt generate-then-critique workflow.

3-LEVEL RUBRIC:
| Criterion | Developing | Proficient | Advanced |
|-----------|-----------|-----------|---------|
| Two-Prompt Structure | Single prompt only | Clear generate + critique-revise sequence | Structured workflow with explicit handoff between generation and review |
| Checklist Quality | Fewer than 3 criteria | 5+ specific criteria relevant to the deliverable | Criteria use measurable ratings (Fully Met / Partially Met / Missing) |
| Criteria Specificity | Generic ("is it good?") | Criteria tied to the specific deliverable type | Criteria differentiate between formatting, accuracy, and compliance dimensions |
| VERIFY Integration | No mention of VERIFY | Identifies items that require VERIFY beyond self-review | Maps self-review vs. VERIFY responsibilities clearly |
| Combined Coverage | Only checks formatting | Covers formatting and some content | Self-review + VERIFY together cover formatting, factual accuracy, and compliance |

EVALUATION FOCUS:
- Does the self-review checklist catch what AI can check (format, completeness, tone)?
- Does the VERIFY layer catch what only humans can check (factual accuracy, regulatory correctness)?
- Is the combined approach more thorough than either technique alone?` : moduleId === "E2-1" ? `## MODULE E2-1 RUBRIC: DOCUMENT ANALYSIS WITH AI
This submission tests the learner's ability to design structured prompts for extracting data from banking documents.

3-LEVEL RUBRIC:
| Criterion | Developing | Proficient | Advanced |
|-----------|-----------|-----------|---------|
| Sanitization First | No sanitization step | Sanitization instructions included as the first step | Specific PII types identified with redaction approach |
| Field Extraction | Vague ("extract the data") | Specifies exact fields to extract with clear definitions | Fields include data types, expected ranges, and edge case handling |
| Output Structure | Unstructured text output | Structured output (table or schema) specified | Output includes field names, types, and validation rules |
| Validation Rules | No validation | At least 2 validation rules for unusual values | Validation rules include cross-field checks and range alerts |
| VERIFY Application | Not mentioned | Notes that VERIFY must be applied to extracted numbers | Specific VERIFY steps for each critical field identified |

EVALUATION FOCUS:
- Is sanitization truly the FIRST step, not an afterthought?
- Are extracted fields specific enough to populate a form or database without human interpretation?
- Would the validation rules catch the most common extraction errors?` : moduleId === "E2-2" ? `## MODULE E2-2 RUBRIC: MEETING INTELLIGENCE
This submission tests the learner's ability to design AI-assisted meeting summary templates for banking contexts.

3-LEVEL RUBRIC:
| Criterion | Developing | Proficient | Advanced |
|-----------|-----------|-----------|---------|
| Meeting-Type Specificity | Generic summary template | Structure matches the specific meeting type (credit committee, ALCO, board, etc.) | Template adapts to meeting dynamics (decision items, risk flags, regulatory items) |
| Action Items | Vague action list | Action items include owner, deadline, and categorization | Action items include priority, dependencies, and follow-up cadence |
| Compliance Flagging | No compliance awareness | Identifies sensitive content types for this meeting type | Flags specific regulatory triggers (e.g., fair lending discussion, SAR mention) |
| Reusability | Single-use template | Template is parameterized for different instances | Template includes configuration options for different meeting sizes/formats |
| Review Requirement | Not addressed | Notes that AI summary must be reviewed before distribution | Specifies who reviews, what they check, and distribution protocol |

EVALUATION FOCUS:
- Is this template designed for a specific banking meeting type, not a generic meeting?
- Would action items be actionable without re-watching the meeting?
- Does the compliance flag catch the content types that matter for this meeting type?` : moduleId === "E2-3" ? `## MODULE E2-3 RUBRIC: DATA VISUALIZATION WITH AI
This submission tests the learner's ability to prepare data narratives for executive presentation using AI.

3-LEVEL RUBRIC:
| Criterion | Developing | Proficient | Advanced |
|-----------|-----------|-----------|---------|
| Data Completeness | Missing key metrics | All required metrics included with correct values | Metrics include context (period, comparison basis, trend direction) |
| Audience Specification | No audience mentioned | Specifies the audience (executive committee, board, etc.) | Tailors language and detail level to the specific audience |
| Output Structure | Unstructured narrative | Requests structured output (summary, metric commentary, questions) | Output sections map to presentation flow with transition logic |
| Presentation Readiness | Requires significant editing | Output would be presentation-ready for executives | Includes speaking notes, anticipated questions, and backup data references |
| VERIFY Application | Not mentioned | Notes that VERIFY should check calculations | Specific calculation verification steps identified for each metric |

EVALUATION FOCUS:
- Are all metrics included with accurate values and proper context?
- Would the output slide into an executive presentation without reformatting?
- Are the anticipated questions realistic for the audience?` : moduleId === "E3-1" ? `## MODULE E3-1 RUBRIC: AI CHAMPION PLAYBOOK
This submission tests the learner's ability to build a compelling internal AI adoption pitch.

3-LEVEL RUBRIC:
| Criterion | Developing | Proficient | Advanced |
|-----------|-----------|-----------|---------|
| Problem Statement | Generic AI benefit claims | References real tasks from the learner's actual work | Quantifies the current pain (time, rework, inconsistency) |
| Solution Description | Vague ("use AI for X") | Specific AI application with implementation approach | Solution maps to specific agents, workflows, or prompt strategies from training |
| Evidence & ROI | No supporting evidence | Specific ROI measurements from their own experience | Multiple data points with conservative and optimistic projections |
| The Ask | Vague or unreasonable | Specific and reasonable request | Phased ask with quick wins and measurable milestones |
| Professional Tone | Casual or overly technical | Appropriate for a department head | Anticipates objections and addresses them proactively |

EVALUATION FOCUS:
- Does the problem statement reference the learner's actual work, not hypothetical scenarios?
- Is the ROI measurement based on real data, not wishful estimates?
- Would a department head actually approve this ask?` : moduleId === "E3-2" ? `## MODULE E3-2 RUBRIC: AI GOVERNANCE FOR BANKING
This submission tests the learner's ability to draft a department-level AI governance framework.

3-LEVEL RUBRIC:
| Criterion | Developing | Proficient | Advanced |
|-----------|-----------|-----------|---------|
| Section Coverage | Fewer than 4 of 6 sections | All 6 sections addressed | All 6 with department-specific content and examples |
| Approved Use Cases | Generic AI uses | Specific to the learner's department | Includes conditions, guardrails, and review requirements per use case |
| Prohibited Use Cases | Not addressed or generic | Identifies real risks for the department | Explains WHY each is prohibited with regulatory or risk rationale |
| Data Handling Rules | Generic data rules | References specific data types handled by the department | Includes classification levels, handling procedures, and escalation paths |
| Audit Readiness | Not auditable | Documentation requirements specified | Requirements are practical, auditor-ready, and include retention periods |
| Implementability | Theoretical framework | Could be implemented this quarter | Ready for compliance review with approval workflow included |

EVALUATION FOCUS:
- Are approved and prohibited use cases specific to the department (not generic)?
- Would an examiner accept the documentation requirements?
- Is the framework practical enough to implement this quarter?` : moduleId === "E3-3" ? `## MODULE E3-3 RUBRIC: SCALING AI ACROSS THE BANK
This submission tests the learner's ability to design a cross-departmental AI rollout plan.

3-LEVEL RUBRIC:
| Criterion | Developing | Proficient | Advanced |
|-----------|-----------|-----------|---------|
| Department Selection | Random or unexplained | Two departments identified with rationale for selection | Selection based on readiness assessment and strategic alignment |
| Phase Structure | Vague timeline | Each 30-day phase has specific activities | Phases include dependencies, decision gates, and fallback plans |
| Measurement Plan | No metrics | Pilot phase includes measurement plan | Metrics include leading and lagging indicators with targets |
| Template Sharing | Not addressed | Expansion includes template sharing | Sharing plan includes customization guide and onboarding workflow |
| Executive Report | Not included or vague | Includes quantitative metrics | Executive report template with actual data from pilot phase |
| Feasibility | Unrealistic scope | Realistic for the bank size and resources | Accounts for change management, training load, and competing priorities |

EVALUATION FOCUS:
- Is the department selection justified by readiness and strategic value?
- Are 30-day phases specific enough to execute without additional planning?
- Would the executive report satisfy a CEO or board committee?` : moduleId === "E4-1" ? `## MODULE E4-1 RUBRIC: AI & FAIR LENDING (SPECIALIST)
This is a specialist-depth module. Evaluate for regulatory precision — learners should cite specific ECOA provisions and apply the Griggs disparate impact framework.

3-LEVEL RUBRIC:
| Criterion | Developing | Proficient | Advanced |
|-----------|-----------|-----------|---------|
| Proxy Variable Identification | Identifies 0-1 proxy variables | Identifies at least 3 proxy variable risks with ECOA protected class mapping | Maps each proxy to a specific ECOA category (15 U.S.C. §1691) with correlation mechanism |
| Disparate Impact Analysis | Not applied | Applies Part 1 of Griggs test (disproportionate effect) | Applies all 3 parts (adverse effect → business necessity → less discriminatory alternative) |
| Prompt Rewrite | Minor or no changes | Rewritten prompt preserves analysis without proxy variables | Rewrite replaces proxy variables with credit fundamentals (cash flow, collateral, capacity) and annotates each change |
| CRA Awareness | No CRA connection | Recognizes geographic weighting creates redlining risk | Connects prompt design to CRA assessment area obligations with specific examples |
| Documentation & Escalation | Not addressed | Notes fair lending review should be documented | Specifies escalation threshold, documentation format, retention, and responsible parties |

EVALUATION FOCUS:
- Does the learner cite ECOA (15 U.S.C. §1691) or Reg B (12 CFR §1002) specifically — not just "fair lending laws"?
- Is the Griggs disparate impact test applied correctly (not just mentioned)?
- Is the rewritten prompt still analytically useful after removing proxy variables — using credit fundamentals, not sterile non-analysis?
- Would a fair lending examiner accept the documentation and escalation approach?` : moduleId === "E4-2" ? `## MODULE E4-2 RUBRIC: AI AUDIT READINESS (SPECIALIST)
This is a specialist-depth module. Evaluate for FFIEC alignment and the three lines of defense framework (OCC 2014-1).

3-LEVEL RUBRIC:
| Criterion | Developing | Proficient | Advanced |
|-----------|-----------|-----------|---------|
| Log Template Design | Missing columns or unclear | Clear column definitions with examples | Includes model risk flag (SR 11-7), retention guidance, and FFIEC IT governance alignment |
| Example Row | Missing or generic | Realistic example with banking-relevant data | Includes both a standard use and a model-risk-flagged use case |
| Prompt Summary Guidance | Full prompt text or nothing | 1-2 sentence summary guidance specified | Summary guidance includes what to include, exclude, PII handling, and auditor-readability test |
| Disposition Categories | Vague or overlapping | Clear and mutually exclusive categories | Categories include workflow status with review chain (draft → reviewed → approved → published → archived) |
| Three Lines of Defense | Not referenced | Examiner answers reference own documentation (Line 1) | All 5 answers map to the three lines: what Line 1 owns, what Line 2 provides, what Line 3 audits |
| Examiner Preparedness | Fewer than 3 questions | All 5 examiner questions answered | Responses are confident, cite specific practices, and anticipate follow-up questions |

EVALUATION FOCUS:
- Does the log template include a model risk flag for outputs that influence credit decisions (per SR 11-7 / OCC 2011-12)?
- Are examiner answers framed with the three lines of defense — or just first-person responses?
- Would this log template survive an FFIEC examiner's scrutiny without supplemental explanation?` : moduleId === "E4-3" ? `## MODULE E4-3 RUBRIC: VENDOR AI RISK ASSESSMENT (SPECIALIST)
This is a specialist-depth module. Evaluate for OCC 2023-17 life cycle alignment and Interagency Guidance compliance.

3-LEVEL RUBRIC:
| Criterion | Developing | Proficient | Advanced |
|-----------|-----------|-----------|---------|
| Life Cycle Coverage | Fewer than 3 phases | All 5 OCC 2023-17 phases addressed | All 5 with risk-commensurate depth and regulatory citations |
| Critical Activity Designation | Not addressed | Designates activity with basic justification | Justification cites specific criteria (customer data, credit decisions, examiner-facing output) |
| Data Handling & Due Diligence | Generic privacy questions | Specific questions answered honestly | Includes data residency, training data policy, subprocessor chain, and encryption standards |
| Contract Provisions | Generic terms | At least 3 provisions from Interagency Guidance cited | Provisions include regulatory examination access, breach notification, and termination data handling |
| Ongoing Monitoring & Termination | Not addressed | Monitoring plan described | Monitoring includes performance metrics, financial condition review, and data exit strategy |
| Practical Evaluation | No testing described | Banking-specific test scenarios described | Tests include compliance-critical edge cases with documented results as due diligence evidence |
| Recommendation Quality | Vague or missing | Clear recommendation with supporting rationale | Phased recommendation with conditions, monitoring plan, and risk-commensurate rationale |

EVALUATION FOCUS:
- Does the assessment follow the OCC 2023-17 life cycle (planning → due diligence → contract → monitoring → termination)?
- Is the critical activity designation justified — or just assumed?
- Are contract provisions from the Interagency Guidance (June 2023), not generic terms?
- Does the termination plan address data return/destruction specifically?
- Would this assessment satisfy an OCC examiner reviewing the bank's third-party risk management program?` : `## RUBRIC
${rubric ? (typeof rubric === "string" ? rubric : JSON.stringify(rubric, null, 2)) : "Evaluate based on clarity, specificity, context, and appropriateness for banking use cases."}`}

${departmentContext?.lineOfBusiness ? `## DEPARTMENT CONTEXT
The learner works in: ${departmentContext.lineOfBusiness === "accounting_finance" ? "Accounting & Finance" : departmentContext.lineOfBusiness === "credit_administration" ? "Credit Administration" : departmentContext.lineOfBusiness === "executive_leadership" ? "Executive & Leadership" : departmentContext.lineOfBusiness}
${departmentContext.bankRole ? `Their role: ${departmentContext.bankRole}` : ""}
Evaluate whether the submission is relevant to their department. Note if examples and terminology are appropriate for their line of business.` : departmentContext?.interests?.length ? `## LEARNER CONTEXT (FRIENDS & FAMILY TESTER)
This learner is a non-banker pilot tester. Their interests are: ${departmentContext.interests.join(", ")}.
Do NOT penalize them for lacking banking-specific terminology or banking examples. Instead, evaluate whether they demonstrate understanding of the core AI concepts in the module. Credit creative use of non-banking analogies drawn from their interests.` : ""}

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
7. Check submissions for compliance with BANK POLICIES - flag any potential violations
8. If the submission touches on data handling, AI usage, or security, verify alignment with bank guidelines

## REQUIRED OUTPUT FORMAT (strict JSON, no extra keys)
${isGateModule ? `{
  "feedback": {
    "summary": "2-3 sentence overall assessment",
    "strengths": ["specific thing done well", "another strength"],
    "issues": ["specific issue found", "another issue"],
    "fixes": ["actionable fix for issue 1", "actionable fix for issue 2"],
    "next_steps": ["what to try next", "suggested improvement"]
  },
  "gateResult": {
    "passed": true or false,
    "criteriaMetCount": number of learning objectives clearly demonstrated in the submission,
    "criteriaTotalCount": total number of learning objectives for this module,
    "gateMessage": "1-2 sentences explaining the gate decision — what was strong or what must be demonstrated to pass"
  }
}

GATE EVALUATION RULES:
- Evaluate each learning objective listed under "This Module's Objectives" above
- passed = true if criteriaMetCount >= 60% of criteriaTotalCount (round up) AND no critical compliance issues are present
- The submission must show actual performance of the skills, not just awareness of them
- Be fair but rigorous — vague or surface-level submissions that don't demonstrate the specific skills should not pass` : `{
  "feedback": {
    "summary": "2-3 sentence overall assessment",
    "strengths": ["specific thing done well", "another strength"],
    "issues": ["specific issue found", "another issue"],
    "fixes": ["actionable fix for issue 1", "actionable fix for issue 2"],
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
            attempt_number: (learnerState as any)?.attemptNumber || 1,
            scores: feedbackData.feedback,
            summary: feedbackData.feedback.summary || "",
          })
          .then(() => {});
      }
    }

    return new Response(
      JSON.stringify({
        ...feedbackData,
        // Pass through gateResult if present (gate modules only)
        ...(isGateModule && (feedbackData as any).gateResult
          ? { gateResult: (feedbackData as any).gateResult }
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
