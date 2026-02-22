# SMILE AI Training Platform -- Curriculum Review

**Review Date:** February 2026
**Reviewer:** Expert Curriculum Review (Instructional Design + AI Enablement)
**Scope:** All 18 modules across 3 sessions, proficiency assessment, coaching system (Andrea), learning styles, and department topics
**Platform:** SMILE (formerly BankWise AI Learn)

---

## Executive Summary

### Overall Assessment

The SMILE platform delivers a well-structured, banking-specific AI training curriculum that takes non-technical professionals from zero AI experience through agent building and multi-step workflow design in 18 modules across 3 sessions. The curriculum demonstrates several notable strengths: deep banking domain integration, a thoughtful compliance-first philosophy, an innovative AI coaching system (Andrea) with session-adaptive behavior, and practical scaffolding that builds real deliverables (agents, workflows, compliance checklists) rather than abstract knowledge.

The curriculum is above average for corporate AI training programs, particularly in its domain specificity -- this is not a generic "how to use ChatGPT" course bolted onto banking scenarios. The CLEAR framework, the 5-section agent template, and the compliance pillars are original pedagogical contributions that provide genuine structure for banking professionals.

However, the review identifies areas where the curriculum could be strengthened: the cognitive load distribution is front-heavy in Session 1, the proficiency assessment has limited predictive validity, the learning style system lacks deep integration into content delivery, and there are critical AI skill gaps (hallucination detection, prompt security, multi-modal AI) that are not addressed.

### Top 5 Priority Recommendations

1. **Add a dedicated module on AI hallucination detection and output verification** -- This is the single most dangerous gap. Banking professionals must learn to identify when AI fabricates plausible-sounding but incorrect financial data, regulatory citations, or ratio interpretations. Currently, the curriculum mentions "review output" repeatedly but never teaches *how* to spot AI errors. Insert as Module 1-5 or 1-6 (before the capstone), shifting existing modules accordingly.

2. **Rebalance Session 1 from 8 modules to 6 by consolidating Modules 1-1/1-2 and 1-4/1-5** -- The current 8+5+5 structure overloads Session 1 with foundational content that could be tightened. Module 1-1 (What is AI Prompting) and 1-2 (Anatomy of a Good Prompt) cover overlapping territory. Module 1-4 (Good vs Bad Prompts) and 1-5 (Setting Context) both teach context-setting through examples. Consolidation would reduce cognitive fatigue and create a more balanced 6+5+5 or 6+6+6 structure.

3. **Strengthen the proficiency assessment with at least 2 performance-based items** -- The current 6-question self-report quiz measures self-perception of AI skill, not actual skill. Add at least two items where the learner must evaluate or improve a sample prompt (not just select a description of what they would do). This would improve placement accuracy and reduce the Dunning-Kruger effect in self-assessment.

4. **Add prompt injection/security awareness content to Session 2** -- As learners build agents that could be used by others, they need to understand prompt injection risks. A brief treatment in Module 2-2 (Agent Architecture) or 2-4 (Tool Integration) would address this gap without requiring a new module.

5. **Deepen the learning style differentiation in Andrea's coaching** -- The four learning styles (example-based, explanation-based, hands-on, logic-based) are well-defined but the differentiation in Andrea's system prompt is shallow (4 bullet points per style). Develop richer coaching scripts that substantively change how Andrea introduces concepts, structures practice, and provides feedback for each style.

---

## Lens 1: Instructional Design Expert

### 1.1 Bloom's Taxonomy Alignment

**Finding:** The curriculum demonstrates a generally appropriate cognitive level progression across sessions, but Session 1 stays at the Remember/Understand level longer than necessary and misses an opportunity to push to Apply earlier.

- **Session 1 (Modules 1-1 through 1-8):** Modules 1-1 through 1-4 operate at the Remember and Understand levels -- defining what prompting is, identifying elements, recognizing good vs. bad. Module 1-5 (Setting Context) begins to touch Apply. Module 1-7 (Iteration) reaches Apply/Analyze. The capstone (1-8) targets Apply. However, six of eight modules never require the learner to produce anything beyond recognition tasks.
- **Session 2 (Modules 2-1 through 2-5):** This session operates primarily at Apply and Analyze, with the capstone (2-5) reaching Evaluate (testing agent behavior and identifying gaps). Module 2-2 (Agent Architecture) hits Analyze well. Module 2-4 (Tool Integration) includes Evaluate-level thinking (assessing risk profiles of integrations).
- **Session 3 (Modules 3-1 through 3-5):** Operates at Analyze, Evaluate, and Create. Module 3-4 (Advanced Techniques) is solidly at Analyze/Evaluate. The final capstone (3-5) reaches Create -- learners produce a complete, real work deliverable.

**Rating:** Adequate

