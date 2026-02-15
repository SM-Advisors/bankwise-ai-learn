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
        'Define what an AI agent is',
        'Understand how agents differ from simple prompting',
        'Identify use cases for agents in banking',
      ],
      content: {
        overview: 'An AI agent is a configured AI assistant with persistent instructions, specialized knowledge, and defined capabilities. Unlike one-off prompts, an agent remembers context and follows consistent guidelines across conversations.',
        keyPoints: [
          'Agents have persistent system instructions that define their behavior',
          'They can be specialized for specific roles or tasks within banking',
          'Agents provide consistency across all interactions',
          'They can be configured with specific knowledge, tone, and constraints',
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
            bad: 'Each time: "I\'m a loan officer. Help me draft a collection follow-up email..."',
            good: 'Agent instruction: "You are a Collections Assistant for loan officers. You help draft professional, compliant follow-up communications. Always maintain a supportive tone, never threaten, and include standard regulatory disclosures."',
            explanation: 'The agent approach embeds your role, compliance requirements, and tone preferences once, so every interaction automatically follows these guidelines.',
          },
        ],
        practiceTask: {
          title: 'Identify Agent Opportunities',
          instructions: 'List 3 repetitive tasks in your role that could benefit from a specialized AI agent.',
          scenario: 'Think about tasks you do regularly that involve writing, analysis, or information synthesis.',
          hints: [
            'What tasks do you repeat weekly?',
            'Where do you wish you had a knowledgeable assistant?',
            'What takes too long but follows patterns?',
          ],
          successCriteria: [
            'Identifies specific, repetitive tasks',
            'Tasks are suitable for AI assistance',
            'Considers practical implementation',
          ],
        },
      },
    },
    {
      id: '2-2',
      title: 'Agent Architecture',
      type: 'document',
      description: 'Components and design principles for effective agents',
      estimatedTime: '15 min',
      learningObjectives: [
        'Understand agent component structure',
        'Learn how to define agent personality and constraints',
        'Design agents for banking compliance',
      ],
      content: {
        overview: 'Effective agents are built with clear architecture: system instructions, knowledge base, personality guidelines, and safety constraints.',
        keyPoints: [
          'System instructions define the agent\'s core behavior',
          'Knowledge base provides domain expertise',
          'Personality guidelines ensure consistent tone',
          'Safety constraints prevent inappropriate outputs',
        ],
        practiceTask: {
          title: 'Design Agent Architecture',
          instructions: 'Outline the architecture for a credit analysis assistant agent.',
          scenario: 'Design an agent that helps credit analysts draft initial loan assessments.',
          hints: [
            'What core behaviors should it have?',
            'What knowledge does it need?',
            'What tone should it use?',
            'What should it never do?',
          ],
          successCriteria: [
            'Defines clear system instructions',
            'Identifies necessary knowledge areas',
            'Specifies appropriate tone',
            'Includes safety constraints',
          ],
        },
      },
    },
    {
      id: '2-3',
      title: 'Custom Instructions Template',
      type: 'example',
      description: 'Template for configuring your personal banking agent',
      estimatedTime: '10 min',
      learningObjectives: [
        'Use templates to create effective agent instructions',
        'Customize templates for your specific role',
        'Balance flexibility with consistency',
      ],
      content: {
        overview: 'A well-structured template helps you create effective agent instructions quickly while ensuring you don\'t miss critical components.',
        keyPoints: [
          'Templates provide structure and consistency',
          'Customization makes agents role-specific',
          'Good templates include compliance by default',
          'Iterate and refine based on usage',
        ],
        practiceTask: {
          title: 'Complete Agent Template',
          instructions: 'Fill out the agent template for your role.',
          scenario: 'Using the template structure, create custom instructions for an agent that assists with your daily work.',
          hints: [
            'Start with your role and responsibilities',
            'Add your common tasks',
            'Include compliance requirements',
            'Define what the agent should avoid',
          ],
          successCriteria: [
            'Template is completely filled out',
            'Instructions are role-specific',
            'Compliance is addressed',
            'Clear boundaries are set',
          ],
        },
      },
    },
    {
      id: '2-4',
      title: 'Tool Integration',
      type: 'document',
      description: 'Connect your agent to external tools and data sources',
      estimatedTime: '15 min',
      learningObjectives: [
        'Understand how agents can use tools',
        'Identify safe integration points',
        'Plan tool usage within compliance',
      ],
      content: {
        overview: 'Agents become more powerful when connected to tools like document readers, data lookups, and workflow systems. Learn how to plan these integrations safely.',
        keyPoints: [
          'Tools extend agent capabilities',
          'Integration requires security consideration',
          'Start with read-only tools',
          'Always maintain human oversight',
        ],
        practiceTask: {
          title: 'Plan Tool Integration',
          instructions: 'Identify 2-3 tools that would enhance your agent.',
          scenario: 'Consider what data sources or capabilities would make your agent more useful.',
          hints: [
            'What information do you frequently look up?',
            'What systems do you use daily?',
            'What are the security implications?',
          ],
          successCriteria: [
            'Identifies practical tools',
            'Considers security implications',
            'Plans for human oversight',
          ],
        },
      },
    },
    {
      id: '2-5',
      title: 'Build Your Agent',
      type: 'exercise',
      description: 'Create and test your personalized AI agent',
      estimatedTime: '25 min',
      learningObjectives: [
        'Create a complete agent configuration',
        'Test agent with realistic scenarios',
        'Refine based on results',
      ],
      content: {
        overview: 'Bring everything together to create a fully configured agent for your role. Test it with realistic scenarios and refine the instructions.',
        keyPoints: [
          'Start with your completed template',
          'Test with real-world scenarios',
          'Iterate based on output quality',
          'Document what works well',
        ],
        practiceTask: {
          title: 'Create Your Agent',
          instructions: 'Build a complete agent using everything you\'ve learned.',
          scenario: 'Create system instructions for an agent that will assist you in your specific banking role.',
          hints: [
            'Use all your previous work',
            'Test with 3 different scenarios',
            'Note what needs adjustment',
            'Think about daily usage',
          ],
          successCriteria: [
            'Complete agent configuration',
            'Tested with multiple scenarios',
            'Produces useful outputs',
            'Complies with banking standards',
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
      description: 'Common AI applications in your specific role',
      estimatedTime: '15 min',
      learningObjectives: [
        'Identify AI use cases for your department',
        'Understand practical applications',
        'Prioritize high-value opportunities',
      ],
      content: {
        overview: 'Every banking department has unique opportunities for AI assistance. This module explores specific use cases tailored to your line of business, showing how AI can streamline common tasks while maintaining compliance.',
        keyPoints: [
          'Each department has distinct AI opportunities based on their workflow',
          'Focus on high-frequency, high-value tasks for maximum impact',
          'Always consider compliance requirements specific to your department',
          'Start with lower-risk applications and build confidence',
        ],
        examples: [
          {
            title: 'Accounting & Finance Use Case',
            good: 'Prompt: "As a financial analyst, I need to prepare variance analysis commentary for our monthly board report. Please analyze these figures: Budget: $2.1M, Actual: $1.85M, Prior Year: $1.92M. Provide professional commentary explaining the variance, possible causes, and recommended follow-up questions for department heads. Format as 2-3 paragraphs suitable for executive review."',
            explanation: 'This prompt is role-specific, provides concrete data, specifies the audience, and requests actionable output. The analyst can review and refine the commentary while ensuring accuracy.',
          },
          {
            title: 'Credit Administration Use Case',
            good: 'Prompt: "I am reviewing a commercial loan file for annual renewal. Based on the following financial metrics, please provide a risk assessment summary: Current Ratio: 1.8, Debt Service Coverage: 1.25, Debt to Equity: 2.1. Include: (1) rating of each metric as Strong/Acceptable/Weak with reasoning, (2) overall risk trend, (3) three questions to ask the borrower. Follow our standard credit memo format."',
            explanation: 'This prompt gives specific metrics, asks for structured analysis with ratings, and requests follow-up questions - all aligned with typical credit review processes.',
          },
          {
            title: 'Executive Leadership Use Case',
            good: 'Prompt: "Help me prepare talking points for a board presentation on our digital transformation initiative. Key updates: mobile app launch exceeded targets by 15%, customer adoption at 42%, cost savings of $350K YTD. Talking points should address: achievements, challenges faced, next quarter priorities, and resource requests. Keep each point to 1-2 sentences for verbal delivery."',
            explanation: 'This executive-focused prompt provides concrete metrics, specifies the communication format (talking points for verbal delivery), and covers the typical board presentation structure.',
          },
        ],
        practiceTask: {
          title: 'Map Your Use Cases',
          instructions: 'Create a priority list of AI use cases for your role.',
          scenario: 'Based on your department and daily responsibilities, identify where AI can help most.',
          hints: [
            'What takes most of your time?',
            'Where do errors commonly occur?',
            'What could be faster?',
          ],
          successCriteria: [
            'Lists specific use cases',
            'Prioritizes by value',
            'Considers feasibility',
          ],
        },
      },
    },
    {
      id: '3-2',
      title: 'Compliance & AI',
      type: 'document',
      description: 'Ensuring compliant AI usage in banking operations',
      estimatedTime: '20 min',
      learningObjectives: [
        'Understand AI compliance requirements',
        'Apply data handling best practices',
        'Avoid common compliance pitfalls',
      ],
      content: {
        overview: 'Using AI in banking requires careful attention to compliance, data security, and regulatory requirements. Learn to apply AI safely.',
        keyPoints: [
          'Never share customer PII with AI',
          'Document AI-assisted decisions',
          'Maintain human oversight',
          'Follow bank AI policies',
        ],
        practiceTask: {
          title: 'Compliance Checklist',
          instructions: 'Create a personal checklist for compliant AI usage.',
          scenario: 'Develop a checklist you can use before any AI-assisted task.',
          hints: [
            'What data should never be shared?',
            'What oversight is required?',
            'What should be documented?',
          ],
          successCriteria: [
            'Covers data security',
            'Includes oversight requirements',
            'Addresses documentation needs',
          ],
        },
      },
    },
    {
      id: '3-3',
      title: 'Workflow Examples',
      type: 'example',
      description: 'Real-world AI workflow examples for your department',
      estimatedTime: '15 min',
      learningObjectives: [
        'See complete workflow examples',
        'Understand step-by-step implementation',
        'Adapt examples to your work',
      ],
      content: {
        overview: 'Learn from complete workflow examples that show AI integration from start to finish in realistic banking scenarios.',
        keyPoints: [
          'Complete workflows show the full picture',
          'Adapt examples to your situation',
          'Build on proven patterns',
          'Document your own workflows',
        ],
        practiceTask: {
          title: 'Document Your Workflow',
          instructions: 'Create a step-by-step workflow for one AI-assisted task.',
          scenario: 'Choose a common task and document how you would use AI to complete it.',
          hints: [
            'Start with the trigger/input',
            'Document each step',
            'Note review points',
            'Define the output',
          ],
          successCriteria: [
            'Clear step-by-step process',
            'Includes review checkpoints',
            'Produces defined output',
            'Reusable by others',
          ],
        },
      },
    },
    {
      id: '3-4',
      title: 'Advanced Techniques',
      type: 'document',
      description: 'Power user tips and advanced AI techniques',
      estimatedTime: '15 min',
      learningObjectives: [
        'Learn advanced prompting techniques',
        'Master iteration and refinement',
        'Handle complex scenarios',
      ],
      content: {
        overview: 'Take your AI skills to the next level with advanced techniques including chain-of-thought prompting, iterative refinement, and handling complex multi-step tasks.',
        keyPoints: [
          'Chain-of-thought improves reasoning',
          'Iterative refinement gets better results',
          'Breaking complex tasks works better',
          'Templates save time',
        ],
        practiceTask: {
          title: 'Advanced Prompt Challenge',
          instructions: 'Solve a complex scenario using advanced techniques.',
          scenario: 'Create a multi-step prompt for a complex analysis task in your role.',
          hints: [
            'Use chain-of-thought',
            'Break into steps',
            'Include self-review',
            'Plan for iteration',
          ],
          successCriteria: [
            'Uses advanced techniques',
            'Handles complexity well',
            'Produces quality output',
            'Is efficient to use',
          ],
        },
      },
    },
    {
      id: '3-5',
      title: 'Capstone Project',
      type: 'exercise',
      description: 'Apply your learning to a real task from your role',
      estimatedTime: '30 min',
      learningObjectives: [
        'Apply all learned skills',
        'Complete a real-world task',
        'Demonstrate AI proficiency',
      ],
      content: {
        overview: 'In this final exercise, you\'ll apply everything you\'ve learned to complete a real task from your daily work, demonstrating your AI proficiency.',
        keyPoints: [
          'Choose a real task from your work',
          'Apply all techniques learned',
          'Document your process',
          'Reflect on results',
        ],
        practiceTask: {
          title: 'Complete a Real Task',
          instructions: 'Use AI to complete an actual task from your role.',
          scenario: 'Select a genuine task you need to do (or recently completed) and redo it with AI assistance.',
          hints: [
            'Pick something realistic',
            'Apply the CLEAR framework',
            'Use your agent if applicable',
            'Compare to manual approach',
          ],
          successCriteria: [
            'Completes a real task',
            'Applies learned techniques',
            'Shows quality improvement',
            'Documents the process',
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
