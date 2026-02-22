// Complete training content for Session 1: AI Prompting & Personalization

export interface ModuleContent {
  id: string;
  title: string;
  type: 'document' | 'example' | 'exercise' | 'video';
  description: string;
  estimatedTime: string;
  videoUrl?: string; // Optional video URL for video-type modules
  learningObjectives: string[];
  content: {
    overview: string;
    keyPoints: string[];
    examples?: {
      title: string;
      good?: string;
      bad?: string;
      explanation: string;
    }[];
    steps?: string[];
    practiceTask: {
      title: string;
      instructions: string;
      scenario: string;
      hints: string[];
      successCriteria: string[];
      departmentScenarios?: {
        accounting_finance: { scenario: string; hints: string[] };
        credit_administration: { scenario: string; hints: string[] };
        executive_leadership: { scenario: string; hints: string[] };
      };
    };
  };
}

export interface SessionContent {
  id: number;
  title: string;
  description: string;
  modules: ModuleContent[];
}

export const SESSION_1_CONTENT: SessionContent = {
  id: 1,
  title: 'AI Prompting & Personalization',
  description: 'Master the fundamentals of effective AI prompting for banking professionals',
  modules: [
    {
      id: '1-1',
      title: 'What is AI Prompting?',
      type: 'video',
      description: 'Quick intro to what AI prompting is and why it matters',
      estimatedTime: '4 min',
      videoUrl: 'https://youtu.be/xZ1FAm7IoA4',
      learningObjectives: [
        'Understand what AI prompting is and why it matters',
        'Learn the basic structure of an effective prompt',
      ],
      content: {
        overview: 'AI prompting is the skill of crafting clear, specific instructions to get useful responses from AI systems. Just like giving instructions to a colleague, the clearer your request, the better the result.',
        keyPoints: [
          'A prompt is simply an instruction or question you give to an AI',
          'The quality of your prompt directly affects the quality of the response',
          'AI works best with clear, specific, and contextual instructions',
        ],
        examples: [
          {
            title: 'Requesting a Summary',
            bad: 'Summarize this.',
            good: 'Please provide a 3-paragraph executive summary of this quarterly report, highlighting key financial metrics, notable trends, and recommendations for the board.',
            explanation: 'The good prompt specifies the format (3 paragraphs), audience (executives/board), and what to focus on (metrics, trends, recommendations).',
          },
        ],
        practiceTask: {
          title: 'Your First Prompt',
          instructions: 'Transform a vague request into a clear, specific prompt.',
          scenario: 'You need to ask AI to help you write an email to a customer about their loan application status.',
          hints: [
            'Specify the tone (professional, friendly, formal)',
            'Include what information to convey',
            'Mention any specific details to include or avoid',
          ],
          successCriteria: [
            'Prompt specifies the purpose clearly',
            'Includes context about the audience',
            'Mentions desired format or structure',
          ],
        },
      },
    },
    {
      id: '1-2',
      title: 'Anatomy of a Good Prompt',
      type: 'document',
      description: 'The 5 elements every effective prompt should include',
      estimatedTime: '5 min',
      learningObjectives: [
        'Recognize how prompt quality affects AI output',
        'Identify the 5 key elements of a good prompt',
      ],
      content: {
        overview: 'Every effective prompt has five key elements: Objective, Context, Format, Constraints, and Review. Understanding these elements helps you get consistently good results from AI.',
        keyPoints: [
          'Start with a clear objective: What do you want the AI to produce?',
          'Provide relevant context: What background does the AI need?',
          'Specify the format: How should the output be structured?',
          'Include constraints: What should be included or excluded?',
          'Review and refine: Check the output and adjust your prompt if needed',
        ],
        steps: [
          'State your objective in one sentence',
          'Add 1-2 sentences of context',
          'Specify the output format you want',
          'Note any constraints or exclusions',
          'Plan to review and iterate on the result',
        ],
        practiceTask: {
          title: 'Build a 5-Element Prompt',
          instructions: 'Write a prompt that includes all 5 elements for this banking scenario.',
          scenario: 'You need AI to help draft a brief talking point for a customer meeting about their savings account options.',
          hints: [
            'What is the objective?',
            'What context does the AI need?',
            'What format works best for talking points?',
            'What should be excluded (e.g., specific rates)?',
          ],
          successCriteria: [
            'Includes a clear objective',
            'Provides relevant context',
            'Specifies output format',
            'Mentions constraints or exclusions',
          ],
        },
      },
    },
    {
      id: '1-3',
      title: 'The CLEAR Framework',
      type: 'document',
      description: 'A structured approach: Context, Length, Examples, Audience, Requirements',
      estimatedTime: '5 min',
      learningObjectives: [
        'Apply the CLEAR framework to structure prompts',
        'Identify components of a well-structured prompt',
      ],
      content: {
        overview: 'The CLEAR framework helps you structure prompts for consistent, high-quality results. CLEAR stands for: Context, Length/Format, Examples, Audience, and Requirements.',
        keyPoints: [
          'Context: Provide background information the AI needs',
          'Length/Format: Specify the desired output format (bullet points, paragraphs, table)',
          'Examples: Include samples of what you want when helpful',
          'Audience: Describe who will read/use the output',
          'Requirements: State any constraints or must-haves',
        ],
        steps: [
          'Start with context: "I am a loan officer reviewing..."',
          'Define format: "Please provide a bullet-point summary..."',
          'Add examples if needed: "Similar to this format..."',
          'Specify audience: "This will be shared with the credit committee..."',
          'List requirements: "Must include risk factors, exclude customer PII..."',
        ],
        examples: [
          {
            title: 'CLEAR Framework Example',
            good: `Context: I am a credit analyst reviewing a commercial loan application for a manufacturing company.

Length/Format: Please provide a 2-page analysis in the following sections: Executive Summary, Financial Highlights, Risk Assessment, Recommendation.

Examples: The analysis should follow our standard credit memo format with quantitative metrics highlighted.

Audience: This will be reviewed by the senior credit committee who are familiar with lending terminology.

Requirements: Include debt service coverage ratio, current ratio, and industry comparison. Do not include any specific customer names or addresses in this draft.`,
            explanation: 'This prompt uses all five CLEAR components to give the AI comprehensive guidance for generating a useful credit analysis.',
          },
        ],
        practiceTask: {
          title: 'Apply the CLEAR Framework',
          instructions: 'Use the CLEAR framework to write a prompt for the following scenario.',
          scenario: 'You need to generate a summary of a borrower\'s financial statements for a loan review meeting.',
          hints: [
            'What context does the AI need about your role?',
            'What format works best for a review meeting?',
            'Who will be in the meeting?',
            'What compliance requirements apply?',
          ],
          successCriteria: [
            'Includes clear context about the task',
            'Specifies output format',
            'Identifies the audience',
            'Lists specific requirements or constraints',
          ],
        },
      },
    },
    {
      id: '1-4',
      title: 'Good vs Bad Prompts',
      type: 'example',
      description: 'Side-by-side comparison of effective and ineffective banking prompts',
      estimatedTime: '4 min',
      learningObjectives: [
        'Identify common prompt mistakes',
        'Recognize characteristics of effective prompts',
      ],
      content: {
        overview: 'Learning to recognize what makes prompts effective helps you craft better instructions. These banking examples show side-by-side comparisons.',
        keyPoints: [
          'Vague prompts lead to generic, unhelpful responses',
          'Overly complex prompts can confuse the AI',
          'Missing context forces the AI to guess',
          'No format specification means unpredictable output',
        ],
        examples: [
          {
            title: 'Customer Communication',
            bad: 'Write an email about the loan.',
            good: 'Write a professional email to inform a small business customer that their $50,000 line of credit application has been approved. Include next steps for signing documents and the timeline for fund availability. Keep the tone warm but professional.',
            explanation: 'The good prompt specifies the customer type, loan details, purpose, what to include, and the desired tone.',
          },
          {
            title: 'Financial Analysis',
            bad: 'Analyze these numbers.',
            good: 'Analyze the following quarterly P&L statement for ABC Manufacturing. Identify trends in revenue, gross margin, and operating expenses compared to the prior quarter. Highlight any items that vary more than 10% and suggest questions to ask the borrower.',
            explanation: 'The good prompt names the document type, specifies what to analyze, sets thresholds, and requests actionable output.',
          },
          {
            title: 'Risk Assessment',
            bad: 'What are the risks?',
            good: 'Based on the attached financial summary for a restaurant business seeking a $200,000 term loan, identify the top 5 credit risks. For each risk, rate it as High/Medium/Low and suggest a mitigating factor or question to address it.',
            explanation: 'The good prompt provides context, specifies the number of risks, requests a rating system, and asks for mitigation suggestions.',
          },
        ],
        practiceTask: {
          title: 'Transform a Bad Prompt',
          instructions: 'Take the bad prompt below and rewrite it as an effective prompt.',
          scenario: 'Bad prompt: "Help me with this credit memo."\n\nContext: You\'re a credit analyst who needs to draft the risk factors section of a credit memo for a retail business applying for working capital.',
          hints: [
            'What specific help do you need?',
            'What type of business and loan?',
            'What section of the memo?',
            'What should be included?',
          ],
          successCriteria: [
            'Specifies the exact task (drafting risk factors)',
            'Includes business and loan context',
            'Defines expected output format',
            'Mentions any standards to follow',
          ],
        },
      },
    },
    {
      id: '1-5',
      title: 'Setting Context for Banking AI',
      type: 'document',
      description: 'How to provide role, task, and security context in banking prompts',
      estimatedTime: '4 min',
      learningObjectives: [
        'Master techniques for setting effective context',
        'Handle sensitive information appropriately',
      ],
      content: {
        overview: 'Context is the foundation of effective prompting. In banking, setting proper context helps the AI understand regulatory requirements, audience expectations, and professional standards while avoiding exposure of sensitive data.',
        keyPoints: [
          'Role context: Define who you are and your responsibilities',
          'Task context: Explain what you\'re trying to accomplish',
          'Constraint context: Specify limits, compliance needs, or restrictions',
          'Output context: Describe how the result will be used',
          'Security context: What NOT to include in responses',
        ],
        steps: [
          'Define your role: "As a [role], I am working on..."',
          'Explain the task: "I need to [action] for [purpose]..."',
          'Set constraints: "The output should/should not..."',
          'Specify use: "This will be used for [purpose]..."',
          'Add security notes: "Do not include [sensitive data types]..."',
        ],
        examples: [
          {
            title: 'Complete Context Example',
            good: `Role: I am a loan officer at a community bank.

Task: I need to draft talking points for a call with a business customer whose loan payment is 30 days past due.

Constraints: The tone should be supportive, not threatening. Focus on understanding their situation and offering solutions. Do not mention specific account numbers or balances.

Use: These talking points will guide my conversation to explore payment plan options.

Security: Use generic placeholders for any specific amounts or dates.`,
            explanation: 'This context setting covers all five elements: role, task, constraints, use, and security considerations.',
          },
        ],
        practiceTask: {
          title: 'Set Complete Context',
          instructions: 'Write a context-setting preamble for the following scenario.',
          scenario: 'You need AI help to prepare questions for an annual loan review meeting with a commercial real estate borrower.',
          hints: [
            'What is your role?',
            'What is the meeting about?',
            'What constraints apply (compliance, tone)?',
            'How will you use the AI output?',
          ],
          successCriteria: [
            'Clearly defines the user\'s role',
            'Explains the specific task',
            'Includes relevant constraints',
            'Considers data security',
          ],
        },
      },
    },
    {
      id: '1-6',
      title: 'Data Security in Prompts',
      type: 'document',
      description: 'What to share and what to protect when using AI in banking',
      estimatedTime: '3 min',
      learningObjectives: [
        'Know what data should never be shared with AI',
        'Learn to use placeholders for sensitive information',
      ],
      content: {
        overview: 'Banking professionals must balance getting helpful AI responses with protecting sensitive customer and institutional data. This module covers what to share and what to protect.',
        keyPoints: [
          'Never share customer PII (Social Security numbers, account numbers, addresses)',
          'Use placeholders for specific amounts: "$X" or "[AMOUNT]"',
          'Avoid sharing internal system credentials or access codes',
          'Anonymize customer details before including in prompts',
          'When in doubt, leave it out and ask the AI to work with generic data',
        ],
        practiceTask: {
          title: 'Sanitize a Prompt',
          instructions: 'Rewrite the following prompt to remove sensitive data while keeping it useful.',
          scenario: 'Original prompt: "Review John Smith\'s loan at 123 Main St, account #4567890, SSN 123-45-6789. His balance is $250,000 and he\'s 60 days past due. What collection approach should I take?"',
          hints: [
            'Replace the customer name with a generic reference',
            'Remove the address, account number, and SSN entirely',
            'Use a placeholder for the balance amount',
            'Keep the relevant business context (past due status)',
          ],
          successCriteria: [
            'All PII is removed or replaced with placeholders',
            'The prompt still conveys the business need',
            'Account numbers and SSNs are completely removed',
            'The AI can still provide useful guidance',
          ],
        },
      },
    },
    {
      id: '1-7',
      title: 'Prompt Iteration & Refinement',
      type: 'example',
      description: 'How to improve AI responses by refining your prompts step by step',
      estimatedTime: '4 min',
      learningObjectives: [
        'Practice iterative prompt refinement',
        'Learn when and how to adjust prompts for better results',
      ],
      content: {
        overview: 'Getting the best results from AI is often an iterative process. Start with a good prompt, review the output, and refine based on what you get.',
        keyPoints: [
          'First attempt rarely produces perfect results — that\'s normal',
          'Review output for accuracy, completeness, and tone',
          'Add specificity where the AI was too vague',
          'Remove instructions that led to unwanted content',
        ],
        examples: [
          {
            title: 'Iterative Refinement',
            bad: 'Write me a risk assessment.',
            good: 'Draft a risk assessment for a $500K equipment loan to a manufacturing company. Include: credit risk, collateral risk, industry risk. Format as a table with Risk Type, Rating (H/M/L), and Mitigation. Keep it under 1 page.',
            explanation: 'The refined prompt adds specificity about the loan, requested risks, format, and length constraints — all learned from a first attempt that was too generic.',
          },
        ],
        practiceTask: {
          title: 'Refine a Prompt',
          instructions: 'Start with the basic prompt below and refine it through 2-3 iterations.',
          scenario: 'Starting prompt: "Help me prepare for a loan committee meeting."\n\nYou are a credit analyst presenting a new commercial loan request. Iterate on this prompt to make it produce useful meeting prep materials.',
          hints: [
            'Add your role and the meeting context',
            'Specify what materials you need (summary, talking points, Q&A)',
            'Include format preferences',
            'Add compliance and security notes',
          ],
          successCriteria: [
            'Shows clear improvement from basic to refined',
            'Final prompt includes role context',
            'Specifies deliverables and format',
            'Considers compliance requirements',
          ],
        },
      },
    },
    {
      id: '1-8',
      title: 'Capstone: Complete Banking Prompt',
      type: 'exercise',
      description: 'Apply all skills to craft a comprehensive prompt for a real banking scenario',
      estimatedTime: '5 min',
      learningObjectives: [
        'Apply CLEAR framework in a realistic scenario',
        'Demonstrate prompting proficiency',
        'Combine all techniques into a single effective prompt',
      ],
      content: {
        overview: 'This capstone exercise brings together everything you\'ve learned. You\'ll craft a comprehensive prompt for a realistic banking scenario using the CLEAR framework, proper context-setting, and data security awareness.',
        keyPoints: [
          'Combine CLEAR framework with context-setting',
          'Start simple, then add detail as needed',
          'Review AI output and refine your prompt',
          'Consider how you\'d use this in your daily work',
        ],
        practiceTask: {
          title: 'Complete Banking Scenario',
          instructions: 'Work through this complete scenario using all your prompting skills.',
          scenario: `Scenario: You are preparing for a credit committee meeting tomorrow. You have a new loan request from a manufacturing company seeking $500,000 for equipment purchase. You need to:

1. Draft an executive summary of the loan request
2. Identify key financial ratios to highlight
3. List discussion questions for the committee

Create a prompt that will help you prepare these materials. Remember to use the CLEAR framework and proper context-setting.`,
          hints: [
            'Break it into parts if needed',
            'Set your role and the committee\'s expectations',
            'Specify the format for each deliverable',
            'Include compliance considerations',
            'Note what information to exclude (customer PII)',
          ],
          successCriteria: [
            'Uses CLEAR framework effectively',
            'Sets complete context for the task',
            'Specifies format for each output needed',
            'Includes compliance/security notes',
            'Could realistically be used in your work',
          ],
        },
      },
    },
  ],
};