**Recommendation:** Introduce an Apply-level task earlier in Session 1 -- by Module 1-3 at the latest. Currently the CLEAR framework module (1-3) teaches the framework but the practice task is still essentially "write a prompt using this template." Adding a comparison exercise where learners evaluate two prompts against the CLEAR framework (Analyze level) would elevate cognitive engagement earlier.

---

### 1.2 Scaffolding Quality

**Finding:** The three-session arc (foundations -> agent building -> role-specific mastery) is a strong macro-scaffold. The progression from "what is a prompt" (1-1) to "build a deployable agent" (2-5) to "design a multi-step workflow with compliance checkpoints" (3-3) represents meaningful skill accumulation. Within sessions, the scaffolding is generally solid but has two notable gaps.

**Gap 1:** The transition from Session 1 to Session 2 is abrupt. Session 1 ends with a capstone that asks learners to write a comprehensive prompt. Session 2 opens by asking them to understand the concept of persistent system instructions and agent architecture. There is no bridge module that shows how a well-crafted single prompt *becomes* a system prompt, or how the CLEAR framework maps to agent template sections.

**Gap 2:** Within Session 2, Module 2-4 (Tool Integration) introduces a significantly different skill set (evaluating data connections, writing integration scope documents for IT review) that does not directly build on the template-building work in 2-2 and 2-3. While the content is valuable, it feels like a sidebar before the capstone.

**Rating:** Strong (macro-level), Adequate (micro-level transitions)

**Recommendation:** Add a 2-3 paragraph "Bridge" section at the start of Module 2-1 that explicitly maps Session 1 skills to Session 2 concepts. For example: "The CLEAR framework you learned in Session 1 maps directly to agent architecture: Context becomes Identity, Requirements becomes Guard Rails, etc." This would make the transition feel continuous rather than like starting a new course.

---

### 1.3 Practice Task Design

**Finding:** Practice tasks are consistently authentic and banking-specific, which is a major strength. Every module includes a practice task with a realistic scenario, contextual hints, and measurable success criteria. The department-specific scenarios (accounting, credit, executive) in Session 3 add genuine differentiation.

**Strengths:**
- Module 1-6 (Data Security) uses a brilliant scenario: learners must sanitize a prompt containing a real name, address, SSN, account number, and balance. The task directly simulates a real compliance risk.
- Module 2-5 (Build Your Agent) includes three test types (standard, edge case, out-of-scope) which is excellent assessment design.
- Module 3-5 (Final Capstone) is intentionally open-ended with four options mapped to different departments, requiring 3+ prompt iterations and a reflection component.

**Weakness:** Success criteria across all modules are binary (did/did not include X) rather than qualitative (how well was X implemented). For example, Module 1-3 success criteria include "Includes clear context about the task" -- but there is no rubric for what distinguishes adequate context from excellent context. This limits the diagnostic value of assessment.

**Rating:** Strong

**Recommendation:** For the three capstone modules (1-8, 2-5, 3-5), develop a 3-level rubric (Developing / Proficient / Advanced) for each success criterion. This gives learners clearer targets and gives Andrea's coaching more specificity when reviewing practice work.

---

### 1.4 CLEAR Framework Assessment

**Finding:** The CLEAR framework (Context, Length/Format, Examples, Audience, Requirements) is introduced in Module 1-3 and referenced throughout the curriculum, including in the final capstone (3-5). It is a reasonable prompt engineering pedagogy for beginners, comparable to established frameworks like RACE (Role, Action, Context, Example) or CREATE (Character, Request, Examples, Adjustments, Type, Extras).

**Strengths:**
- CLEAR maps naturally to banking workflows: Context is always relevant (regulatory environment), Audience always matters (customer vs. committee vs. board), and Requirements naturally include compliance constraints.
- The "L" for Length/Format is a practical addition that many competing frameworks miss -- banking professionals need to specify whether output should be a one-page memo, a table, or bullet points.

**Weaknesses:**
- The "E" for Examples overlaps with multi-shot prompting taught in Module 3-4. The framework does not distinguish between "examples of what you want" (CLEAR) and "examples as a prompting technique" (multi-shot). This creates confusion when both are referenced later.
- Module 1-2 teaches a separate 5-element model (Objective, Context, Format, Constraints, Review) that partially overlaps with CLEAR. Having two frameworks in consecutive modules without explicitly reconciling them may confuse learners. Module 1-2 says "Objective, Context, Format, Constraints, Review." Module 1-3 says "Context, Length/Format, Examples, Audience, Requirements." These are not identical but are close enough to generate confusion.

**Rating:** Adequate

**Recommendation:** Either consolidate Modules 1-2 and 1-3 into a single "Prompt Structure" module that presents CLEAR as the primary framework (positioning the 5-element model as background context), or add an explicit mapping at the start of 1-3 showing how CLEAR extends and replaces the simpler model. Do not present two competing frameworks back-to-back without reconciliation.

---

### 1.5 Cognitive Load Analysis

**Finding:** The 8+5+5 module structure creates an unbalanced cognitive load distribution. Session 1 has 8 modules but covers foundational concepts that could be tightened. Session 2 has 5 modules but covers the most complex new material (agent architecture, system prompts, tool integration). Session 3 has 5 modules but includes the most time-intensive content (Module 3-2 at 20 minutes, Module 3-5 at 30 minutes).

**Time analysis by session:**
- Session 1: 8 modules, ~34 minutes estimated total (range: 3-5 min per module)
- Session 2: 5 modules, ~77 minutes estimated total (range: 10-25 min per module)
- Session 3: 5 modules, ~95 minutes estimated total (range: 15-30 min per module)

**The issue:** Session 1 has the most modules but the least total time. Session 3 has the fewest modules but the most time. Learners may perceive Session 1 as a rapid sequence of short modules (possible "clicking through" behavior) while Session 3 modules demand sustained engagement with much less structural variety.

**Rating:** Needs Improvement

**Recommendation:** Consolidate Session 1 to 6 modules of 6-8 minutes each (total ~40 min) by merging 1-1/1-2 and 1-4/1-5. Consider splitting Module 3-5 (30-minute capstone) into two parts: Part A (task selection and prompt iteration, 15 min) and Part B (reflection and self-assessment, 15 min). This would create a more balanced 6+5+6 structure with more consistent per-module time across sessions.

---

### 1.6 Capstone Design

**Finding:** Each session ends with a capstone exercise that serves as a culminating assessment. The three capstones show a clear progression in complexity and autonomy.

- **Module 1-8 (Session 1 Capstone):** Structured scenario with three defined deliverables (executive summary, financial ratios, discussion questions). Learner applies CLEAR framework to a credit committee preparation scenario. Success criteria reference framework usage, context-setting, format specification, and compliance notes. This is an appropriately guided capstone for a foundations session.

- **Module 2-5 (Session 2 Capstone):** Three-part exercise: assemble a system prompt from prior module work, design three test scenarios (standard, edge case, out-of-scope), and reflect on gaps. This capstone effectively requires learners to synthesize work from 2-2 through 2-4. The 150-400 word target for system prompts is a practical, measurable constraint. The three-scenario testing framework is excellent assessment design.

- **Module 3-5 (Session 3 Capstone):** Open-ended with four department-aligned options (Credit, Finance, Retail, Compliance). Requires 3+ prompts showing iteration, a complete AI-generated deliverable, and a 3-sentence reflection. The requirement to "choose a real task -- not a hypothetical" and to identify both a strength and a limitation of the AI-assisted approach demonstrates mature assessment design.

**Rating:** Strong

**Recommendation:** Add a peer review component to the Session 3 capstone. The current design is entirely self-assessed, which limits accountability. Even a lightweight mechanism (share your agent template with one colleague and get 2 pieces of feedback) would add rigor and simulate the real-world collaboration these skills require.

---

### 1.7 Engagement Mechanisms

**Finding:** The curriculum relies on several engagement mechanisms: Andrea's personalized coaching, department-specific scenarios, practice tasks with immediate application, the learning style system, and proficiency-based adaptation. The AI coaching model (Andrea) is the primary engagement driver, providing personalized greetings, Socratic questioning, contextual suggested prompts, memory of past interactions, and session-adaptive coaching depth.

**Present engagement mechanisms:**
- Andrea's personalized coaching with memory and contextual suggested prompts
- Department-specific practice scenarios (accounting, credit, executive)
- Practice tasks in every module with success criteria
- Learning style adaptation (4 styles)
- Proficiency-based language adjustment (beginner/intermediate/advanced)
- Compliance coaching alerts that turn mistakes into teaching moments
- Agent Studio and Workflow Studio -- learners build tangible artifacts

**Missing engagement mechanisms:**
- No gamification (badges, streaks, leaderboards, completion certificates)
- No social learning features (discussion forums, peer comparison, cohort progress)
- No spaced repetition or retrieval practice between sessions
- No pre/post knowledge comparison to show growth
- No real-time progress visualization beyond module completion

**Rating:** Adequate

**Recommendation:** Add completion certificates at the session level and a visible progress dashboard. Implement a "knowledge check" at the start of Sessions 2 and 3 that references Session 1 concepts (retrieval practice). Even without gamification, showing learners how far they have come (before/after prompt comparison) would significantly boost motivation.

---

### 1.8 Learning Style Differentiation