export const SESSION_2_CONTENT: SessionContent = {
  id: 2,
  title: 'Building Your AI Agent',
  description: 'Create a custom AI agent tailored to your line of business',
  modules: [
    {
      id: '2-1',
      title: 'What is an AI Agent?',
      type: 'document',
      description: 'Understanding AI agents and their capabilities in banking',
      estimatedTime: '12 min',
      learningObjectives: [
        'Define what an AI agent is and how it differs from one-off prompting',
        'Understand why persistent instructions create consistency',
        'Identify use cases for agents in your banking role',
      ],
      content: {
        overview: 'A standard prompt is stateless — every session you re-establish your role, your constraints, and your expectations from scratch. An AI agent inverts this by embedding persistent system instructions that define behavior, tone, compliance rules, and output formats once, so every conversation automatically inherits them. Think of the difference between giving a new temp worker instructions every morning versus training a dedicated assistant who retains everything. In banking, where regulatory consistency matters, agents eliminate the risk of forgetting a compliance disclaimer or shifting tone between customer communications.',
        keyPoints: [
          'An AI agent is a configured assistant with persistent instructions that define its behavior before any user message arrives',
          'Unlike one-off prompts, an agent maintains consistent behavior across hundreds of interactions without manual repetition',
          'Agents can be specialized for specific roles — a loan officer agent behaves differently than a credit analyst agent',
          'Banking agents are most valuable for tasks with regulatory consistency requirements, where variation in tone or compliance language creates risk',
          'They can be configured with specific knowledge domains, output formats, tone guidelines, and explicit refusal rules',
          'Building an agent is a one-time investment that pays off every time you use it — the more repetitive the task, the higher the return',
        ],
        steps: [
          'Identify a repetitive task that would benefit from consistent AI assistance',
          'Define the core behavior and personality of your agent',
          'Specify the knowledge domain and expertise required',
          'Set boundaries and safety constraints',
          'Test the agent with realistic scenarios from your work',
        ],
        examples: [
          {
            title: 'Agent vs One-off Prompt',
            bad: 'Each time: "I\'m a loan officer at a community bank. Help me draft a professional, compliant collection follow-up email. Make sure to use a supportive tone, don\'t threaten, and include regulatory disclosures..."',
            good: 'Agent instruction (set once): "You are a Collections Communication Assistant for loan officers at a community bank. You help draft professional, compliant follow-up communications for past-due accounts. Always maintain a supportive, empathetic tone. Never use threatening language or imply legal action. Include standard FDCPA regulatory disclosures in every letter. Format outputs as ready-to-send emails with subject line, greeting, body, and sign-off."',
            explanation: 'The agent approach embeds your role, compliance requirements, tone preferences, and output format once. Every future interaction automatically follows these guidelines — you never forget a disclosure or drift in tone.',
          },
          {
            title: 'Role-Specific Agents: Loan Officer vs Credit Analyst',
            good: `Loan Officer Agent: "You are a Customer Communication Assistant for loan officers. You draft customer-facing emails, talking points, and follow-up letters. Use warm, professional language appropriate for customers. Always include required regulatory disclosures. Never quote specific interest rates without noting they are subject to credit review."

Credit Analyst Agent: "You are a Credit Analysis Assistant for commercial credit analysts. You help draft risk summaries, ratio commentary, and credit memo sections. Use precise financial language appropriate for internal credit committees. Always structure output as numbered sections with headers. Never make credit approval or denial recommendations — only summarize and flag risk factors."`,
            explanation: 'Each role has different compliance requirements, audiences, and output formats. The loan officer agent optimizes for customer communication; the credit analyst agent optimizes for internal analytical precision. Building role-specific agents prevents mismatched tone and compliance language.',
          },
        ],
        practiceTask: {
          title: 'Identify Agent Opportunities',
          instructions: 'List 3 repetitive tasks in your role that could benefit from a specialized AI agent.',
          scenario: 'Think about your typical work week. You likely draft similar emails, memos, summaries, or analyses repeatedly — each time re-explaining your role, your audience, and your compliance requirements to the AI. For each task you identify, note: (1) the task name, (2) how often you do it, (3) why consistency matters for that task, and (4) what would go wrong if the AI produced inconsistent output.',
          hints: [
            'What tasks do you repeat weekly?',
            'Where does inconsistency create risk?',
            'What takes too long but follows a pattern?',
            'Which tasks have compliance requirements?',
          ],
          successCriteria: [
            'Lists 3 specific, named tasks — not generic categories like "writing" or "analysis"',
            'Each task includes how frequently it is performed (daily, weekly, etc.)',
            'At least one task identifies a compliance or consistency benefit that justifies the agent approach',
            'Tasks are realistic for a banking role and suitable for AI assistance',
          ],
        },
      },
    },
    {
      id: '2-2',
      title: 'Agent Architecture',
      type: 'document',
      description: 'The four pillars of effective agent design',
      estimatedTime: '15 min',
      learningObjectives: [
        'Understand the four architectural pillars of an AI agent',
        'Learn how to define agent personality, output formats, and constraints',
        'Design agents that meet banking compliance requirements',
      ],
      content: {
        overview: 'Effective agents are built on four architectural pillars: the system prompt (behavior anchor), knowledge boundaries (what the agent knows and disclaims), output format specifications (so responses are predictable), and guard rails (explicit refusal patterns for out-of-scope or non-compliant requests). Think of it like a bank\'s operating procedures — each employee follows a manual that defines what they can do independently and what requires escalation. Your agent\'s architecture is its operating manual.',
        keyPoints: [
          'The system prompt is the agent\'s operating manual — it defines role, scope, tone, and constraints before any user message arrives',
          'Knowledge boundaries tell the agent what to assume and what to disclaim — a credit agent should know DSCR ratios but should not give legal advice',
          'Output format specifications make agent responses predictable — "always respond with a table" or "always use bullet headers with bold labels"',
          'Guard rails are explicit instructions for what the agent must refuse — "never quote specific interest rates," "always recommend human review for amounts over $1M"',
          'Separation of concerns: write one agent for customer communication and a different one for internal analysis — mixing audiences creates compliance risk',
        ],
        steps: [
          'Define the role in one sentence: who the agent is, who it serves, and what it helps with',
          'List the 3-5 tasks it will handle most frequently — these drive everything else',
          'Write output format expectations for each task type (prose, table, numbered list, memo sections)',
          'Draft guard rails: what topics, request types, or data the agent should refuse or redirect',
          'Add compliance anchors: regulatory disclosures, escalation triggers, and data handling rules',
        ],
        examples: [
          {
            title: 'Incomplete vs Complete System Prompt',
            bad: 'You are a helpful assistant for a bank. Help with whatever the user needs.',
            good: `You are a Collections Communication Assistant for loan officers at First Community Bank.

Role: You help draft professional follow-up communications for accounts that are 30, 60, and 90 days past due.

Tone: Supportive and empathetic. Never use threatening language. Frame past-due status as a situation to resolve together, not a failure.

Output Format: Always structure responses as ready-to-send letters with: Subject Line, Greeting, Body (3 paragraphs max), Action Items, and Sign-off.

Guard Rails:
- Never draft demand letters or communications implying legal action — redirect to the legal department
- Never reference specific account numbers or balances in draft text — use [ACCOUNT] and [AMOUNT] placeholders
- Never suggest payment amounts — only reference "your scheduled payment" or "an amount that works for your situation"

Compliance: Every letter must include the mini-Miranda FDCPA disclosure: "This communication is from a debt collector attempting to collect a debt. Any information obtained will be used for that purpose."`,
            explanation: 'The incomplete version produces inconsistent, potentially non-compliant output that varies with every interaction. The complete version ensures every communication follows the same standards — tone, format, compliance disclosures, and explicit refusals are all defined upfront.',
          },
          {
            title: 'Guard Rail Examples',
            good: `Examples of specific guard rail language for banking agents:

1. Rate Quoting: "Do not provide specific interest rate quotes. Instead say: 'Rates are determined based on creditworthiness and current market conditions. Please contact your loan officer for a personalized quote.'"

2. Credit Decisions: "Do not draft communications that imply guaranteed loan approval or denial. Use language like 'subject to review' and 'pending final determination.'"

3. Internal Disclaimer: "Always include at the end of any analytical output: 'This analysis is for internal review only and does not constitute a credit decision. Final determination requires authorized officer approval.'"

4. Escalation Trigger: "If asked about regulatory interpretations, respond: 'This question requires review by our compliance department. I can help you draft the referral memo.'"`,
            explanation: 'Guard rails use direct, specific language — not vague principles. Each one addresses a concrete compliance risk and provides the exact alternative language the agent should use instead of the prohibited response.',
          },
        ],
        practiceTask: {
          title: 'Design Agent Architecture',
          instructions: 'Draft a system prompt architecture using all four pillars for a banking role.',
          scenario: 'You are a credit analyst at a community bank. You need to build an agent that helps you draft initial risk summaries for commercial loan applications. The agent will be used for loans under $2M and must never make credit decisions — only summarize and flag risk factors. All output goes to a senior credit officer for review. Design the four-pillar architecture: (1) System Prompt with role definition, (2) Knowledge Boundaries, (3) Output Format specifications, and (4) Guard Rails with at least 2 explicit refusals.',
          hints: [
            'What is the agent\'s exact role?',
            'List 3 tasks it handles',
            'What format should risk summaries use?',
            'What should it never do?',
            'What compliance language is required?',
          ],
          successCriteria: [
            'Defines a specific role and target audience in the system prompt section',
            'Specifies output format for at least one task type (e.g., risk summary structure)',
            'Includes at least two explicit guard rails using direct "Do not..." or "Never..." language',
            'Includes a compliance disclaimer or escalation trigger',
            'Keeps scope narrow — handles one domain, not all banking tasks',
          ],
        },
      },
    },
    {
      id: '2-3',
      title: 'Custom Instructions Template',
      type: 'example',
      description: 'A five-section template for configuring your personal banking agent',
      estimatedTime: '10 min',
      learningObjectives: [
        'Use a structured template to create complete agent instructions',
        'Customize the template for your specific banking role',
        'Ensure compliance is built into agent instructions by default',
      ],
      content: {
        overview: 'A template trades coverage for speed. Rather than writing a system prompt from scratch — where you always forget something — the template forces you to address every architectural component. The five sections are: Identity, Task List, Output Rules, Guard Rails, and Compliance Anchors. Once you fill in a template for your role, you have a deployable system prompt that produces consistent, compliant output from the first interaction.',
        keyPoints: [
          'A template guarantees you address every architectural component — identity, tasks, output rules, guard rails, and compliance anchors',
          'The Identity section should be 2-3 sentences: your role, who you serve, and the primary purpose of the agent',
          'Task List entries follow this pattern: Task Name + Expected Output Format + Any Constraints specific to that task',
          'Guard rails should use direct language: "Do not...", "Always redirect...", "Require human review when..."',
          'Compliance anchors are standard phrases appended to relevant outputs — draft them once, and they appear in every applicable response',
        ],
        examples: [
          {
            title: 'Collections Communication Agent (Complete Template)',
            good: `IDENTITY:
You are a Collections Communication Assistant for loan officers at a community bank. You help draft professional, empathetic follow-up communications for past-due accounts. Your audience is bank customers who are behind on payments.

TASK LIST:
1. 30-Day Past-Due Letters | Format: 3-paragraph letter with subject line and sign-off | Constraint: Tone must be informational, not urgent
2. 60-Day Follow-Up Calls Script | Format: Numbered talking points with suggested phrases | Constraint: Include pause points for customer response
3. Payment Plan Discussion Framework | Format: Bullet-point options with pros/cons | Constraint: Never suggest specific dollar amounts

OUTPUT RULES:
- Always use [CUSTOMER NAME], [ACCOUNT], and [AMOUNT] placeholders — never insert real data
- Keep letters under 300 words
- Use active, supportive language ("Let's work together..." not "You must...")

GUARD RAILS:
- Do not draft demand letters or communications implying legal action — respond: "Legal communications require review by our legal department."
- Do not suggest specific payment amounts or restructuring terms — respond: "Payment arrangements must be discussed directly with the customer and approved by a supervisor."
- Do not reference credit reporting consequences

COMPLIANCE ANCHORS:
- Every letter includes: "This communication is from a debt collector attempting to collect a debt. Any information obtained will be used for that purpose."
- Every call script begins with the verbal mini-Miranda disclosure`,
            explanation: 'This completed template covers all five sections with specific, actionable content. A loan officer could copy this into an AI system prompt and immediately begin generating compliant collection communications.',
          },
          {
            title: 'Credit Analysis Draft Agent (Complete Template)',
            good: `IDENTITY:
You are a Credit Analysis Assistant for commercial credit analysts. You help draft risk summaries, ratio commentary, and preliminary credit memo sections for loans under $2M. Your audience is internal — senior credit officers and loan committee members.

TASK LIST:
1. Financial Ratio Commentary | Format: Table with Ratio, Value, Rating (Strong/Acceptable/Weak), and Commentary | Constraint: Use industry benchmarks for comparison
2. Risk Factor Summary | Format: Numbered list of top 5 risks with severity rating (H/M/L) and one-sentence mitigation note | Constraint: Maximum 5 risks, prioritized by severity
3. Borrower Interview Questions | Format: 10 numbered questions grouped by topic | Constraint: Focus on areas flagged in the risk summary

OUTPUT RULES:
- Use professional analytical language appropriate for credit committee review
- Always include section headers in bold
- Round all financial figures to nearest thousand

GUARD RAILS:
- Never make credit approval or denial recommendations — respond: "Credit decisions require authorized officer review and approval."
- Never estimate collateral values — respond: "Collateral valuation requires a qualified appraisal."
- Do not provide legal interpretations of loan covenants

COMPLIANCE ANCHORS:
- Every risk summary ends with: "This analysis is for internal review only and does not constitute a credit decision. Final determination requires authorized officer approval."`,
            explanation: 'This analyst-focused template uses internal, technical language with structured output formats designed for credit committee consumption. The guard rails specifically address the boundary between analysis and decision-making.',
          },
          {
            title: 'Executive Briefing Agent (Complete Template)',
            good: `IDENTITY:
You are an Executive Briefing Assistant for bank leadership. You help prepare board presentations, variance commentary, and initiative summaries. Your audience is C-suite executives and board members who need concise, strategic information.

TASK LIST:
1. Board Report Talking Points | Format: Bullet points, 1-2 sentences each, organized by topic | Constraint: No technical jargon — translate metrics into business impact
2. Monthly Variance Commentary | Format: 3-paragraph narrative per budget category | Constraint: Always include prior year comparison
3. Initiative Status Updates | Format: One-page summary with Achievements, Challenges, Next Steps sections | Constraint: Lead with the headline number or outcome

OUTPUT RULES:
- Maximum 2 sentences per bullet point
- Always lead with the most important finding or number
- Use plain business language, not banking jargon

GUARD RAILS:
- Do not include customer-specific details in any board materials
- Do not project future financial results — use language like "if current trends continue" rather than "we expect"
- Do not draft communications that commit the bank to specific strategies or investments

COMPLIANCE ANCHORS:
- Board materials include: "Prepared for internal board review. Not for external distribution."`,
            explanation: 'The executive agent prioritizes brevity, plain language, and strategic framing. Guard rails prevent speculative projections and accidental commitments — common risks in board-level communications.',
          },
        ],
        practiceTask: {
          title: 'Complete Your Agent Template',
          instructions: 'Fill in all five template sections for a banking agent tailored to your role.',
          scenario: 'Using the template structure from the examples above, write a complete custom instructions template for an AI agent that helps you with one of the repetitive tasks you identified in Module 2-1. Fill in all five sections:\n\n1. IDENTITY (2-3 sentences: who the agent is, who it serves, primary purpose)\n2. TASK LIST (2-3 tasks, each with format and constraints)\n3. OUTPUT RULES (2-3 formatting standards)\n4. GUARD RAILS (2-3 explicit refusals with alternative responses)\n5. COMPLIANCE ANCHORS (1-2 standard phrases that must appear in outputs)',
          hints: [
            'Start with your job title and audience',
            'Pick tasks you do at least weekly',
            'What format do reviewers expect?',
            'What could embarrass the bank if wrong?',
            'What disclaimers appear in your current work?',
          ],
          successCriteria: [
            'Identity section includes role, audience, and primary purpose in 2-3 sentences',
            'Task list includes at least 2 tasks, each with a specified output format',
            'Guard rails use direct "Do not..." language and provide alternative responses',
            'Compliance anchors are actual phrases (not descriptions of phrases) that would appear in output',
            'The completed template could be copied directly into an AI system prompt and function correctly',
          ],
        },
      },
    },
    {
      id: '2-4',
      title: 'Tool Integration',
      type: 'document',
      description: 'How to evaluate and request data source connections for your agent',
      estimatedTime: '15 min',
      learningObjectives: [
        'Understand how tool integrations extend agent capabilities',
        'Evaluate integrations on data sensitivity, reversibility, and audit requirements',
        'Write an integration scope document for IT review',
      ],
      content: {
        overview: 'Tool integration is the difference between an agent that drafts from your description versus one that can reference actual data. In banking, the highest-value integrations are document readers (loan files, financial statements), rate lookup tables, policy databases, and workflow system hooks. Each integration requires a security and compliance review before enabling. The goal of this module is not to build integrations yourself — it is to understand what is possible and how to evaluate whether an integration is worth requesting.',
        keyPoints: [
          'Tools extend an agent from a writer to an analyst — document readers, data lookups, and calculation engines multiply AI usefulness',
          'Read-only integrations (loan file readers, rate tables, policy lookups) carry lower risk than write integrations (CRM updates, email sends)',
          'Every tool integration should be evaluated on three axes: data sensitivity, reversibility of actions, and audit trail requirements',
          'Human-in-the-loop checkpoints are required for any agent action that affects customer records or initiates a workflow',
          'To request a new integration, document: what data the agent reads, what it never writes, who reviews output, and the business justification',
        ],
        steps: [
          'Identify the specific data gap: what would the agent need to access to eliminate a manual lookup step?',
          'Classify the data sensitivity: public, internal, confidential, or regulated (PII/NPI)?',
          'Determine the integration type: read-only query, structured API call, or write-back action?',
          'Define the oversight model: who reviews agent output before any action is taken?',
          'Draft the integration request: data source name, access type, business justification, and review checkpoint',
        ],
        examples: [
          {
            title: 'Low-Risk vs High-Risk Integration',
            bad: 'High-risk: Direct CRM write access that lets the agent update customer contact records, change loan status codes, or trigger automated follow-up workflows based on its analysis — all without a human reviewing the changes first.',
            good: 'Low-risk: Read-only access to the bank\'s published rate table so the agent can include current rate ranges in customer communication drafts. The rate data is institutional (not customer-specific), the access is read-only (no writes), and every communication is reviewed by the loan officer before sending.',
            explanation: 'The risk profile is determined by data sensitivity (institutional vs customer), reversibility (read-only vs write), and oversight (human review before action). Start with read-only integrations on institutional data — they deliver value with minimal compliance exposure.',
          },
          {
            title: 'Integration Request Document',
            good: `Integration Request: Loan File Document Reader

Data Source: Loan origination system document store (PDF financial statements and tax returns)
Access Type: Read-only PDF text extraction — no write, update, or delete capabilities
Data Classification: Confidential (contains borrower financial data)

Business Justification: Credit analysts currently spend 25-30 minutes per file manually copying financial figures from PDF statements into analysis prompts. Read-only extraction would allow the agent to reference actual figures directly, reducing preparation time by approximately 60%.

Security Controls:
- Agent receives extracted text only, not raw file access
- All customer PII is stripped during extraction (names, SSNs, addresses removed)
- Agent output is reviewed by the credit analyst before inclusion in any memo
- No data is stored or retained between sessions

Review Checkpoint: Credit analyst reviews all agent-generated analysis before it enters the credit file.`,
            explanation: 'A well-scoped request includes the data source, access type, business justification with time savings, security controls, and the human review checkpoint. Vague requests get denied; specific requests with clear controls get approved.',
          },
        ],
        practiceTask: {
          title: 'Scope a Tool Integration',
          instructions: 'Choose one data source and write a one-paragraph integration scope document.',
          scenario: 'Your agent from the previous modules would be more useful if it could reference actual data rather than requiring you to manually copy information into each prompt. Pick one data source your agent could connect to — financial statement PDFs, rate tables, credit policy documents, or loan status data — and write a scoping document that covers: what data it reads, what it never writes, who reviews the output, and what the business benefit is.',
          hints: [
            'What data do you copy-paste most often?',
            'Is this customer-specific or institutional?',
            'Who must approve before action is taken?',
            'What time savings would this create?',
          ],
          successCriteria: [
            'Names a specific, realistic data source available at a bank (not a hypothetical system)',
            'Specifies read-only access and explicitly documents what is never written or modified',
            'Identifies a human review checkpoint — who reviews agent output before it is used',
            'States the time or quality benefit that justifies the integration request',
          ],
        },
      },
    },
    {
      id: '2-5',
      title: 'Build Your Agent',
      type: 'exercise',
      description: 'Assemble, test, and refine your personalized AI agent',
      estimatedTime: '25 min',
      learningObjectives: [
        'Assemble a complete, deployable agent system prompt',
        'Test agent behavior with standard, edge-case, and out-of-scope scenarios',
        'Identify gaps and refine instructions based on test results',
      ],
      content: {
        overview: 'This capstone exercise brings together everything from modules 2-1 through 2-4. Building a deployable agent means merging your architecture design and completed template into a single, testable system prompt. A good agent system prompt is typically 150-400 words — comprehensive enough to constrain behavior, short enough that the AI processes it efficiently. The real test is not whether the AI gives a perfect answer to one question — it is whether the system prompt produces consistently appropriate behavior across three different scenario types.',
        keyPoints: [
          'A deployable system prompt is 150-400 words — comprehensive enough to constrain behavior, short enough to leave room for the task',
          'Test your agent with three scenario types: a standard task it should handle well, an edge case it should handle carefully, and an out-of-scope request it should decline',
          'If your agent responds consistently and appropriately to all three tests, the system prompt is working; inconsistency means the guard rails need sharpening',
          'Document what worked and what did not — a living system prompt improves over time as you find gaps through real usage',
        ],
        practiceTask: {
          title: 'Build and Test Your Agent',
          instructions: 'Assemble your complete system prompt and test it against three scenarios.',
          scenario: `Part 1 — Assemble: Combine your work from modules 2-2 and 2-3 into a single system prompt. It should include:
- Identity section (who the agent is and who it serves)
- Task list (what it helps with and in what format)
- Output rules (formatting standards)
- Guard rails (at least 2 explicit refusals)
- Compliance anchors (at least 1 standard phrase)

Part 2 — Test: Describe three test messages you would send to your agent:
1. A standard task the agent should handle well
2. An edge case (unusual request still in scope)
3. An out-of-scope request the guard rails should block

Part 3 — Reflect: For each test, note whether you expect the agent to pass or fail, and what you would adjust in the system prompt if it fails.`,
          hints: [
            'Start with your Module 2-3 template',
            'Test a standard, everyday task first',
            'Try an out-of-scope request next',
            'What would you adjust if guard rails fail?',
            'Is it 150-400 words?',
          ],
          successCriteria: [
            'System prompt is 150+ words and covers all five architectural sections (identity, tasks, output rules, guard rails, compliance)',
            'Includes at least one standard task test scenario with expected agent behavior described',
            'Includes at least one out-of-scope test to verify guard rails would activate',
            'Identifies at least one gap or improvement discovered during the testing thought exercise',
            'The completed agent could be shared with a colleague in the same role and function correctly without modification',
          ],
        },
      },
    },
  ],
};