**Finding:** The platform defines four learning styles (example-based, explanation-based, hands-on, logic-based) with distinct characteristics and lesson approaches. These are integrated into Andrea's coaching via the `getLearningStyleInstructions()` function in `trainer_chat/index.ts`, which injects 4 bullet points of coaching guidance per style. There is also a separate `techLearningStyle` dimension for how learners approach AI tool concepts specifically.

**The differentiation is shallow.** The coaching instructions for each style are 4 generic bullets. For example, the hands-on style instruction says: "Keep exposition minimal, provide a short checklist of action items, give a tiny task or exercise to try immediately, focus on practical application over theory." This is a reasonable description of hands-on pedagogy, but it provides Andrea with no style-specific *content* -- only style-specific *delivery instructions*. The actual module content (overviews, key points, examples, practice tasks) is identical regardless of learning style.

The dual learning style model (content learning style + tech learning style) is an interesting concept, but the tech learning style instructions are even thinner -- a single sentence each.

**Rating:** Needs Improvement

**Recommendation:** For the learning style system to deliver genuine differentiation, Andrea needs style-specific coaching scripts for key teaching moments, not just generic delivery instructions. Develop 2-3 "coaching moves" per style per session. For example: when a logic-based learner asks about the CLEAR framework, Andrea should present it as a decision tree ("If your task involves a customer audience, start with A. If internal, start with R."). When an example-based learner asks the same question, Andrea should show the completed CLEAR prompt first and then deconstruct it. These should be embedded in the lesson content chunks retrieved via RAG, not just in the system prompt header.

---

## Lens 2: AI Enablement Training Expert

### 2.1 Skill Selection

**Finding:** The curriculum covers a strong foundation of AI skills for non-technical banking professionals: prompt crafting (CLEAR framework), context-setting, data security awareness, iterative refinement, agent configuration (system prompts, guard rails, compliance anchors), tool integration evaluation, multi-step workflow design, and advanced techniques (chain-of-thought, multi-shot, self-review).

**Skills that are well-covered:**
- Prompt structure and specificity (Modules 1-1 through 1-4)
- Compliance-aware prompting (Module 1-6, 3-2)
- Agent building for non-technical users (Modules 2-1 through 2-5)
- Workflow decomposition with human review checkpoints (Module 3-3)
- Department-specific application (Module 3-1)

**Critical skills NOT covered:**
- **Hallucination detection and output verification:** The curriculum repeatedly says "review the output" but never teaches how to identify AI fabrication -- plausible-sounding but incorrect financial figures, invented regulatory citations, or subtly wrong ratio interpretations. This is the most dangerous gap for banking professionals.
- **Prompt injection and security awareness:** As learners build agents for others to use, they need to understand how malicious or accidental prompt injection can override system instructions.
- **Multi-modal AI:** No coverage of image analysis, document OCR, or voice-to-text capabilities that are increasingly relevant for banking (check image processing, document scanning, meeting transcription).
- **AI tool selection:** No guidance on evaluating different AI tools (ChatGPT vs. Claude vs. Copilot vs. Gemini) for different banking tasks, or understanding model capability differences.
- **When NOT to use AI:** No module explicitly teaches recognition of tasks where AI is inappropriate -- highly confidential M&A work, regulatory filing language, customer-specific legal communications.

**Rating:** Adequate

**Recommendation:** Add hallucination detection as a dedicated module (highest priority). Add a brief "When AI Is Not the Answer" section to Module 3-2 (Compliance & AI). Address prompt injection as a subsection of Module 2-2 (Agent Architecture). Multi-modal AI and tool selection can wait for a future curriculum version.

---

### 2.2 Department Scenario Quality

**Finding:** The curriculum includes department-specific scenarios for three departments: Accounting & Finance, Credit Administration, and Executive Leadership. These appear in Module 3-1 practice tasks and as departmentScenarios variants in Modules 3-1 through 3-4. Additionally, the topics.ts file defines 3 specific topics per department (9 total), including specialized focus areas like "AI-Assisted First-Draft Credit Memo from Unstructured Inputs" and "AI-Powered Variance Analysis."

**Accounting & Finance scenarios:** Realistic and well-scoped. Variance analysis commentary, reconciliation processes, and financial summaries map directly to actual accounting workflows. The board report commentary workflow (Module 3-3 example) is excellent -- it mirrors real month-end close processes.

**Credit Administration scenarios:** The strongest department content in the curriculum. Credit memo drafting, risk assessment with ratio analysis, borrower document review, and annual loan review workflows are all high-frequency, high-value tasks. The credit-specific examples throughout (DSCR, current ratio, debt-to-equity) demonstrate genuine domain knowledge.

**Executive Leadership scenarios:** The weakest of the three. While board presentation preparation and strategic summaries are relevant, the scenarios lack the specificity of the credit and accounting tracks. Executive AI use cases tend toward generic business tasks (talking points, variance commentary) that do not leverage the unique decision-making context of bank leadership. Missing: AI for competitive analysis, M&A due diligence support, regulatory strategy, and stakeholder communication (shareholder letters, examiner responses).

**Missing departments:** The curriculum covers only 3 of the typical 8-12 departments in a community bank. Notable absences include Retail Banking/Branch Operations (mentioned only as an example in Module 3-1, not as a department track), Compliance/Risk Management, IT/Information Security, Human Resources, and Wealth Management/Trust. The Module 3-1 examples include a Retail Banking and a Risk & Compliance use case, suggesting the authors recognize these gaps but have not yet built full department tracks.

**Rating:** Strong (Credit), Adequate (Accounting), Needs Improvement (Executive)

**Recommendation:** Strengthen the Executive track with scenarios specific to bank leadership: examiner response preparation, strategic planning with SWOT-style AI analysis, board package assembly workflows. Add Retail Banking and Compliance/Risk Management as department tracks -- these represent large employee populations in most community banks and have distinct AI use case profiles.

---

### 2.3 Pacing Assessment

**Finding:** The curriculum progresses from "what is a prompt" (Module 1-1, 4 minutes) to "build an agent with guard rails and compliance anchors" (Module 2-5, 25 minutes) to "design a multi-step workflow and apply advanced techniques to a real banking task" (Module 3-5, 30 minutes). The total estimated time across all 18 modules is approximately 206 minutes (~3.5 hours).

**Session 1 pacing:** Appropriately slow for foundations. Eight modules at 3-5 minutes each allow concepts to sink in without overloading. However, this also means Session 1 could feel slow for learners who already have basic AI experience (proficiency level 3+). The proficiency-based adaptation in Andrea's coaching partially addresses this, but the content itself does not adapt.

**Session 2 pacing:** This is where the pace accelerates significantly. Module 2-1 (12 min) introduces the agent concept. Module 2-2 (15 min) covers the four architectural pillars. Module 2-3 (10 min) provides the template. Module 2-4 (15 min) introduces tool integration. Module 2-5 (25 min) is the build-and-test capstone. The jump from "understand what an agent is" to "build a deployable agent with 5 sections, test it against 3 scenario types, and identify gaps" in 5 modules is ambitious. For a true beginner (proficiency 0-2), this pace may be challenging.

**Session 3 pacing:** Appropriately paced for the complexity. Modules are longer (15-30 min) and more applied. The final capstone at 30 minutes is the longest single module, which is appropriate for a culminating project.

**Overall verdict:** The pacing is realistic for learners with proficiency level 3-5 (intermediate). It may be too fast for true beginners (0-2) in Session 2 and too slow for advanced users (6-8) in Session 1. The proficiency assessment enables adaptive coaching but does not adapt the module sequence or content itself.

**Rating:** Adequate

**Recommendation:** For learners assessed at proficiency 0-2, consider adding an optional "Agent Building Prep" bridge module between Sessions 1 and 2 that walks through a complete agent build step-by-step before they encounter the architecture theory. For learners at proficiency 6-8, consider allowing Session 1 to be completed as a "challenge mode" where all 8 modules are compressed into a single assessment exercise.

---

### 2.4 Proficiency Assessment Validity

**Finding:** The onboarding assessment consists of 6 scenario-based questions across dimensions (AI Exposure, Prompt Approach, Evaluating AI Output, Working Through Problems, Data Sensitivity Awareness, AI Automation Familiarity). Each question has 4 options scoring 0, 2, 5, or 8. A confidence self-report (1-5 scale) applies a small adjustment (+/- 1 point). The final score maps to 0-8.

**Strengths:**
- The 6 dimensions cover a reasonable breadth of AI proficiency facets.
- Scenarios are banking-specific (loan renewal talking points, past-due account email, risk assessment formatting, financial statement analysis, reusable AI agent concept), which increases face validity.
- The scoring formula (70% quiz average + 30% quiz-with-confidence-adjustment) appropriately weights demonstrated knowledge over self-perception.
- The 0/2/5/8 point scale creates meaningful differentiation between "no experience," "basic awareness," "competent application," and "sophisticated practice."

**Weaknesses:**
- **All items are self-report.** The learner selects a description of what they *would* do, not what they *can* do. This is a knowledge-about-practice measure, not a performance measure. Research consistently shows that self-reported skill levels correlate poorly with actual performance, especially for novices (Dunning-Kruger effect).
- **The confidence adjustment is too weak.** The +/- 1 point adjustment on a 0-8 scale means confidence shifts the score by at most 12.5%. In practice, overconfident beginners and underconfident intermediates will be minimally corrected.
- **No performance-based items.** None of the 6 questions ask the learner to actually evaluate or improve a prompt. Adding even 1-2 items where the learner must identify what is wrong with a sample prompt (or rank prompts by quality) would dramatically improve validity.
- **Limited range at the top.** The highest score (8) requires selecting the most sophisticated option on every question AND having high confidence. This ceiling means genuinely advanced users cannot be distinguished from strong intermediates.