export const SESSION_3_CONTENT: SessionContent = {
  id: 3,
  title: 'Role-Specific Training',
  description: 'AI applications tailored to your department',
  modules: [
    {
      id: '3-1',
      title: 'Department AI Use Cases',
      type: 'example',
      description: 'AI applications mapped to specific banking roles and departments',
      estimatedTime: '15 min',
      learningObjectives: [
        'Identify high-value AI use cases specific to your department',
        'Understand how compliance requirements vary by role and audience',
        'Prioritize use cases by frequency and impact',
      ],
      content: {
        overview: 'Every banking department has unique opportunities for AI assistance, but the same task in different departments carries different compliance requirements, different audiences, and different acceptable output formats. A credit memo excerpt appropriate for an internal credit file would be inappropriate to share with a customer. Knowing your department\'s AI use case landscape helps you focus effort on the highest-value, lowest-risk applications first. Start with informational and drafting tasks — these carry lower risk than decision-making tasks because human review catches errors before they have consequences.',
        keyPoints: [
          'Each department has distinct AI opportunities based on their workflow, audience, and compliance requirements',
          'The same task (e.g., "summarize this document") has different compliance requirements depending on whether the output goes to a customer, a regulator, or an internal committee',
          'Focus on high-frequency, high-value tasks for maximum impact — tasks you do weekly or daily yield the best return',
          'Start with informational and drafting tasks — these carry lower risk because human review catches errors before consequences',
          'Always consider compliance requirements specific to your department before using AI on any task',
          'Start with lower-risk applications and build confidence before tackling decision-support tasks',
        ],
        examples: [
          {
            title: 'Accounting & Finance Use Case',
            good: 'Prompt: "As a financial analyst, I need to prepare variance analysis commentary for our monthly board report. Please analyze these figures: Budget: $2.1M, Actual: $1.85M, Prior Year: $1.92M. Provide professional commentary explaining the variance, possible causes, and recommended follow-up questions for department heads. Format as 2-3 paragraphs suitable for executive review."',
            explanation: 'This prompt is role-specific, provides concrete data, specifies the audience (executives), and requests actionable output. The analyst can review and refine the commentary while ensuring accuracy of the figures.',
          },
          {
            title: 'Credit Administration Use Case',
            good: 'Prompt: "I am reviewing a commercial loan file for annual renewal. Based on the following financial metrics, please provide a risk assessment summary: Current Ratio: 1.8, Debt Service Coverage: 1.25, Debt to Equity: 2.1. Include: (1) rating of each metric as Strong/Acceptable/Weak with reasoning, (2) overall risk trend, (3) three questions to ask the borrower. Follow our standard credit memo format."',
            explanation: 'This prompt gives specific metrics, asks for structured analysis with ratings, and requests follow-up questions — all aligned with typical credit review processes. The output goes to an internal credit file, so analytical language is appropriate.',
          },
          {
            title: 'Executive Leadership Use Case',
            good: 'Prompt: "Help me prepare talking points for a board presentation on our digital transformation initiative. Key updates: mobile app launch exceeded targets by 15%, customer adoption at 42%, cost savings of $350K YTD. Talking points should address: achievements, challenges faced, next quarter priorities, and resource requests. Keep each point to 1-2 sentences for verbal delivery."',
            explanation: 'This executive-focused prompt provides concrete metrics, specifies the communication format (talking points for verbal delivery), and covers the typical board presentation structure. No customer data is involved.',
          },
          {
            title: 'Retail Banking / Branch Operations Use Case',
            good: 'Prompt: "As a branch manager, I need to prepare a two-page reference card for tellers about our new High-Yield Savings product launching next month. Include: product features, eligibility requirements, a comparison to our existing savings accounts, an FAQ section with 5 common customer questions and suggested answers, and required FDIC insurance language. Format as a printable reference card with headers and bullet points. Do not include specific APY figures — note that rates are subject to change and refer customers to our published rate sheet."',
            explanation: 'Branch communications require specific regulatory language (FDIC disclosures) and must avoid quoting rates that could change. The prompt specifies the format (teller reference card), audience (tellers, not customers), and compliance constraint (no specific rates) upfront.',
          },
          {
            title: 'Risk & Compliance Use Case',
            good: 'Prompt: "As a BSA compliance officer, I need to draft an internal training reminder memo about updated transaction monitoring thresholds effective next quarter. This is for internal training purposes only — not customer-facing. Reference that the updated guidance requires enhanced due diligence for wire transfers exceeding $3,000 to certain high-risk jurisdictions (list provided separately). Format as a one-page memo with: summary of changes, numbered action checklist for front-line staff, and a reminder of existing SAR filing obligations. Use clear, non-technical language suitable for tellers and customer service representatives."',
            explanation: 'Compliance use cases are high-value because consistency and accuracy of language directly reduces regulatory risk. This prompt specifies that the output is internal-only, references specific regulatory context, and requests a practical format for non-expert staff.',
          },
        ],
        practiceTask: {
          title: 'Build Your Department Use Case Map',
          instructions: 'Create a prioritized list of 3 AI use cases for your specific department.',
          scenario: 'Using the examples above as a model, write three AI use cases for your role. For each use case include: (1) the task name, (2) who the output goes to (customer, internal team, regulator, committee), (3) the key compliance consideration for that task, and (4) the first line of the prompt you would use. Rank them by frequency — which one would save the most time if you did it with AI every week?',
          hints: [
            'What do you write or draft most often?',
            'Who reviews your output?',
            'What compliance language is always required?',
            'What takes 30+ minutes but follows a pattern?',
          ],
          successCriteria: [
            'Lists 3 specific, named tasks — not generic categories like "writing" or "analysis"',
            'Identifies the audience for each task output (customer, internal, committee, etc.)',
            'Notes at least one compliance consideration per use case',
            'Draft prompt starters are specific enough to use immediately — not vague placeholders',
          ],
          departmentScenarios: {
            accounting_finance: {
              scenario: 'As an accounting/finance professional, build 3 AI use cases specific to your department. Consider variance analysis, reconciliations, board report commentary, financial summaries, and budget preparation. For each use case: name the task, identify the audience (board, CFO, auditors, etc.), note the key compliance consideration (data accuracy, GAAP references, etc.), and write the first line of the prompt.',
              hints: ['What financial reports do you prepare most often?', 'Who reviews your variance commentary?', 'What data accuracy checks are required?', 'Which reports go to the board vs. internal use?'],
            },
            credit_administration: {
              scenario: 'As a credit professional, build 3 AI use cases specific to your department. Consider credit memos, risk assessments, annual loan reviews, borrower document analysis, and portfolio monitoring. For each use case: name the task, identify the audience (credit committee, loan officer, examiner, etc.), note the key compliance consideration (fair lending, PII protection, etc.), and write the first line of the prompt.',
              hints: ['What credit documents do you draft or review most often?', 'Who sees the final output — committee, examiner, or borrower?', 'What PII must be protected in credit analysis?', 'Which tasks follow a repeatable template?'],
            },
            executive_leadership: {
              scenario: 'As an executive/leadership professional, build 3 AI use cases specific to your role. Consider board presentations, strategic summaries, decision support memos, market analysis, and stakeholder communications. For each use case: name the task, identify the audience (board, shareholders, regulators, etc.), note the key compliance consideration (public disclosure rules, material information, etc.), and write the first line of the prompt.',
              hints: ['What strategic documents do you prepare for the board?', 'Which communications go external vs. internal?', 'What sensitivity considerations apply to executive communications?', 'Where would consistent formatting save the most time?'],
            },
          },
        },
      },
    },
    {
      id: '3-2',
      title: 'Compliance & AI',
      type: 'document',
      description: 'The three compliance pillars for AI use in banking',
      estimatedTime: '20 min',
      learningObjectives: [
        'Understand the three compliance pillars: Data Handling, Decision-Making, and Documentation',
        'Apply the 5-step Pre-Task Compliance Check before any AI-assisted task',
        'Identify and avoid the most common compliance pitfalls with AI in banking',
      ],
      content: {
        overview: 'Banking operates under one of the highest regulatory densities of any industry, and AI introduces new surface areas for compliance risk. The three core compliance considerations for AI in banking are Data Handling (what you share with AI), Decision-Making (AI informs, humans decide), and Documentation (how AI use is recorded). This module does not replace your bank\'s official AI policy — it provides the foundational mental model for evaluating any AI task against compliance requirements. When in doubt, the rule is simple: if you would not put this data in an email to an external party, do not put it in an AI prompt.',
        keyPoints: [
          'The three compliance pillars for AI in banking: Data Handling (what you share), Decision-Making (who decides), and Documentation (what you record)',
          'Personally Identifiable Information (PII) and Non-Public Personal Information (NPI) must never be entered into a non-approved AI system — this includes names, SSNs, account numbers, addresses, and financial details linked to identifiable individuals',
          'AI is an information assistant, not a decision-maker — all credit decisions, compliance determinations, and customer commitments require human sign-off',
          'Document AI-assisted work: note when AI was used, what the prompt covered (at a summary level), and who reviewed the output before it was used',
          'Fair lending considerations apply to AI-assisted analysis — if your AI output could reflect bias based on geographic, demographic, or industry proxies, flag it for human review',
          'The "newspaper test" for AI use: would the way you used AI and the data you shared be defensible if described in a regulatory examination?',
        ],
        steps: [
          'Data check: Does this task require sharing any customer PII or NPI? If yes, anonymize completely or stop',
          'Decision check: Is the output a final decision, or is it informing a human decision? If final, do not use AI alone',
          'Policy check: Does your bank\'s AI policy cover this use case? If unsure, check with compliance before proceeding',
          'Output check: Will this output go to a customer, a regulator, or stay internal? Each destination has different review standards',
          'Documentation check: How will you record that AI was used in this task? Note it in your work product or file',
        ],
        examples: [
          {
            title: 'Non-Compliant vs Compliant Prompt',
            bad: 'Prompt: "Review John Smith\'s loan application at 123 Main St. His SSN is 456-78-9012, account #7891234, balance $340,000. He\'s 60 days past due. Recommend whether we should approve his modification request or proceed with foreclosure."',
            good: 'Prompt: "Review a commercial borrower\'s modification request for a loan with a current balance of approximately [AMOUNT]. The borrower is 60 days past due. Based on the following anonymized financial metrics — Current Ratio: [X], DSCR: [Y], Debt-to-Equity: [Z] — summarize the key risk factors and list 3 questions the loan officer should discuss with the borrower before a decision is made. Note: This summary is for internal review only and does not constitute a credit decision."',
            explanation: 'Two changes transform a non-compliant request into a compliant one: (1) all PII is removed or replaced with placeholders, and (2) the word "recommend" is replaced with "summarize risk factors" — shifting from AI decision to AI analysis with human review.',
          },
          {
            title: 'What Counts as a Decision vs AI-Assisted Analysis',
            good: `AI-Assisted Analysis (Appropriate for AI):
- Drafting risk factor summaries for credit committee review
- Generating questions for a borrower interview based on financial metrics
- Formatting a financial ratio table with trend commentary
- Preparing variance analysis commentary for a board report
- Summarizing loan file documents into structured memo sections

Final Decisions (Require Human Authority — AI Cannot Make These):
- Credit approval or denial determinations
- Regulatory compliance pass/fail assessments
- Customer interest rate commitments or fee waivers
- Collection escalation decisions (demand letters, legal referrals)
- Suspicious Activity Report (SAR) filing determinations

The Line: If the output directly commits the bank to an action, creates a customer obligation, or satisfies a regulatory requirement, it is a decision that requires human authority.`,
            explanation: 'The dividing line is whether the output requires additional human judgment before it becomes consequential. AI handles analysis, drafting, and formatting; humans handle decisions, commitments, and regulatory determinations.',
          },
        ],
        practiceTask: {
          title: 'Build Your Compliance Checklist',
          instructions: 'Write a personal pre-task compliance checklist for AI use in your role.',
          scenario: 'Using the 5-step Pre-Task Compliance Check as a starting point, customize it for your department. Add department-specific items: What data types appear in your work that need special handling? What decisions in your role must always have human sign-off? What documentation does your team already use that should record AI assistance? Your final checklist should be something you can print and keep at your desk — a quick reference before any AI-assisted task.',
          hints: [
            'What sensitive data do you handle daily?',
            'Which decisions cannot be delegated?',
            'How does your team document work products?',
            'What would a compliance audit look for?',
            'Would this pass the "newspaper test"?',
          ],
          successCriteria: [
            'Checklist has at least 5 specific items — not generic categories like "be careful with data"',
            'Includes at least one department-specific data type that requires protection (e.g., loan account numbers, customer financials)',
            'Explicitly identifies which task outputs require human review before use',
            'Addresses documentation — how AI assistance is recorded in work products',
            'Written in actionable language ("Check that...", "Verify that...", "Confirm that...") not abstract principles',
          ],
          departmentScenarios: {
            accounting_finance: {
              scenario: 'As an accounting/finance professional, customize the 5-step Pre-Task Compliance Check for your department. Think about: financial data sensitivity (account balances, transaction details, customer financial statements), GAAP/regulatory reporting requirements, audit trail documentation, and who reviews your AI-assisted work products (CFO, auditors, board). Your checklist should be practical enough to use before every AI-assisted financial task.',
              hints: ['What financial data types require special protection?', 'How do GAAP references need to be verified?', 'What does your audit documentation require?', 'Who signs off on AI-assisted financial reports?'],
            },
            credit_administration: {
              scenario: 'As a credit professional, customize the 5-step Pre-Task Compliance Check for your department. Think about: borrower PII/NPI protection, fair lending considerations (ECOA, CRA), credit decision documentation requirements, and regulatory examination readiness. Your checklist should cover loan review documents, credit memos, and risk assessments.',
              hints: ['What borrower data must never enter an AI prompt?', 'How do fair lending rules apply to AI-assisted analysis?', 'What credit decisions require human sign-off?', 'What would an examiner look for in your AI documentation?'],
            },
            executive_leadership: {
              scenario: 'As an executive leader, customize the 5-step Pre-Task Compliance Check for your role. Think about: material non-public information handling, board communication sensitivity, strategic data protection, and public disclosure rules. Your checklist should cover board presentations, strategic memos, and stakeholder communications.',
              hints: ['What information is material and non-public?', 'How should board-level data be handled with AI?', 'What public disclosure rules apply to your communications?', 'Who reviews AI-assisted executive communications?'],
            },
          },
        },
      },
    },
    {
      id: '3-3',
      title: 'Workflow Examples',
      type: 'example',
      description: 'Complete multi-step AI workflows for banking scenarios',
      estimatedTime: '15 min',
      learningObjectives: [
        'Understand how multi-step AI workflows differ from single prompts',
        'See complete workflow examples with built-in review checkpoints',
        'Adapt workflow patterns to your own department tasks',
      ],
      content: {
        overview: 'A workflow is different from a single prompt. It is a sequence of AI-assisted steps that together produce a complete output — each step builds on the previous, and human review is built into the sequence at defined checkpoints. Multi-step workflows produce better results than single mega-prompts because breaking the task into steps reduces AI error and makes each output independently verifiable. The examples in this module show complete workflows for three common banking scenarios.',
        keyPoints: [
          'A workflow specifies the trigger (what starts it), the sequence of AI steps, the review checkpoints, and the final output format',
          'Multi-step workflows produce better results than single mega-prompts — breaking the task into steps reduces AI error and makes each output verifiable',
          'Review checkpoints are not optional — they are the compliance mechanism that makes AI-assisted workflows defensible in an audit',
          'Document your workflow once it works — a reusable workflow is institutional knowledge, not just personal efficiency',
        ],
        examples: [
          {
            title: 'Annual Loan Review Workflow (Credit Analyst)',
            good: `Step 1 — Ratio Analysis: Enter anonymized financial ratios into a structured prompt asking for ratio-by-ratio commentary with Strong/Acceptable/Weak ratings and industry comparisons.
Human Review: Verify ratio calculations and ratings against actual financial statements.

Step 2 — Trend Analysis: Send a second prompt with current year and prior year ratios, asking for year-over-year trend commentary highlighting any metric that changed by more than 10%.
Human Review: Confirm trends match the actual data and flag any AI misinterpretations.

Step 3 — Risk Factors: Send a third prompt requesting the top 5 risk factors based on the ratio analysis and trends, each rated H/M/L with a one-sentence mitigation note.
Human Review: Validate risk factors against institutional knowledge of the borrower.

Step 4 — Interview Questions: Send a fourth prompt generating 8-10 questions to ask the borrower at the annual review meeting, grouped by topic area.
Human Review: Select and prioritize questions for the actual meeting.

Step 5 — Assembly: Combine reviewed outputs into the annual review memo. Human writes the recommendation section.
Final Output: Complete annual review memo ready for credit committee.`,
            explanation: 'This workflow separates three distinct analytical tasks (ratios, trends, risks), each reviewable independently. The human adds institutional knowledge at each checkpoint and writes the final recommendation — the AI never makes the credit judgment.',
          },
          {
            title: 'Monthly Board Report Variance Commentary (Finance)',
            good: `Step 1 — Draft Commentary: Enter budget vs actual vs prior year figures into a prompt requesting variance commentary for each major budget category. Specify executive audience and 2-3 sentence format per category.
Human Review: Check all figures for accuracy and verify cause explanations are reasonable.

Step 2 — Follow-Up Questions: Send a second prompt with the accepted commentary, asking for 2 follow-up questions per category that the board might ask, with suggested talking point responses.
Human Review: Adjust questions and responses based on actual operational knowledge.

Step 3 — Executive Formatting: Send a third prompt with all approved content, requesting reformatting into board presentation style — bullet points under 2 sentences each, leading with the headline number.
Human Review: Final tone and accuracy check before submission.

Final Output: Board-ready variance commentary with prepared Q&A responses.`,
            explanation: 'Splitting drafting from formatting catches errors at two separate checkpoints. The AI handles structure, language, and formatting while the human ensures factual accuracy and appropriate executive framing.',
          },
          {
            title: 'Customer Complaint Response Workflow (Retail/Branch)',
            good: `Step 1 — Anonymize: Remove all customer PII from the complaint record. Replace with [CUSTOMER], [ACCOUNT], [DATE], [AMOUNT] placeholders.
Human Action: Verify all PII is removed before proceeding.

Step 2 — Categorize & Framework: Send the anonymized complaint to a prompt requesting: complaint category, root cause hypothesis, and a response framework (key points to address, in what order).
Human Review: Verify the categorization and approve the framework structure.

Step 3 — Add Resolution Details: Human adds the factual resolution details that only they know — what was investigated, what was found, what action was taken.
Human Action: Write the resolution facts (AI cannot know what actually happened).

Step 4 — Draft Response: Send the approved framework plus resolution facts to a prompt requesting a full response letter. Specify: professional and empathetic tone, acknowledge the concern, explain the resolution, provide next steps.
Human Review: Review the complete draft for accuracy, tone, and required compliance language.

Step 5 — Compliance Sign-Off: Route to compliance review if required by complaint category.
Final Output: Reviewed, compliant response letter ready to send.`,
            explanation: 'The AI handles structure and tone while the human handles facts and compliance. Critically, the human adds the resolution details in Step 3 — the AI cannot know what investigation occurred or what was found, so the workflow explicitly separates AI drafting from human fact-provision.',
          },
        ],
        practiceTask: {
          title: 'Document Your AI Workflow',
          instructions: 'Write a complete workflow for one AI-assisted task you do regularly.',
          scenario: 'Choose a task you identified in Module 3-1 or a common task from your role. Document it as a named workflow with: a Trigger (what starts the process), a Step-by-step sequence (3-5 steps, each specifying what the AI does and what the human does), at least 2 review checkpoints where a human verifies AI output before proceeding, and a Final Output description. Write it so a colleague in your role could follow it independently without your help.',
          hints: [
            'What event triggers this task?',
            'Where does AI draft, where do you review?',
            'When must a human check the output?',
            'What does the final deliverable look like?',
            'Could a colleague follow these steps alone?',
          ],
          successCriteria: [
            'Workflow has a named trigger event and a clearly defined final output',
            'Contains 3-5 distinct steps that are specific enough to follow',
            'At least 2 steps include explicit human review of AI output before proceeding to the next step',
            'Steps alternate between AI drafting and human verification — not all AI steps in sequence without review',
            'Written clearly enough for a colleague to follow without additional explanation',
          ],
          departmentScenarios: {
            accounting_finance: {
              scenario: 'As an accounting/finance professional, document a complete AI workflow for a financial task you do regularly. Good candidates: monthly variance commentary for the board report, quarterly account reconciliation review, or financial statement analysis. Include the trigger (e.g., "month-end close completed"), 3-5 AI steps with human review at each checkpoint, and the final deliverable format.',
              hints: ['What triggers your monthly/quarterly financial tasks?', 'Where does AI draft and where do you verify figures?', 'What accuracy checks are required before submission?', 'What does the final board-ready deliverable look like?'],
            },
            credit_administration: {
              scenario: 'As a credit professional, document a complete AI workflow for a credit task you do regularly. Good candidates: annual loan review preparation, new loan application analysis, or credit memo drafting from unstructured borrower documents. Include the trigger (e.g., "annual review date approaching"), 3-5 AI steps with human review at each checkpoint, and the final deliverable format.',
              hints: ['What triggers your loan review or credit analysis process?', 'Where does AI analyze and where does a human verify risk factors?', 'What compliance checks happen before committee presentation?', 'What format does the credit committee expect?'],
            },
            executive_leadership: {
              scenario: 'As an executive leader, document a complete AI workflow for a strategic task you do regularly. Good candidates: board meeting preparation, strategic initiative summary, or competitive analysis brief. Include the trigger (e.g., "quarterly board meeting T-2 weeks"), 3-5 AI steps with human review at each checkpoint, and the final deliverable format.',
              hints: ['What triggers your board or strategic preparation?', 'Where does AI draft and where do you add strategic judgment?', 'What sensitivity review happens before distribution?', 'What format does the board or C-suite expect?'],
            },
          },
        },
      },
    },
    {
      id: '3-4',
      title: 'Advanced Techniques',
      type: 'document',
      description: 'Chain-of-thought, multi-shot, and self-review prompting techniques',
      estimatedTime: '15 min',
      learningObjectives: [
        'Apply chain-of-thought prompting for auditable reasoning',
        'Use multi-shot prompting for consistent output formatting',
        'Implement self-review prompting as a pre-check before human review',
      ],
      content: {
        overview: 'Advanced techniques are not harder to use — they are more deliberate. Each technique solves a specific failure mode that simple prompting hits: vague reasoning (chain-of-thought), inconsistent formatting (multi-shot), and undetected errors (self-review). These techniques are particularly valuable in banking because the stakes of inconsistent or poorly-reasoned output are high — a risk summary with invisible reasoning or an inconsistently formatted board report erodes trust in AI-assisted work.',
        keyPoints: [
          'Chain-of-thought prompting asks the AI to show its reasoning step-by-step before reaching a conclusion — useful when how it got there matters as much as what it concluded',
          'Multi-shot prompting provides 2-3 examples of the output format you want before asking for the real output — dramatically improves consistency for templated documents',
          'Self-review prompting asks the AI to critique its own output against a checklist before you review it — surfaces issues before they reach human review',
          'Decomposition breaks a complex task into a series of simpler prompts — each producing verifiable intermediate output that feeds the next step',
          'When to choose: chain-of-thought for analysis tasks, multi-shot for formatted documents, self-review for high-stakes outputs, decomposition for multi-part deliverables',
        ],
        steps: [
          'Use chain-of-thought when the reasoning process matters — credit risk assessments, regulatory analysis, or any task where "why" matters as much as "what"',
          'Use multi-shot when output format must match an existing template — credit memos, board reports, standard letters',
          'Use self-review when stakes are high and you want a pre-check before human review — compliance communications, customer-facing documents',
          'Use decomposition when a task has more than 3 distinct output components — annual reviews, comprehensive reports',
          'Combine techniques when appropriate — chain-of-thought analysis followed by self-review is a powerful combination for credit work',
        ],
        examples: [
          {
            title: 'Chain-of-Thought in Credit Analysis',
            bad: 'Prompt: "Assess the creditworthiness of this borrower based on these ratios: Current Ratio 1.4, DSCR 1.15, Debt-to-Equity 2.8."',
            good: 'Prompt: "Assess this commercial borrower\'s credit profile based on these ratios: Current Ratio 1.4, DSCR 1.15, Debt-to-Equity 2.8. Work through your analysis step by step: First, evaluate each ratio individually — note whether it is Strong, Acceptable, or Weak and explain why using industry benchmarks. Then, identify the two most significant risk factors based on the ratio combination. Finally, state your overall risk assessment (Low/Moderate/High) and the primary justification. Show each step of your reasoning."',
            explanation: 'The chain-of-thought instruction produces auditable reasoning, not just a conclusion. A credit officer reviewing the output can verify each step of the logic, catch errors in the reasoning process, and understand exactly how the AI reached its assessment.',
          },
          {
            title: 'Multi-Shot for Consistent Output Format',
            good: `Prompt: "I need variance commentary in a specific format. Here are two examples of the format I want:

Example 1: 'Net Interest Income: Favorable variance of $142K (7.2%) vs budget. Primary driver: higher-than-projected loan growth in Q3 commercial portfolio. Prior year comparison: up $89K (4.1%), reflecting continued portfolio expansion. Follow-up: confirm pipeline sustainability with CLO.'

Example 2: 'Operating Expenses: Unfavorable variance of $67K (3.1%) vs budget. Primary driver: unbudgeted technology migration costs in September. Prior year comparison: up $112K (5.4%), largely attributable to staffing additions. Follow-up: request updated technology project timeline from CTO.'

Now produce commentary in the same format for: Provision for Loan Losses — Budget: $180K, Actual: $245K, Prior Year: $198K."`,
            explanation: 'Two examples are enough to lock in consistent formatting — the sentence structure, the parenthetical percentages, the prior year comparison, and the follow-up question format all carry over to the new output. This eliminates the "every response looks different" problem.',
          },
          {
            title: 'Self-Review Prompting',
            good: `After receiving a draft from the AI, send this follow-up prompt:

"Review the risk summary you just produced against this checklist:
1. Does each ratio have a clear Strong/Acceptable/Weak rating with reasoning?
2. Are risk factors ranked by severity (H/M/L)?
3. Does the summary include a mitigation note for each risk?
4. Is there an internal-use-only disclaimer at the end?
5. Are all figures properly anonymized with no customer PII present?

For each item, note whether it is Fully Met, Partially Met, or Missing. Then provide a revised version that addresses any gaps."`,
            explanation: 'Self-review catches the most common errors — missing disclaimers, inconsistent formatting, forgotten anonymization — before the human review step. It is like asking a colleague to proofread before submitting: the output quality improves significantly with minimal additional effort.',
          },
        ],
        practiceTask: {
          title: 'Apply an Advanced Technique',
          instructions: 'Select one advanced technique and apply it to a banking analysis scenario.',
          scenario: 'Choose one of the three techniques — chain-of-thought, multi-shot, or self-review — and apply it to this scenario: You need to draft a risk assessment for a restaurant chain seeking a $400,000 working capital line of credit. The assessment will go to a senior credit officer for review. Using your chosen technique, write a prompt that is noticeably more structured and reliable than a basic prompt would be. Label which technique you are using and explain in one sentence why you chose it for this scenario.',
          hints: [
            'Which technique matches this task best?',
            'Does showing reasoning help here?',
            'Would format consistency matter?',
            'Would a self-check save review time?',
            'Label your technique choice clearly',
          ],
          successCriteria: [
            'Identifies and clearly labels one specific advanced technique (chain-of-thought, multi-shot, or self-review)',
            'Applies the technique correctly — the technique is structurally embedded in the prompt, not just mentioned by name',
            'The prompt is visibly more sophisticated than a basic one-sentence request — includes structure, constraints, or format specifications',
            'The technique choice is justified in one sentence explaining why it fits this specific scenario',
            'The output of the prompt would be usable by a senior credit officer without major revision',
          ],
          departmentScenarios: {
            accounting_finance: {
              scenario: 'Apply an advanced technique to this finance scenario: You need to draft variance commentary for a budget line item where actual expenses exceeded budget by 12%. The commentary will go to the CFO and board audit committee. Choose chain-of-thought (to show reasoning), multi-shot (to match existing commentary format), or self-review (to catch errors before the CFO sees it). Label your technique choice and explain why.',
              hints: ['Which technique helps ensure accurate financial reasoning?', 'Would matching prior commentary format matter here?', 'Would a self-check catch calculation or framing errors?', 'What would the CFO expect from variance commentary?'],
            },
            credit_administration: {
              scenario: 'Apply an advanced technique to this credit scenario: You need to draft a risk assessment for a manufacturing company seeking a $750,000 equipment loan. The assessment will go to the senior credit officer and then to the credit committee. Choose chain-of-thought (to show auditable reasoning), multi-shot (to match credit memo format), or self-review (to catch risk factor gaps). Label your technique choice and explain why.',
              hints: ['Which technique produces auditable reasoning for examiners?', 'Does format consistency matter for credit committee review?', 'Would a self-check catch missing risk factors?', 'What level of detail does the credit committee expect?'],
            },
            executive_leadership: {
              scenario: 'Apply an advanced technique to this executive scenario: You need to prepare a strategic briefing for the board on a proposed fintech partnership. The briefing must cover opportunity, risks, competitive landscape, and resource requirements. Choose chain-of-thought (to show reasoning behind recommendations), multi-shot (to match board briefing format), or self-review (to ensure balanced risk/opportunity framing). Label your technique choice and explain why.',
              hints: ['Which technique shows clear reasoning for strategic decisions?', 'Does matching prior board briefing format matter?', 'Would a self-check ensure balanced risk/opportunity presentation?', 'What framing does your board expect for strategic proposals?'],
            },
          },
        },
      },
    },
    {
      id: '3-5',
      title: 'Capstone Project',
      type: 'exercise',
      description: 'Complete a real banking task using everything you\'ve learned',
      estimatedTime: '30 min',
      learningObjectives: [
        'Apply skills from all three sessions to a real work task',
        'Demonstrate compliance awareness and proper data handling',
        'Reflect honestly on what AI does well and where it falls short',
      ],
      content: {
        overview: 'This final capstone is intentionally open-ended. Unlike the structured modules before it, you choose the task, the technique, the workflow, and the agent configuration. The evaluation criteria focus on three things: relevance to real work, appropriate compliance handling, and demonstrable quality improvement over doing the task manually. The goal is to produce something you would actually use — and to walk away knowing exactly how AI fits into your professional workflow.',
        keyPoints: [
          'Choose a real task — not a hypothetical. The best capstones are things you actually need done this week.',
          'Apply at minimum: the CLEAR framework (Session 1), an agent configuration or template (Session 2), and a compliance check (Session 3)',
          'Document your process as you go — what prompts you used, what you revised, what the AI got wrong, and how you corrected it',
          'The reflection is as important as the output — what did AI do well, where did it fall short, and would you use this approach again?',
        ],
        practiceTask: {
          title: 'Complete a Real Banking Task with AI',
          instructions: 'Use AI to complete an actual work task, document your process, and reflect on the result.',
          scenario: `Choose ONE of these options, or propose your own:

Option A — Credit / Lending: Draft a complete risk summary for a loan application using chain-of-thought prompting and your agent template. Use anonymized data with placeholders for all customer information.

Option B — Finance / Accounting: Produce variance commentary for a realistic set of budget-vs-actual figures using multi-shot formatting. Include prior year comparisons and follow-up questions for department heads.

Option C — Retail / Branch / Operations: Draft a complete customer communication (letter, email, or internal memo) using your workflow from Module 3-3. Include all required compliance language and disclosures.

Option D — Compliance / Risk: Draft an internal training memo on a regulatory update using self-review prompting. Produce both a technical version and a plain-language summary for front-line staff.

For whichever option you choose, include in your submission:
1. The option you selected (A, B, C, or D) and the specific task
2. The prompts you used (show at least 3 separate prompts demonstrating iteration)
3. The final output produced by AI
4. A 3-sentence reflection: what worked well, what the AI got wrong or missed, and what you would do differently next time`,
          hints: [
            'Pick a task you actually need done',
            'Use your agent template from Session 2',
            'Run the compliance checklist from 3-2',
            'Show your prompt iterations, not just the final version',
            'Be honest in your reflection',
          ],
          successCriteria: [
            'Completes a specific, identifiable banking task — not a generic exercise or hypothetical scenario',
            'Uses AI across multiple prompts (3+) — shows iteration and refinement, not a single attempt',
            'All customer data is anonymized — no real PII is present anywhere in the submission',
            'Applies at least one advanced technique from Module 3-4 (chain-of-thought, multi-shot, or self-review)',
            'Demonstrates compliance awareness through checklist use, guard rail activation, or explicit compliance notes',
            'Reflection identifies both a genuine strength and a genuine limitation of the AI-assisted approach',
          ],
        },
      },
    },
  ],
};

export const ALL_SESSION_CONTENT: Record<number, SessionContent> = {
  1: SESSION_1_CONTENT,
  2: SESSION_2_CONTENT,
  3: SESSION_3_CONTENT,
};