**Rating:** Needs Improvement

**Recommendation:** Replace 2 of the 6 self-report questions with performance-based items. Example: present a banking prompt and ask the learner to identify what is missing (multiple-select) or rank 3 prompts from least to most effective. This tests actual pattern recognition, not self-perception. Also increase the confidence adjustment range to +/- 1.5 to give the self-calibration factor more weight.

---

### 2.5 Andrea's Coaching Model

**Finding:** Andrea is implemented as a Claude-powered AI coach with a deeply considered persona and session-adaptive coaching behavior. The system prompt in `trainer_chat/index.ts` defines 5 persona anchors (Direct but Warm, Banking-Savvy, Quietly Encouraging, Solution-Focused, Knows She's AI), Socratic coaching rules with 5 explicit exceptions, and a 3-tier coaching depth model:

- **Session 1 (Hand-Holding):** Explains thoroughly, offers examples proactively, checks in frequently, frames mistakes as normal, suggests next steps.
- **Session 2 (Collaborative):** Asks before telling, references Session 1 concepts, expects attempt before help, gives hints not answers, pushes for specificity, gives specific praise.
- **Session 3 (Peer):** Challenges thinking, is direct and concise, pushes for production quality, asks learners to explain reasoning, introduces advanced concepts naturally, acts as a sounding board.

**This is an exceptionally well-designed coaching progression.** The transition from "I'll show you" (Session 1) to "What do you think?" (Session 2) to "Would you send this to your manager?" (Session 3) mirrors effective mentorship in professional settings. The Socratic rules with explicit exceptions (give direct answers when context is already provided, when the learner is stuck on attempt 3+, when there is one right answer) prevent the common failure mode of AI coaches that over-question.

**Additional sophistication:**
- Compliance pre-processing detects PII, compliance bypass attempts, bulk data requests, and inappropriate use *before* the Claude call, injecting coaching alerts into the system prompt. This is proactive safety design.
- Andrea remembers learner insights via the `memorySuggestion` mechanism, creating continuity across sessions.
- Practice conversation review allows Andrea to reference specific prompts by number and evaluate prompt quality against module success criteria.
- Agent and workflow context injection lets Andrea coach on the learner's specific build-in-progress, not generic advice.

**Weakness:** The coaching depth is applied at the session level, not the module level. A learner who breezes through Modules 2-1 through 2-3 but struggles on Module 2-4 (Tool Integration) still receives "Collaborative" coaching on 2-4. Module-level adaptation would be more responsive.

**Rating:** Strong

**Recommendation:** Consider adding a within-session adaptation signal. If a learner asks more than 3 clarifying questions on a single module (detected via message count), Andrea could temporarily shift down one coaching level for that module. Conversely, if a learner's practice conversation scores well on first attempt, Andrea could shift up. This would add micro-adaptation within the macro session tiers.

---

### 2.6 Compliance Integration

**Finding:** Compliance is deeply integrated throughout the curriculum, not treated as a separate or bolted-on topic. This is one of the curriculum's greatest strengths.

**Integration evidence:**
- **Module 1-5 (Setting Context):** Introduces "Security context" as one of five context-setting elements. Teaches learners to proactively specify what NOT to include.
- **Module 1-6 (Data Security):** Dedicated module on PII protection, placeholder usage, and data sanitization with a hands-on sanitization exercise.
- **Module 2-2 (Agent Architecture):** Guard rails and compliance anchors are two of the four architectural pillars -- not optional add-ons.
- **Module 2-3 (Custom Instructions Template):** Compliance anchors are one of five required template sections. Every example template includes specific compliance language (FDCPA disclosures, internal-use disclaimers, credit decision disclaimers).
- **Module 3-2 (Compliance & AI):** A dedicated 20-minute deep-dive covering the three pillars (Data Handling, Decision-Making, Documentation), the 5-step Pre-Task Compliance Check, and the "newspaper test."
- **Module 3-3 (Workflows):** Every workflow example includes human review checkpoints explicitly positioned as compliance mechanisms.
- **Andrea's system:** Real-time compliance detection (PII patterns, bypass phrases, bulk export requests, inappropriate use) with coaching responses that turn compliance violations into teaching moments rather than error messages.

**Strength:** The compliance content is not just "don't do bad things." It provides concrete tools (the Pre-Task Compliance Check, the compliance anchors template, the decision vs. analysis distinction) that learners can actually use in their work.

**Weakness:** The compliance content does not address emerging regulatory considerations for AI use in banking specifically, such as the OCC's guidance on model risk management (SR 11-7 applicability to AI), fair lending implications of AI-assisted analysis (ECOA/CRA), or state-level AI regulations. The "fair lending" mention in Module 3-2 is one bullet point, not a developed topic.

**Rating:** Strong

**Recommendation:** Add a brief "Regulatory Landscape" subsection to Module 3-2 that references (without deeply explaining) the key regulatory frameworks applicable to AI in banking: OCC guidance on model risk, CFPB positions on AI in lending, and FFIEC examination expectations. This does not need to be comprehensive legal training -- just enough for learners to know what exists and when to escalate to compliance.

---

### 2.7 Real-World Readiness

**Finding:** After completing all 3 sessions (18 modules, approximately 3.5 hours), a banking professional would have:

- A mental model for prompt construction (CLEAR framework)
- Awareness of data security requirements in AI prompting
- A deployable agent template customized to their role
- A documented multi-step workflow with compliance checkpoints
- Exposure to advanced techniques (chain-of-thought, multi-shot, self-review)
- A completed real-work deliverable (Session 3 capstone)
- A personal compliance checklist for AI use

**Would they be able to use AI effectively?** Mostly yes for straightforward tasks (drafting, summarizing, formatting). Partially for analytical tasks (risk assessment, variance analysis). Not yet for complex multi-agent workflows or tasks requiring significant AI output validation.

**The strongest readiness indicator** is the Session 3 capstone requirement to complete a real banking task with 3+ prompt iterations and a reflection on what AI got right and wrong. This forces genuine skill application.

**The gap** is that the curriculum does not address the "Day 2" problem: what happens when the learner encounters a novel situation not covered by any module? There is no module on debugging failed prompts, no framework for when AI gives persistently bad output, and no escalation path for "I followed the framework and it still does not work."

**Rating:** Adequate

**Recommendation:** Add a brief "Troubleshooting AI Output" section to Module 1-7 (Iteration & Refinement) or create a standalone reference card. Cover: what to do when AI gives consistently wrong output (check your assumptions, simplify, provide examples), when to abandon AI and do the task manually, and when to escalate to your bank's AI champion or IT team. This "escape hatch" knowledge builds confidence for real-world use.

---

### 2.8 Gap Analysis

**Finding:** The curriculum has notable gaps in the following areas:

| Gap | Severity | Rationale |
|-----|----------|-----------|
| Hallucination detection / output verification | Critical | Banking professionals cannot identify when AI fabricates data. "Review the output" is insufficient instruction. |
| Prompt security / injection awareness | High | Agents built by learners could be vulnerable to prompt injection if shared or deployed. |
| When NOT to use AI | High | No explicit framework for recognizing tasks inappropriate for AI (highly confidential, legally binding, regulatory filings). |
| AI tool comparison | Medium | Learners may need to choose between ChatGPT, Claude, Copilot, etc. for different tasks. No guidance provided. |
| Multi-modal AI capabilities | Medium | Document OCR, image analysis, and voice transcription are increasingly relevant for banking. |
| Collaborative AI use | Medium | How teams share agents, establish conventions, and maintain consistency across a department. No coverage. |
| AI output version control | Low | No guidance on saving, versioning, or documenting AI-assisted drafts. |
| Measuring AI ROI | Low | No framework for the learner to evaluate whether AI actually saved time or improved quality. |

**Rating:** Needs Improvement (due to the Critical-severity hallucination detection gap)

**Recommendation:** Address the Critical and High severity gaps before the next curriculum version. The Medium and Low gaps can be addressed through Andrea's coaching responses (adding relevant guidance when learners encounter these situations organically) rather than requiring new modules.

---

### 2.9 Agent/Workflow Building Progression

**Finding:** The progression from understanding agents (2-1) to designing architecture (2-2) to filling in a template (2-3) to evaluating tool integration (2-4) to building and testing (2-5) is pedagogically sound for non-technical users. The 5-section agent template (Identity, Task List, Output Rules, Guard Rails, Compliance Anchors) is an excellent simplification of complex system prompt engineering into a fill-in-the-blanks format that non-technical professionals can complete.

**The workflow progression** in Session 3 (Module 3-3) is equally well-designed. The three example workflows (Annual Loan Review, Monthly Board Report, Customer Complaint Response) demonstrate increasing complexity and different department contexts. The emphasis on human review checkpoints as "the compliance mechanism" is a brilliant framing that makes compliance feel like a feature, not a burden.

**The Agent Studio and Workflow Studio** tools (referenced in Andrea's system prompt via `agentContext` and `workflowContext`) allow learners to build tangible artifacts that Andrea can coach on in real-time. Andrea can see the learner's agent template sections (identity, task list, output rules, guard rails, compliance anchors) and provide specific feedback like "Your guard rails could include a redirect for investment advice." This real-time coaching on in-progress work is a significant differentiator from static curriculum delivery.

**Weakness:** The curriculum does not address what happens after the agent is built. There is no module on agent maintenance, version iteration, sharing agents with colleagues, or measuring agent effectiveness over time. The "deploy" action in the Agent Studio is referenced but not pedagogically supported.

**Rating:** Strong

**Recommendation:** Add a brief "Living Agent" section to Module 2-5 or as a post-capstone note. Cover: how to iterate on your agent after real-world use (add guard rails when you discover gaps), how to share agent templates with colleagues (the 5-section format makes this easy), and how to evaluate whether the agent is actually improving your work (compare time spent before/after on a recurring task).

---

## Appendix: Module-by-Module Reference

### Session 1: AI Prompting & Personalization (8 modules)

| Module | Title | Time | Bloom's Level | Key Strength | Key Concern |
|--------|-------|------|---------------|--------------|-------------|
| 1-1 | What is AI Prompting? | 4 min | Remember | Good intro video format, accessible | Low cognitive demand |
| 1-2 | Anatomy of a Good Prompt | 5 min | Understand | 5-element model is clear | Overlaps with CLEAR in 1-3 |
| 1-3 | The CLEAR Framework | 5 min | Understand/Apply | Strong banking-specific example | Two frameworks in two modules |
| 1-4 | Good vs Bad Prompts | 4 min | Analyze | Side-by-side comparisons are effective | Could be merged with 1-5 |
| 1-5 | Setting Context for Banking | 4 min | Apply | 5 context types are comprehensive | Overlaps with CLEAR "Context" |
| 1-6 | Data Security in Prompts | 3 min | Apply | Excellent sanitization exercise | Could be longer |
| 1-7 | Prompt Iteration | 4 min | Apply/Analyze | Teaches iterative mindset | No framework for when iteration fails |
| 1-8 | Capstone | 5 min | Apply | Realistic credit committee scenario | Binary success criteria |

### Session 2: Building Your AI Agent (5 modules)

| Module | Title | Time | Bloom's Level | Key Strength | Key Concern |
|--------|-------|------|---------------|--------------|-------------|
| 2-1 | What is an AI Agent? | 12 min | Understand | Agent vs prompt distinction is clear | Abrupt transition from Session 1 |
| 2-2 | Agent Architecture | 15 min | Analyze | 4 pillars model is excellent | Dense content for non-technical users |
| 2-3 | Custom Instructions Template | 10 min | Apply/Create | 5-section template is brilliant | Three full template examples may overwhelm |
| 2-4 | Tool Integration | 15 min | Evaluate | Risk evaluation framework is valuable | Feels disconnected from template building |
| 2-5 | Build Your Agent Capstone | 25 min | Create/Evaluate | 3-scenario testing is excellent | No post-build maintenance guidance |

### Session 3: Role-Specific Training (5 modules)

| Module | Title | Time | Bloom's Level | Key Strength | Key Concern |
|--------|-------|------|---------------|--------------|-------------|
| 3-1 | Department AI Use Cases | 15 min | Analyze | 5 department examples with prompts | Only 3 department tracks supported |
| 3-2 | Compliance & AI | 20 min | Evaluate | 3 pillars + 5-step checklist | Missing regulatory landscape context |
| 3-3 | Workflow Examples | 15 min | Create | 3 complete workflows with checkpoints | No workflow maintenance guidance |
| 3-4 | Advanced Techniques | 15 min | Analyze/Evaluate | CoT, multi-shot, self-review well-taught | Decomposition technique underexplored |
| 3-5 | Capstone Project | 30 min | Create/Evaluate | Open-ended with real-work requirement | No peer review component |

---

## Summary of Ratings

### Lens 1: Instructional Design

| Area | Rating |
|------|--------|
| Bloom's Taxonomy Alignment | Adequate |
| Scaffolding Quality | Strong (macro) / Adequate (micro) |
| Practice Task Design | Strong |
| CLEAR Framework Assessment | Adequate |
| Cognitive Load | Needs Improvement |
| Capstone Design | Strong |
| Engagement Mechanisms | Adequate |
| Learning Style Differentiation | Needs Improvement |

### Lens 2: AI Enablement Training

| Area | Rating |
|------|--------|
| Skill Selection | Adequate |
| Department Scenario Quality | Strong (Credit) / Adequate (Accounting) / Needs Improvement (Executive) |
| Pacing Assessment | Adequate |
| Proficiency Assessment Validity | Needs Improvement |
| Andrea's Coaching Model | Strong |
| Compliance Integration | Strong |
| Real-World Readiness | Adequate |
| Gap Analysis | Needs Improvement |
| Agent/Workflow Building | Strong |

---

*End of Curriculum Review*
