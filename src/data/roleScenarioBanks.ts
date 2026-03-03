// Role-based scenario banks for Session 1-2 modules (Phase 4)
// Session 3 modules already have departmentScenarios inline in trainingContent.ts
// PracticeChatPanel falls back to these when no inline departmentScenarios exist

export interface RoleScenario {
  scenario: string;
  hints: string[];
}

// Record<moduleId, Record<lobKey, RoleScenario>>
export const ROLE_SCENARIO_BANKS: Record<string, Record<string, RoleScenario>> = {

  // ─── MODULE 1-1: What AI Can Do For You ───────────────────────────────
  '1-1': {
    accounting_finance: {
      scenario: 'You are a finance team member preparing the month-end close package. Your CFO needs a variance commentary that explains budget vs. actual for three expense categories. Write a complete 5-element prompt (Role, Task, Context, Format, Constraints) that would generate a first draft. Then list 2 other tasks in your department where AI-assisted drafting would save the most time.',
      hints: [
        'What role should the AI take — financial analyst, CFO ghostwriter, or internal auditor?',
        'What three expense categories matter most to your CFO?',
        'Should the format match your board package style — narrative paragraphs or bullets?',
        'What accuracy constraint must you state to protect against fabricated figures?',
      ],
    },
    credit_administration: {
      scenario: 'You are reviewing an annual loan review for a $4.2M commercial real estate borrower. The credit committee meets Thursday. Write a 5-element prompt (Role, Task, Context, Format, Constraints) that would produce a risk summary covering DSCR, LTV, payment history, and collateral trends. Then identify 2 other recurring credit tasks where AI could reduce your drafting time.',
      hints: [
        'What role should the AI play — credit analyst, relationship manager, or loan review officer?',
        'What specific ratios and indicators matter most to your credit committee?',
        'Should the output be a narrative memo or a structured table?',
        'What constraint ensures PII and borrower identity are excluded?',
      ],
    },
    executive_leadership: {
      scenario: 'Your board meeting is in two weeks and you need a 1-page executive summary of the bank\'s Q3 performance for the board packet. Write a 5-element prompt (Role, Task, Context, Format, Constraints) that would generate a strong first draft. Then name 2 strategic communication tasks where AI would improve consistency or speed.',
      hints: [
        'What role should the AI take — strategic advisor, board secretary, or CFO ghostwriter?',
        'What performance metrics must the summary include — NIM, ROA, ROE, loan growth?',
        'Should format match your existing board pack template (bullets, headers, one page)?',
        'What material or confidential information constraint must you include?',
      ],
    },
    commercial_lending: {
      scenario: 'You are preparing a credit presentation for a new C&I borrower — a $15M revenue manufacturing company seeking a $3M revolving line. Write a 5-element prompt that would produce a structured credit narrative covering business overview, financial analysis, and risk factors. Then identify 2 other commercial lending tasks where AI would reduce prep time.',
      hints: [
        'What role should the AI play — credit analyst, loan officer, or credit committee scribe?',
        'What are the key risk factors specific to manufacturing borrowers (inventory, concentration, cyclicality)?',
        'Should the output match your standard credit memo format?',
        'What fair lending or CRA constraint must you include?',
      ],
    },
    retail_banking: {
      scenario: 'A customer just called to dispute a $35 overdraft fee, and your branch manager wants a consistent response template for frontline staff. Write a 5-element prompt that generates a professional, empathetic service recovery script. Then list 2 other retail banking communications where AI could ensure consistency and regulatory compliance.',
      hints: [
        'What role should the AI play — customer service coach, compliance-aware communications writer, or branch manager?',
        'What specific tone and empathy requirements do you have?',
        'What format works best — a call script, bullet points, or a full email template?',
        'What UDAAP or Reg E constraint should you include to avoid misleading language?',
      ],
    },
    mortgage_consumer_lending: {
      scenario: 'You need a standard template for communicating conditional loan approval to borrowers — covering required conditions, timeline, and next steps. Write a 5-element prompt that generates a clear, TRID-compliant borrower communication. Then identify 2 other mortgage workflow tasks where AI would reduce repetitive writing.',
      hints: [
        'What role should the AI play — loan officer, compliance writer, or borrower advocate?',
        'What specific conditions (appraisal, title, income verification) does the template typically include?',
        'Should the format be a formal letter or a structured email?',
        'What TRID or ECOA constraint must you specify to ensure compliance?',
      ],
    },
    treasury_cash_management: {
      scenario: 'ALCO meets next week and you need a one-page liquidity summary covering the bank\'s current liquidity ratios, funding sources, and any near-term concerns. Write a 5-element prompt that would generate a clear ALCO memo draft. Then list 2 other treasury tasks where AI would save the most time.',
      hints: [
        'What role should the AI play — ALM analyst, treasurer, or ALCO secretary?',
        'What specific ratios and thresholds matter most (LCR, NSFR, core deposit ratios)?',
        'Should the format be a structured memo with headers or a narrative paragraph?',
        'What investment policy or rate risk constraint must you include?',
      ],
    },
    operations: {
      scenario: 'Your department is updating the wire transfer procedure document for new staff. The current version is out of date after your core system upgrade. Write a 5-element prompt that generates a clear, step-by-step wire processing guide. Then identify 2 other operational procedures where AI-assisted documentation would reduce risk.',
      hints: [
        'What role should the AI play — operations trainer, procedure writer, or compliance documentation specialist?',
        'What specific steps (authorization, verification, dual control, confirmation) must the guide cover?',
        'Should the format be a numbered checklist, a flowchart description, or a narrative document?',
        'What BSA or Reg CC constraint must you include to ensure regulatory accuracy?',
      ],
    },
    compliance_bsa_aml: {
      scenario: 'Your BSA team just completed a suspicious activity investigation. You need to draft a SAR narrative that covers the who, what, when, where, and why of the suspicious activity. Write a 5-element prompt that generates a structured SAR narrative draft. Then identify 2 other compliance tasks where AI would improve consistency or reduce writing time.',
      hints: [
        'What role should the AI play — BSA officer, SAR analyst, or compliance documentation specialist?',
        'What specific who/what/when/where/why elements must the SAR narrative include?',
        'Should the format follow FinCEN\'s standard SAR narrative structure?',
        'What SAR confidentiality or safe harbor constraint must you include?',
      ],
    },
    risk_management: {
      scenario: 'Your enterprise risk management team needs to update the quarterly risk assessment summary for the risk committee. Three top risks have elevated scores this quarter. Write a 5-element prompt that generates a risk summary memo covering risk description, current rating, direction of trend, and mitigation status. Then list 2 other risk management tasks where AI would improve efficiency.',
      hints: [
        'What role should the AI play — ERM analyst, chief risk officer, or risk committee secretary?',
        'What specific risk categories matter most this quarter (credit, operational, interest rate, compliance)?',
        'Should the format be a table with risk ratings or a narrative with headers?',
        'What model risk or data validation constraint must you include?',
      ],
    },
    it_information_security: {
      scenario: 'Following a phishing simulation, you need to send a targeted awareness training reminder to the employees who clicked the test link. Write a 5-element prompt that generates a clear, non-punitive security awareness email. Then identify 2 other IT or security communications where AI would improve consistency.',
      hints: [
        'What role should the AI play — CISO, security awareness trainer, or HR partner?',
        'What specific behaviors (recognizing phishing, reporting to IT, not clicking suspicious links) should the email reinforce?',
        'Should the format be a brief email or a step-by-step guide with examples?',
        'What GLBA or data classification constraint should you include?',
      ],
    },
    human_resources: {
      scenario: 'You are updating the job description for a Branch Manager role after an organizational restructure. The description needs to reflect updated compliance expectations. Write a 5-element prompt that generates a revised, EEO-compliant job description. Then identify 2 other HR tasks where AI would reduce drafting time.',
      hints: [
        'What role should the AI play — HR business partner, talent acquisition specialist, or compensation analyst?',
        'What specific duties and qualifications are changing for this role?',
        'Should the format match your existing job description template?',
        'What EEO, ADA, or FLSA constraint must you include to ensure compliance?',
      ],
    },
    marketing_business_development: {
      scenario: 'You are launching a new checking account product for small businesses. You need a short digital ad copy (under 50 words) that is engaging and compliant. Write a 5-element prompt that generates compliant marketing copy. Then identify 2 other marketing tasks where AI would improve the consistency or speed of content creation.',
      hints: [
        'What role should the AI play — brand copywriter, compliance-aware marketing specialist, or digital marketing strategist?',
        'What key benefits of the product should the copy highlight?',
        'Should the output be a single tagline, a short paragraph, or three draft options?',
        'What UDAAP or Reg DD disclosure constraint must you include?',
      ],
    },
    wealth_management_trust: {
      scenario: 'A trust client is requesting their annual account review summary. You need a professional letter covering portfolio performance, any distributions made, and the plan for next year. Write a 5-element prompt that generates a clear, fiduciary-compliant client letter. Then identify 2 other wealth management tasks where AI would save time.',
      hints: [
        'What role should the AI play — trust officer, fiduciary advisor, or portfolio analyst?',
        'What specific performance data and distribution details should the letter include?',
        'Should the format be a formal letter with letterhead structure or a client-friendly summary?',
        'What Reg 9 or fiduciary duty constraint must you include?',
      ],
    },
  },

  // ─── MODULE 1-2: The CLEAR Framework ──────────────────────────────────
  '1-2': {
    accounting_finance: {
      scenario: 'Part 1: Your controller needs a written explanation of the bank\'s interest income variance — actual came in $47K below budget this quarter. Using CLEAR, write a prompt that would generate a board-ready variance commentary. Annotate which part of your prompt maps to each CLEAR letter.\n\nPart 2: Evaluate these two prompts for missing CLEAR elements:\n- Prompt A: "Explain why interest income was below budget."\n- Prompt B: "As a financial analyst, write variance commentary for our Q3 interest income shortfall. Include the key drivers."',
      hints: [
        'What Context does the AI need — the budget amount, the actual amount, the key drivers you already know?',
        'What Language level is right for your board (executive summary vs. technical detail)?',
        'What Example of a well-written variance commentary would help guide the output?',
        'Who is the Audience — CFO, board members, or external auditors?',
      ],
    },
    credit_administration: {
      scenario: 'Part 1: You are preparing a credit memo section on collateral analysis for a $2.8M CRE loan. Using CLEAR, write a prompt that generates a structured collateral narrative. Annotate which part maps to each CLEAR letter.\n\nPart 2: Evaluate these two prompts:\n- Prompt A: "Write about the collateral for this loan."\n- Prompt B: "Summarize the collateral analysis. Include the property type and LTV ratio."',
      hints: [
        'What Context does the AI need about the collateral — property type, appraised value, LTV, any concerns?',
        'What Language is appropriate — technical credit analysis or plain-language committee summary?',
        'What Example of collateral language from a previous credit memo would help guide the output?',
        'Who is the Audience — loan committee, credit officer, or examiner?',
      ],
    },
    executive_leadership: {
      scenario: 'Part 1: You are preparing a strategic update memo for the board about the bank\'s new digital banking initiative. Using CLEAR, write a prompt that generates a 1-page board memo. Annotate each CLEAR element in your prompt.\n\nPart 2: Evaluate these two prompts:\n- Prompt A: "Write a memo about our digital banking project."\n- Prompt B: "Write an update on our mobile banking rollout for the board. Cover progress to date and next steps."',
      hints: [
        'What Context does the board need — project timeline, budget status, adoption metrics so far?',
        'What Language level suits your board — strategic and non-technical vs. operational detail?',
        'What Example of a successful board memo from your bank would guide the output?',
        'What Rules apply to public disclosure or material information about the initiative?',
      ],
    },
    commercial_lending: {
      scenario: 'Part 1: Your team needs a standard email template for following up with a commercial prospect after the initial meeting. Using CLEAR, write a prompt that generates a professional follow-up email. Annotate each CLEAR element.\n\nPart 2: Evaluate these two prompts:\n- Prompt A: "Write a follow-up email for a prospect meeting."\n- Prompt B: "Write a follow-up email to a commercial banking prospect after our first meeting. Be professional."',
      hints: [
        'What Context does the AI need — the prospect\'s industry, what was discussed, the deal type being explored?',
        'What Language matches your relationship style — formal, professional, or relationship-focused?',
        'What Example of a successful follow-up email would help guide the output?',
        'What Rules apply — no promises about approval, no specific rate quotes without compliance review?',
      ],
    },
    retail_banking: {
      scenario: 'Part 1: Your branch manager needs a script for cross-selling savings accounts to checking customers. Using CLEAR, write a prompt that generates a compliant, natural-sounding conversation guide for tellers. Annotate each CLEAR element.\n\nPart 2: Evaluate these two prompts:\n- Prompt A: "Write a script for selling savings accounts."\n- Prompt B: "Create a teller script for suggesting savings accounts to checking customers. Keep it brief."',
      hints: [
        'What Context does the AI need — the target product, its key benefits, the customer relationship?',
        'What Language is appropriate — natural conversation, not a sales pitch?',
        'What Example of a successful cross-sell conversation would guide the output?',
        'What UDAAP or fair lending Rule must you include to prevent misleading language?',
      ],
    },
    mortgage_consumer_lending: {
      scenario: 'Part 1: You need to write a denial letter explanation for a borrower whose home equity loan was declined. Using CLEAR, write a prompt that generates an ECOA-compliant adverse action explanation. Annotate each CLEAR element.\n\nPart 2: Evaluate these two prompts:\n- Prompt A: "Write a denial letter for a home equity loan."\n- Prompt B: "Write an adverse action explanation for a home equity loan denial based on insufficient income. Be clear."',
      hints: [
        'What Context does the AI need — the denial reason, the product type, the regulatory framework?',
        'What Language level is appropriate for a borrower (plain language, not legal jargon)?',
        'What Example of compliant adverse action language would guide the output?',
        'What ECOA or Reg B Rule requires specific language or prohibits specific language?',
      ],
    },
    treasury_cash_management: {
      scenario: 'Part 1: Your ALM team needs commentary on the current interest rate risk position for the ALCO package. Using CLEAR, write a prompt that generates a structured rate risk narrative. Annotate each CLEAR element.\n\nPart 2: Evaluate these two prompts:\n- Prompt A: "Write about our interest rate risk."\n- Prompt B: "Summarize the bank\'s current rate risk position. Include our asset sensitivity and NII impact scenarios."',
      hints: [
        'What Context does the AI need — current rate environment, bank\'s asset/liability positioning, recent model outputs?',
        'What Language level is right for ALCO (technical vs. executive summary)?',
        'What Example of prior ALCO commentary would guide the format?',
        'What Rules apply — investment policy thresholds, rate risk limits, model validation requirements?',
      ],
    },
    operations: {
      scenario: 'Part 1: Your team is creating a quick-reference checklist for processing incoming wire transfers correctly. Using CLEAR, write a prompt that generates a clear, step-by-step wire processing checklist. Annotate each CLEAR element.\n\nPart 2: Evaluate these two prompts:\n- Prompt A: "Write steps for processing wires."\n- Prompt B: "Create a checklist for wire transfer processing. Include the key verification steps."',
      hints: [
        'What Context does the AI need — the wire types you handle, your core system, the dual-control requirement?',
        'What Language level suits your frontline operations staff?',
        'What Example of an existing checklist would guide the format?',
        'What BSA or Reg E Rule must be reflected in the verification steps?',
      ],
    },
    compliance_bsa_aml: {
      scenario: 'Part 1: A BSA examiner is visiting next month. You need a one-page summary of your BSA/AML program highlights for the examiner briefing. Using CLEAR, write a prompt that generates a structured program overview. Annotate each CLEAR element.\n\nPart 2: Evaluate these two prompts:\n- Prompt A: "Write about our BSA program."\n- Prompt B: "Create an overview of our BSA/AML program for examiner review. Cover the five pillars of BSA compliance."',
      hints: [
        'What Context does the AI need — your program\'s size, last exam results, any recent updates?',
        'What Language level is right for an examiner vs. internal staff?',
        'What Example of an examiner-ready program summary would guide the output?',
        'What SAR confidentiality or FinCEN Rule constrains what you can include?',
      ],
    },
    risk_management: {
      scenario: 'Part 1: Your risk committee needs a brief explanation of a newly elevated operational risk — a key vendor just announced a platform migration. Using CLEAR, write a prompt that generates a risk event brief. Annotate each CLEAR element.\n\nPart 2: Evaluate these two prompts:\n- Prompt A: "Write about our vendor risk."\n- Prompt B: "Write a risk brief about a key vendor platform migration. Cover impact and mitigation steps."',
      hints: [
        'What Context does the AI need — the vendor\'s role, the migration timeline, the bank\'s dependency?',
        'What Language level is right for the risk committee vs. front-line staff?',
        'What Example of a well-written risk brief would guide the format?',
        'What model risk or third-party management Rule must the brief reference?',
      ],
    },
    it_information_security: {
      scenario: 'Part 1: You need to communicate a required password policy change to all bank staff. Using CLEAR, write a prompt that generates a clear, friendly all-staff security announcement. Annotate each CLEAR element.\n\nPart 2: Evaluate these two prompts:\n- Prompt A: "Write about our new password rules."\n- Prompt B: "Write a staff announcement about our new password policy. Explain the changes and deadline."',
      hints: [
        'What Context does the AI need — what is changing, the effective date, how to update passwords?',
        'What Language level is right for all staff (non-technical)?',
        'What Example of a previous security announcement would guide the format?',
        'What GLBA or data security Rule motivates the policy change?',
      ],
    },
    human_resources: {
      scenario: 'Part 1: You are rewriting the bank\'s remote work policy after your hybrid schedule pilot ended. Using CLEAR, write a prompt that generates a clear, legally-sound policy update for employees. Annotate each CLEAR element.\n\nPart 2: Evaluate these two prompts:\n- Prompt A: "Write a remote work policy."\n- Prompt B: "Update our remote work policy to reflect our new hybrid schedule. Cover eligibility and security requirements."',
      hints: [
        'What Context does the AI need — which roles are eligible, what the new schedule is, what changed from the pilot?',
        'What Language level suits all employees — accessible, not legal jargon?',
        'What Example of a well-written HR policy update would guide the format?',
        'What FLSA, ADA, or labor law Rule must the policy reflect?',
      ],
    },
    marketing_business_development: {
      scenario: 'Part 1: Your bank is sponsoring a local community event as part of your CRA commitment. Using CLEAR, write a prompt that generates a community event announcement for social media and email. Annotate each CLEAR element.\n\nPart 2: Evaluate these two prompts:\n- Prompt A: "Write something about our community event."\n- Prompt B: "Write a social media post about our bank\'s community sponsorship event. Highlight our CRA commitment."',
      hints: [
        'What Context does the AI need — event name, date, what the bank is contributing, audience (local community)?',
        'What Language and tone fit your brand voice — professional, warm, community-focused?',
        'What Example of a successful past community announcement would guide the output?',
        'What UDAAP or truthful advertising Rule applies to the claims you make about your contribution?',
      ],
    },
    wealth_management_trust: {
      scenario: 'Part 1: A high-net-worth prospect is considering moving their trust account to your bank. You need a professional introduction email for the first outreach. Using CLEAR, write a prompt that generates a compelling, fiduciary-appropriate email. Annotate each CLEAR element.\n\nPart 2: Evaluate these two prompts:\n- Prompt A: "Write an email for a trust prospect."\n- Prompt B: "Write a first-contact email to a high-net-worth trust prospect. Mention our trust services."',
      hints: [
        'What Context does the AI need — the prospect\'s situation, what services you offer, what differentiates your trust department?',
        'What Language level is right for a sophisticated client vs. general public?',
        'What Example of a successful trust prospect email would guide the output?',
        'What fiduciary duty or suitability Rule constrains the promises you can make?',
      ],
    },
  },

  // ─── MODULE 1-4: Iteration & Refinement ───────────────────────────────
  '1-4': {
    accounting_finance: {
      scenario: 'Starting prompt: "Analyze these financials."\n\nYou are preparing for the bank\'s quarterly financial review. Your CFO will present to the board. Starting from the basic prompt above, iterate at least 3 times to produce a prompt that generates a variance commentary showing budget vs. actual results for three key income statement lines, formatted for board review, excluding any unreleased figures. After your 3rd iteration, write one sentence on what changed most between v1 and v3.',
      hints: [
        'Add your role (financial analyst or CFO ghostwriter) and the board presentation context',
        'Specify which three income statement lines matter most (NIM, non-interest income, operating expenses)',
        'Include format preferences — executive-level bullet points vs. narrative paragraphs',
        'Add a constraint: AI should flag where actual data must be inserted before use',
      ],
    },
    credit_administration: {
      scenario: 'Starting prompt: "Review this loan file."\n\nYou are conducting an annual loan review for a $3.5M commercial borrower. Starting from the basic prompt above, iterate at least 3 times to produce a prompt that generates a structured credit review summary covering financial trends, covenant compliance, and risk rating rationale, ready for the credit committee. After your 3rd iteration, write one sentence on what changed most between v1 and v3.',
      hints: [
        'Add role context (credit analyst, loan review officer) and the committee audience',
        'Specify which financial metrics to analyze (DSCR, debt-to-equity, current ratio, revenue trends)',
        'Add format preferences — narrative paragraphs or structured table with risk rating',
        'Include a constraint: no real borrower names or PII in the output',
      ],
    },
    executive_leadership: {
      scenario: 'Starting prompt: "Write an update for the board."\n\nYour Q3 board package is due in one week. Starting from the basic prompt above, iterate at least 3 times to produce a prompt that generates a concise, one-page executive summary covering financial performance, key strategic initiatives, and emerging risks, formatted for a 45-minute board session. After your 3rd iteration, write one sentence on what changed most between v1 and v3.',
      hints: [
        'Add role context (CEO, CFO, or chief of staff) and the board\'s meeting objectives',
        'Specify which performance metrics must be included (ROA, loan growth, deposit growth, capital ratios)',
        'Include format preferences — structured headers, executive bullets, one-page limit',
        'Add a constraint: no forward-looking statements about rates or market conditions without compliance review',
      ],
    },
    commercial_lending: {
      scenario: 'Starting prompt: "Write up this deal."\n\nYou are preparing a term sheet and credit narrative for a new $5M commercial real estate acquisition loan. Starting from the basic prompt above, iterate at least 3 times to produce a prompt that generates a structured credit presentation covering deal overview, financial analysis, risk factors, and proposed structure. After your 3rd iteration, write one sentence on what changed most between v1 and v3.',
      hints: [
        'Add role context (commercial loan officer, credit analyst) and the credit committee audience',
        'Specify the deal details — property type, LTV, DSCR, borrower\'s track record',
        'Include format preferences — your bank\'s standard credit memo sections',
        'Add a fair lending or CRA constraint relevant to the geography of the deal',
      ],
    },
    retail_banking: {
      scenario: 'Starting prompt: "Write a response to this customer complaint."\n\nA customer escalated a complaint about a mobile deposit hold that caused an overdraft. Starting from the basic prompt above, iterate at least 3 times to produce a prompt that generates a professional, empathetic written response that acknowledges the concern, explains the hold policy clearly, and offers a resolution path — all within Reg CC and UDAAP guidelines. After your 3rd iteration, write one sentence on what changed most between v1 and v3.',
      hints: [
        'Add role context (customer service specialist, branch manager) and the escalation audience',
        'Specify the specific complaint details — mobile deposit, hold duration, resulting overdraft',
        'Include format preferences — formal letter, email, or phone script?',
        'Add a UDAAP constraint: response cannot imply fault without review or promise fee waivers without approval',
      ],
    },
    mortgage_consumer_lending: {
      scenario: 'Starting prompt: "Explain this loan status to the borrower."\n\nA mortgage borrower is requesting an update on their file, which is in underwriting and waiting on two outstanding conditions. Starting from the basic prompt above, iterate at least 3 times to produce a prompt that generates a clear borrower update letter covering current status, outstanding conditions, expected timeline, and next steps, compliant with RESPA and TRID. After your 3rd iteration, write one sentence on what changed most between v1 and v3.',
      hints: [
        'Add role context (loan officer, processor) and the borrower audience',
        'Specify the two outstanding conditions (e.g., appraisal and employment verification) and the expected timeline',
        'Include format preferences — formal letter, email, or a status summary table?',
        'Add a RESPA or TRID constraint: no promised closing dates without underwriter confirmation',
      ],
    },
    treasury_cash_management: {
      scenario: 'Starting prompt: "Summarize our liquidity position."\n\nYour ALCO packet is due Friday. Starting from the basic prompt above, iterate at least 3 times to produce a prompt that generates a clear liquidity summary covering current ratios, funding sources and concentrations, contingency triggers, and any near-term concerns relative to your policy limits. After your 3rd iteration, write one sentence on what changed most between v1 and v3.',
      hints: [
        'Add role context (ALM analyst, treasurer) and the ALCO audience',
        'Specify which liquidity metrics your committee tracks (basic surplus, core deposit ratio, FHLB borrowing capacity)',
        'Include format preferences — structured memo with headers vs. a data table',
        'Add a constraint: all figures must be flagged as draft pending final model run',
      ],
    },
    operations: {
      scenario: 'Starting prompt: "Document this process."\n\nYour operations manager needs a written procedure for processing returned items (NSF checks and ACH returns). Starting from the basic prompt above, iterate at least 3 times to produce a prompt that generates a clear, step-by-step processing guide that covers intake, posting, notification, and fee handling — compliant with Reg CC. After your 3rd iteration, write one sentence on what changed most between v1 and v3.',
      hints: [
        'Add role context (operations specialist, process documentation writer) and the frontline staff audience',
        'Specify the specific steps that matter most — intake, dual control, customer notification, fee assessment',
        'Include format preferences — numbered steps, decision flowchart description, or checklist?',
        'Add a Reg CC or BSA constraint that must be reflected in the notification and hold steps',
      ],
    },
    compliance_bsa_aml: {
      scenario: 'Starting prompt: "Summarize this transaction pattern."\n\nYour BSA analyst identified a customer with unusual cash structuring activity over a 30-day period. Starting from the basic prompt above, iterate at least 3 times to produce a prompt that generates a clear transaction pattern summary suitable for use in a SAR narrative — covering amount, frequency, pattern description, and red flags. After your 3rd iteration, write one sentence on what changed most between v1 and v3.',
      hints: [
        'Add role context (BSA analyst, compliance officer) and the SAR documentation audience',
        'Specify which pattern elements to highlight — cash amounts, frequency, structuring indicators, comparison to account purpose',
        'Include format for the SAR narrative section — structured paragraphs following FinCEN format',
        'Add a SAR confidentiality constraint: no customer-identifying information in the AI output',
      ],
    },
    risk_management: {
      scenario: 'Starting prompt: "Describe this risk."\n\nYou are preparing a risk event write-up for a newly identified operational risk — a critical third-party vendor missed an SLA deadline. Starting from the basic prompt above, iterate at least 3 times to produce a prompt that generates a structured risk event description covering what happened, potential impact, likelihood, and initial mitigation steps, suitable for the risk register. After your 3rd iteration, write one sentence on what changed most between v1 and v3.',
      hints: [
        'Add role context (ERM analyst, operational risk officer) and the risk committee audience',
        'Specify the event details — vendor name (synthetic), SLA type, duration of failure, downstream impact',
        'Include format preferences — structured risk register entry or narrative description?',
        'Add a model risk or vendor management constraint that must be referenced in the mitigation section',
      ],
    },
    it_information_security: {
      scenario: 'Starting prompt: "Document this incident."\n\nYour team responded to a phishing email that two employees clicked. No systems were compromised, but the incident must be documented per your incident response plan. Starting from the basic prompt above, iterate at least 3 times to produce a prompt that generates a structured incident report covering what happened, who was affected, response steps taken, and lessons learned. After your 3rd iteration, write one sentence on what changed most between v1 and v3.',
      hints: [
        'Add role context (information security analyst, CISO) and the incident response team audience',
        'Specify the key incident details — phishing type, affected users, detection method, response timeline',
        'Include format preferences — formal incident report format with sections vs. brief narrative?',
        'Add a GLBA or data classification constraint that must be reflected in the response steps',
      ],
    },
    human_resources: {
      scenario: 'Starting prompt: "Write a job description."\n\nYour HR team is posting a new role — Senior Compliance Analyst — after a department restructure. The role requires BSA/AML experience and reports to the CCO. Starting from the basic prompt above, iterate at least 3 times to produce a prompt that generates an EEO-compliant, clearly structured job description that accurately reflects the duties, qualifications, and compliance expectations. After your 3rd iteration, write one sentence on what changed most between v1 and v3.',
      hints: [
        'Add role context (HR business partner, talent acquisition specialist) and the candidate audience',
        'Specify the key duties and qualifications (BSA/AML experience, regulatory knowledge, reports to CCO)',
        'Include format preferences — sections for Summary, Responsibilities, Qualifications, and EEO statement?',
        'Add an EEO or ADA constraint ensuring the qualifications are requirements-based, not discriminatory',
      ],
    },
    marketing_business_development: {
      scenario: 'Starting prompt: "Write a marketing email."\n\nYour bank is launching a new HELOC product targeting homeowners in your primary market. Starting from the basic prompt above, iterate at least 3 times to produce a prompt that generates a compliant, engaging marketing email that highlights the product\'s rate advantage, flexibility, and local service — without making promises that violate UDAAP or Reg Z. After your 3rd iteration, write one sentence on what changed most between v1 and v3.',
      hints: [
        'Add role context (marketing copywriter, compliance-aware digital marketer) and the target audience (homeowner, age 35-60)',
        'Specify the key product advantages — rate, draw period, local underwriting',
        'Include format preferences — subject line, two-paragraph body, CTA?',
        'Add a UDAAP or Reg Z constraint: no claims about "lowest rate" or "guaranteed approval"',
      ],
    },
    wealth_management_trust: {
      scenario: 'Starting prompt: "Write a client investment update."\n\nA trust client\'s portfolio underperformed its benchmark by 3.2% last quarter due to a defensive positioning decision. You need to communicate this clearly while maintaining fiduciary confidence. Starting from the basic prompt above, iterate at least 3 times to produce a prompt that generates a clear, professional client letter covering performance context, rationale, and forward outlook — compliant with fiduciary standards. After your 3rd iteration, write one sentence on what changed most between v1 and v3.',
      hints: [
        'Add role context (trust officer, portfolio manager) and the beneficiary/client audience',
        'Specify the performance details — underperformance amount, defensive positioning rationale, benchmark',
        'Include format preferences — formal letter with performance table or narrative?',
        'Add a Reg 9 or fiduciary duty constraint: no guarantees about future performance',
      ],
    },
  },

  // ─── MODULE 1-6: Session 1 Capstone ───────────────────────────────────
  '1-6': {
    accounting_finance: {
      scenario: 'You are closing the books on Q3 and your CFO needs one of these before the board meeting: (A) a written variance commentary on NIM, (B) a risk-flagged budget vs. actual table for operating expenses, or (C) a draft management discussion & analysis section for the board report.\n\nChoose the deliverable most relevant to your role. Write a CLEAR prompt, iterate at least 2 times, then apply VERIFY to the output. After reviewing AI output, write 2-3 sentences identifying exactly what you would verify before using it in the real board package.',
      hints: [
        'Choose the deliverable closest to your actual work for maximum learning transfer',
        'Set your role (financial analyst, controller, CFO ghostwriter) and the board\'s expectations',
        'Use CLEAR to structure your prompt — don\'t skip the Language level for board vs. operational audiences',
        'After getting output, apply VERIFY: what figures must be cross-checked? What regulatory references need review?',
      ],
    },
    credit_administration: {
      scenario: 'Credit committee meets Thursday. Your borrower is a $6.5M hospitality borrower with a declining DSCR. Choose one deliverable: (A) risk summary narrative for the committee package, (B) a set of 8 due diligence questions the loan officer should ask the borrower, or (C) a covenant compliance checklist with pass/fail for each covenant.\n\nWrite a CLEAR prompt, iterate at least 2 times, then VERIFY the output. Write 2-3 sentences on what specific items you would verify before submitting to committee.',
      hints: [
        'Choose the deliverable that would most help your committee this week',
        'Set your role (credit analyst, loan review officer, credit officer) with the committee\'s risk appetite in mind',
        'Use CLEAR: what is the audience\'s expertise level — technical credit or relationship-focused?',
        'After getting AI output, VERIFY: are the DSCR calculations accurate? Are the risk flags consistent with your bank\'s risk rating criteria?',
      ],
    },
    executive_leadership: {
      scenario: 'The board wants a one-page strategic update at the next meeting. Choose one deliverable: (A) an executive narrative summary of Q3 strategic priorities, (B) a risk and opportunity matrix (3 risks, 3 opportunities) in table format, or (C) a decision framework for a pending strategic initiative.\n\nWrite a CLEAR prompt, iterate at least 2 times, apply VERIFY. Write 2-3 sentences on what you would verify before presenting to the board.',
      hints: [
        'Choose the format that fits your board\'s existing meeting rhythm',
        'Set your role (CEO, chief strategy officer, board secretary) and the board\'s decision-making context',
        'Use CLEAR to structure a prompt that matches board-level language — concise, strategic, not operational',
        'VERIFY: are the strategic claims accurate against your bank\'s actual Q3 data? Are any forward-looking statements flagged for legal review?',
      ],
    },
    commercial_lending: {
      scenario: 'You are preparing for a credit committee presentation on a new $8M C&I borrower. Choose one deliverable: (A) a narrative summary of the business and its key risk factors, (B) a financial spread comparing 3 years of ratios to industry benchmarks, or (C) a proposed loan structure term sheet.\n\nWrite a CLEAR prompt, iterate at least 2 times, apply VERIFY. Write 2-3 sentences on what you would verify before submitting to committee.',
      hints: [
        'Choose the deliverable that most closely matches your actual committee prep workflow',
        'Set role context: credit analyst, loan officer, or commercial banking associate — and specify the committee\'s expectations',
        'Use CLEAR: what format does your credit committee expect? What constraints apply to fair lending or concentration limits?',
        'VERIFY: are the industry benchmarks cited accurate? Are the loan terms consistent with your current credit policy?',
      ],
    },
    retail_banking: {
      scenario: 'A customer just had a negative experience with a mobile banking outage that caused a delayed payment. Choose one deliverable: (A) a scripted response for frontline staff to use when customers call about the outage, (B) a written apology email for affected customers, or (C) a FAQ document answering the top 5 questions about the outage and resolution timeline.\n\nWrite a CLEAR prompt, iterate at least 2 times, apply VERIFY. Write 2-3 sentences on what you would verify before deploying the response.',
      hints: [
        'Choose the format that your branch or operations team needs most urgently',
        'Set role context: customer service manager, communications specialist, or branch manager',
        'Use CLEAR: what language level is right for your customer base? What UDAAP constraints apply?',
        'VERIFY: does the response make any promises about fee refunds or compensation? Does any language need compliance review before distribution?',
      ],
    },
    mortgage_consumer_lending: {
      scenario: 'Your pipeline has a backlog and borrowers are frustrated with slow updates. Choose one deliverable: (A) a standard update email template for borrowers at the conditional approval stage, (B) a FAQ document about the closing process and what to expect in the last 30 days, or (C) a closing disclosure explanation guide in plain language.\n\nWrite a CLEAR prompt, iterate at least 2 times, apply VERIFY. Write 2-3 sentences on what you would verify before sending to borrowers.',
      hints: [
        'Choose the deliverable that addresses your current pipeline bottleneck',
        'Set role context (loan officer, processor, closing coordinator) and the borrower\'s stress level',
        'Use CLEAR: what plain language standard applies (12th grade vs. 8th grade reading level)?',
        'VERIFY: does the output include any promised timelines? Does it reference specific TRID or RESPA requirements accurately?',
      ],
    },
    treasury_cash_management: {
      scenario: 'ALCO meets next week. Choose one deliverable: (A) a liquidity risk narrative for the ALCO packet covering current position and near-term risks, (B) a rate sensitivity analysis summary showing NII impact under +100 and +200 bp scenarios, or (C) a funding concentration report highlighting top 10 depositor relationships as a percentage of total funding.\n\nWrite a CLEAR prompt, iterate at least 2 times, apply VERIFY. Write 2-3 sentences on what you would verify before submitting to ALCO.',
      hints: [
        'Choose the deliverable your ALCO needs most before next week\'s meeting',
        'Set role context (ALM analyst, treasurer, ALCO secretary) with committee expectations',
        'Use CLEAR: what format does ALCO expect — structured tables with narrative or executive summary?',
        'VERIFY: do the rate sensitivity figures match your most recent model run? Are the funding concentrations flagged against your policy limits?',
      ],
    },
    operations: {
      scenario: 'Your operations department is updating standard procedures after a core system upgrade. Choose one deliverable: (A) a step-by-step wire processing guide for new staff, (B) an ACH origination quality control checklist, or (C) a same-day settlement reconciliation procedure.\n\nWrite a CLEAR prompt, iterate at least 2 times, apply VERIFY. Write 2-3 sentences on what you would verify before distributing to operations staff.',
      hints: [
        'Choose the procedure your team most urgently needs after the system upgrade',
        'Set role context (operations manager, procedure writer, training coordinator) and the staff audience',
        'Use CLEAR: what format works best for operations procedures — numbered steps, flowchart narrative, or decision tree?',
        'VERIFY: does each step reflect the updated system workflow accurately? Does the procedure reference the correct dual-control and authorization requirements?',
      ],
    },
    compliance_bsa_aml: {
      scenario: 'An examiner review is scheduled for next month. Choose one deliverable: (A) a one-page BSA/AML program overview for the examiner briefing book, (B) a risk assessment narrative summary of the bank\'s three highest BSA risk categories, or (C) a CTR filing quality review checklist.\n\nWrite a CLEAR prompt, iterate at least 2 times, apply VERIFY. Write 2-3 sentences on what you would verify before including in the examiner package.',
      hints: [
        'Choose the deliverable that most directly addresses your exam preparation gaps',
        'Set role context (BSA officer, compliance analyst, examiner liaison) with the examiner\'s expectations',
        'Use CLEAR: what level of detail do examiners expect vs. internal summaries?',
        'VERIFY: does the output accurately reflect your program\'s actual policies and procedures? Does it inadvertently disclose confidential SAR information?',
      ],
    },
    risk_management: {
      scenario: 'Your risk committee meets in two weeks. Choose one deliverable: (A) a quarterly risk heat map narrative (top 5 risks rated by likelihood and impact), (B) a risk appetite statement update reflecting one new strategic risk, or (C) an operational risk event report for a recently identified control gap.\n\nWrite a CLEAR prompt, iterate at least 2 times, apply VERIFY. Write 2-3 sentences on what you would verify before presenting to the risk committee.',
      hints: [
        'Choose the deliverable that most directly addresses your current committee agenda',
        'Set role context (ERM analyst, chief risk officer, risk committee secretary) with the committee\'s expectations',
        'Use CLEAR: what level of technical detail does your risk committee expect vs. the board?',
        'VERIFY: are the risk ratings consistent with your current risk register? Does the narrative accurately reflect the control environment as of today?',
      ],
    },
    it_information_security: {
      scenario: 'A recent phishing test resulted in a 22% click rate — higher than your target. Leadership wants a response. Choose one deliverable: (A) a written security awareness communication to all staff explaining the test results and action steps, (B) a targeted training outline for the employees who clicked, or (C) a technical incident response summary for CISO review.\n\nWrite a CLEAR prompt, iterate at least 2 times, apply VERIFY. Write 2-3 sentences on what you would verify before distributing.',
      hints: [
        'Choose the deliverable that your CISO or HR partner most urgently needs',
        'Set role context (security awareness manager, CISO, HR partner) with the audience in mind',
        'Use CLEAR: how technical should the staff communication be — plain language or IT-specific detail?',
        'VERIFY: does the communication avoid shaming individuals? Does it accurately reflect your incident response procedures?',
      ],
    },
    human_resources: {
      scenario: 'HR is launching the bank\'s annual performance review cycle. Choose one deliverable: (A) a manager\'s guide to conducting fair, legally defensible performance conversations, (B) an employee communication explaining the new self-assessment process, or (C) a sample performance review template for an exempt banking role.\n\nWrite a CLEAR prompt, iterate at least 2 times, apply VERIFY. Write 2-3 sentences on what you would verify before distributing to managers.',
      hints: [
        'Choose the deliverable that addresses your current performance cycle bottleneck',
        'Set role context (HRBP, talent development manager) with the manager and employee audience',
        'Use CLEAR: what language level is right — accessible to all staff, not HR jargon?',
        'VERIFY: does the guide include EEO and ADA-compliant language? Are the performance criteria tied to job functions rather than personal characteristics?',
      ],
    },
    marketing_business_development: {
      scenario: 'Your bank is expanding into a new market and needs marketing support. Choose one deliverable: (A) a market entry announcement for existing customers and prospects, (B) a social media content calendar for the first month of the expansion campaign, or (C) a community reinvestment (CRA) event announcement for local partners.\n\nWrite a CLEAR prompt, iterate at least 2 times, apply VERIFY. Write 2-3 sentences on what you would verify before publishing.',
      hints: [
        'Choose the deliverable that your market expansion team needs first',
        'Set role context (marketing manager, community development officer, communications director) with the target audience',
        'Use CLEAR: what brand voice and tone are appropriate for a new market entry vs. existing customers?',
        'VERIFY: does the announcement make any geographic targeting claims that could raise fair lending concerns? Does any copy need compliance review for UDAAP or Reg DD disclosures?',
      ],
    },
    wealth_management_trust: {
      scenario: 'A high-value trust client is requesting a comprehensive year-end review. Choose one deliverable: (A) a trust account annual review summary letter covering performance, distributions, and forward plan, (B) a fiduciary meeting agenda and discussion guide for the client meeting, or (C) an investment policy statement update reflecting the client\'s revised risk tolerance.\n\nWrite a CLEAR prompt, iterate at least 2 times, apply VERIFY. Write 2-3 sentences on what you would verify before sharing with the client.',
      hints: [
        'Choose the deliverable closest to your current client management priorities',
        'Set role context (trust officer, portfolio manager, fiduciary advisor) with the client\'s sophistication level',
        'Use CLEAR: what language is appropriate for a high-net-worth client — professional, not overly technical?',
        'VERIFY: does the letter accurately reflect portfolio performance from your statement data? Does it make any forward-looking return projections that require compliance review?',
      ],
    },
  },

  // ─── MODULE 2-1: From Prompts to Agents ───────────────────────────────
  '2-1': {
    accounting_finance: {
      scenario: 'Review the best prompt you wrote in Session 1 (ideally your variance commentary or MD&A prompt from Module 1-6). Map it to the 5 agent architecture sections:\n\n1. Which part becomes the Identity? (Who the agent is and who it serves)\n2. Which part becomes the Task List? (What it does)\n3. Which part becomes the Output Rules? (How it formats)\n4. Which part becomes the Guard Rails? (What it refuses)\n5. What Compliance Anchors would you add? (What regulatory language must always appear)\n\nThen answer: Would you build a dedicated Variance Commentary Agent for your monthly close process? What consistency or compliance benefit would it provide over one-off prompts?',
      hints: [
        'What role did your Session 1 prompt specify? That becomes the agent\'s Identity',
        'What format did you request in your best prompt? That becomes Output Rules',
        'What constraints did you include about PII, GAAP accuracy, or data handling? Those become Guard Rails',
        'Would you use this same prompt again every month? That\'s the key test for agent vs. one-off',
      ],
    },
    credit_administration: {
      scenario: 'Review your best Session 1 credit analysis prompt (from Module 1-6 or 1-4). Map it to the 5 agent architecture sections:\n\n1. Which part becomes the Identity?\n2. Which part becomes the Task List?\n3. Which part becomes the Output Rules?\n4. Which part becomes the Guard Rails?\n5. What Compliance Anchors would you add?\n\nThen answer: Would you build a dedicated Annual Loan Review Agent for your portfolio? What would it do consistently that one-off prompts cannot — and what compliance language must it always include?',
      hints: [
        'What role did your credit prompt specify? (Credit analyst, loan review officer) — that\'s the Identity',
        'What specific analysis tasks did your prompt request? (DSCR, collateral, covenant checks) — that\'s the Task List',
        'What PII and borrower confidentiality constraints did you include? Those become Guard Rails',
        'What fair lending or credit policy language must always appear in a loan review output?',
      ],
    },
    executive_leadership: {
      scenario: 'Review your best Session 1 board communication or strategic summary prompt. Map it to the 5 agent architecture sections:\n\n1. Which part becomes the Identity?\n2. Which part becomes the Task List?\n3. Which part becomes the Output Rules?\n4. Which part becomes the Guard Rails?\n5. What Compliance Anchors would you add?\n\nThen answer: Would you build a Board Communication Agent for your monthly or quarterly board package? What strategic communication benefit would a consistent agent provide over one-off drafts?',
      hints: [
        'What role did your board communication prompt specify? (CEO ghostwriter, CFO communications advisor) — that\'s the Identity',
        'What specific deliverables did your prompt generate? (Executive summary, risk update, metrics table) — that\'s the Task List',
        'What material information or forward-looking statement constraints did you include? Those become Guard Rails',
        'What regulatory or governance language must always appear in board communications?',
      ],
    },
    commercial_lending: {
      scenario: 'Review your best Session 1 commercial lending prompt (credit narrative, term sheet, or due diligence questions). Map it to the 5 agent architecture sections:\n\n1. Which part becomes the Identity?\n2. Which part becomes the Task List?\n3. Which part becomes the Output Rules?\n4. Which part becomes the Guard Rails?\n5. What Compliance Anchors would you add?\n\nThen answer: Would you build a Commercial Credit Memo Agent for your deal pipeline? What efficiency or consistency benefit would it provide — and what fair lending language must it always include?',
      hints: [
        'What role did your credit memo prompt specify? (Credit analyst, commercial banking associate) — that\'s the Identity',
        'What specific sections did your credit narrative include? (Business overview, financials, risk factors) — that\'s the Task List',
        'What fair lending or concentration limit constraints did you include? Those become Guard Rails',
        'What CRA, ECOA, or credit policy language must always appear in your credit presentations?',
      ],
    },
    retail_banking: {
      scenario: 'Review your best Session 1 retail banking prompt (customer communication, service recovery, or cross-sell script). Map it to the 5 agent architecture sections:\n\n1. Which part becomes the Identity?\n2. Which part becomes the Task List?\n3. Which part becomes the Output Rules?\n4. Which part becomes the Guard Rails?\n5. What Compliance Anchors would you add?\n\nThen answer: Would you build a Customer Communications Agent for your branch? What consistency or compliance benefit would it provide — and what UDAAP language must it always observe?',
      hints: [
        'What role did your customer communication prompt specify? (Service representative, branch manager) — that\'s the Identity',
        'What specific tasks did your prompt address? (Service recovery, product explanation, cross-sell) — that\'s the Task List',
        'What tone and UDAAP constraints did you include? Those become Guard Rails',
        'What Reg E, UDAAP, or fair lending language must always appear in customer-facing communications?',
      ],
    },
    mortgage_consumer_lending: {
      scenario: 'Review your best Session 1 mortgage lending prompt (borrower communication, underwriting summary, or closing guide). Map it to the 5 agent architecture sections:\n\n1. Which part becomes the Identity?\n2. Which part becomes the Task List?\n3. Which part becomes the Output Rules?\n4. Which part becomes the Guard Rails?\n5. What Compliance Anchors would you add?\n\nThen answer: Would you build a Borrower Communications Agent for your pipeline? What TRID or ECOA compliance benefit would a consistent agent provide over one-off drafts?',
      hints: [
        'What role did your mortgage prompt specify? (Loan officer, processor, closing coordinator) — that\'s the Identity',
        'What specific borrower communications did your prompt generate? (Status updates, condition explanations) — that\'s the Task List',
        'What TRID, ECOA, or RESPA constraints did you include? Those become Guard Rails',
        'What fair lending or disclosure language must always appear in borrower communications?',
      ],
    },
    treasury_cash_management: {
      scenario: 'Review your best Session 1 treasury/ALCO prompt (liquidity summary, rate risk narrative, or ALCO memo). Map it to the 5 agent architecture sections:\n\n1. Which part becomes the Identity?\n2. Which part becomes the Task List?\n3. Which part becomes the Output Rules?\n4. Which part becomes the Guard Rails?\n5. What Compliance Anchors would you add?\n\nThen answer: Would you build a dedicated ALCO Reporting Agent? What consistency benefit would it provide — and what investment policy language must it always include?',
      hints: [
        'What role did your ALCO prompt specify? (ALM analyst, treasurer) — that\'s the Identity',
        'What recurring ALCO deliverables did your prompt generate? (Liquidity summary, rate risk narrative) — that\'s the Task List',
        'What policy limit or model validation constraints did you include? Those become Guard Rails',
        'What ALCO policy or rate risk limit language must always appear in your committee reporting?',
      ],
    },
    operations: {
      scenario: 'Review your best Session 1 operations prompt (procedure documentation, checklist, or reconciliation guide). Map it to the 5 agent architecture sections:\n\n1. Which part becomes the Identity?\n2. Which part becomes the Task List?\n3. Which part becomes the Output Rules?\n4. Which part becomes the Guard Rails?\n5. What Compliance Anchors would you add?\n\nThen answer: Would you build an Operations Documentation Agent for your department? What consistency or regulatory benefit would it provide over one-off procedure writing?',
      hints: [
        'What role did your operations procedure prompt specify? (Operations specialist, procedure writer) — that\'s the Identity',
        'What specific procedures did your prompt generate? (Wire processing, ACH, NSF handling) — that\'s the Task List',
        'What dual-control or authorization constraints did you include? Those become Guard Rails',
        'What BSA, Reg CC, or Reg E language must always appear in your operations procedures?',
      ],
    },
    compliance_bsa_aml: {
      scenario: 'Review your best Session 1 compliance prompt (BSA program overview, SAR narrative, or risk assessment). Map it to the 5 agent architecture sections:\n\n1. Which part becomes the Identity?\n2. Which part becomes the Task List?\n3. Which part becomes the Output Rules?\n4. Which part becomes the Guard Rails?\n5. What Compliance Anchors would you add?\n\nThen answer: Would you build a BSA Documentation Agent for your compliance team? What accuracy or consistency benefit would it provide — and what FinCEN or SAR confidentiality language must it always include?',
      hints: [
        'What role did your BSA prompt specify? (BSA officer, compliance analyst) — that\'s the Identity',
        'What specific compliance documents did your prompt generate? (SAR narratives, CTR summaries) — that\'s the Task List',
        'What SAR confidentiality or safe harbor constraints did you include? Those become Guard Rails',
        'What FinCEN, Bank Secrecy Act, or USA PATRIOT Act language must always appear in BSA documentation?',
      ],
    },
    risk_management: {
      scenario: 'Review your best Session 1 risk management prompt (risk heat map, event report, or risk appetite narrative). Map it to the 5 agent architecture sections:\n\n1. Which part becomes the Identity?\n2. Which part becomes the Task List?\n3. Which part becomes the Output Rules?\n4. Which part becomes the Guard Rails?\n5. What Compliance Anchors would you add?\n\nThen answer: Would you build an Enterprise Risk Reporting Agent? What consistency benefit would it provide for your quarterly risk committee — and what model risk or data validation language must it always include?',
      hints: [
        'What role did your risk management prompt specify? (ERM analyst, CRO) — that\'s the Identity',
        'What risk reporting deliverables did your prompt generate? (Risk heat map, event reports) — that\'s the Task List',
        'What model validation or independence constraints did you include? Those become Guard Rails',
        'What ERM framework or examiner-expected language must always appear in your risk committee reporting?',
      ],
    },
    it_information_security: {
      scenario: 'Review your best Session 1 IT or security prompt (incident report, security communication, or vendor risk summary). Map it to the 5 agent architecture sections:\n\n1. Which part becomes the Identity?\n2. Which part becomes the Task List?\n3. Which part becomes the Output Rules?\n4. Which part becomes the Guard Rails?\n5. What Compliance Anchors would you add?\n\nThen answer: Would you build a Security Communications Agent? What consistency benefit would it provide — and what GLBA or data classification language must it always include?',
      hints: [
        'What role did your security prompt specify? (CISO, security analyst, IT communicator) — that\'s the Identity',
        'What security tasks did your prompt address? (Incident reports, policy announcements) — that\'s the Task List',
        'What data classification or confidentiality constraints did you include? Those become Guard Rails',
        'What GLBA, FFIEC, or incident response language must always appear in your security documentation?',
      ],
    },
    human_resources: {
      scenario: 'Review your best Session 1 HR prompt (job description, policy update, or performance guide). Map it to the 5 agent architecture sections:\n\n1. Which part becomes the Identity?\n2. Which part becomes the Task List?\n3. Which part becomes the Output Rules?\n4. Which part becomes the Guard Rails?\n5. What Compliance Anchors would you add?\n\nThen answer: Would you build an HR Documentation Agent? What consistency benefit would it provide across managers and departments — and what EEO or labor law language must it always include?',
      hints: [
        'What role did your HR prompt specify? (HR business partner, talent acquisition specialist) — that\'s the Identity',
        'What HR documents did your prompt generate? (Job descriptions, policy updates, performance templates) — that\'s the Task List',
        'What EEO, ADA, or FLSA constraints did you include? Those become Guard Rails',
        'What EEO statement or labor law language must always appear in your HR documentation?',
      ],
    },
    marketing_business_development: {
      scenario: 'Review your best Session 1 marketing or business development prompt (marketing copy, community announcement, or prospect email). Map it to the 5 agent architecture sections:\n\n1. Which part becomes the Identity?\n2. Which part becomes the Task List?\n3. Which part becomes the Output Rules?\n4. Which part becomes the Guard Rails?\n5. What Compliance Anchors would you add?\n\nThen answer: Would you build a Compliant Marketing Copy Agent? What brand consistency or compliance benefit would it provide — and what UDAAP or Reg DD language must it always include?',
      hints: [
        'What role did your marketing prompt specify? (Marketing copywriter, compliance-aware content writer) — that\'s the Identity',
        'What marketing deliverables did your prompt generate? (Email copy, social posts, event announcements) — that\'s the Task List',
        'What UDAAP or fair lending constraints did you include? Those become Guard Rails',
        'What disclosure or advertising compliance language must always appear in your marketing content?',
      ],
    },
    wealth_management_trust: {
      scenario: 'Review your best Session 1 wealth management or trust prompt (client letter, fiduciary summary, or investment update). Map it to the 5 agent architecture sections:\n\n1. Which part becomes the Identity?\n2. Which part becomes the Task List?\n3. Which part becomes the Output Rules?\n4. Which part becomes the Guard Rails?\n5. What Compliance Anchors would you add?\n\nThen answer: Would you build a Trust Client Communications Agent? What fiduciary accuracy or consistency benefit would it provide — and what Reg 9 or fiduciary duty language must it always include?',
      hints: [
        'What role did your trust prompt specify? (Trust officer, portfolio manager, fiduciary advisor) — that\'s the Identity',
        'What trust deliverables did your prompt generate? (Client letters, meeting agendas, performance summaries) — that\'s the Task List',
        'What fiduciary duty or suitability constraints did you include? Those become Guard Rails',
        'What Reg 9, fiduciary standard, or suitability language must always appear in your trust client communications?',
      ],
    },
  },

  // ─── MODULE 2-5: Your Living Agent ────────────────────────────────────
  '2-5': {
    accounting_finance: {
      scenario: 'Your Finance Variance Commentary Agent is about to go live. Write your iteration plan:\n\n1. What will you watch for in the first week? Name 2-3 specific behaviors — e.g., does it consistently produce GAAP-accurate commentary, or does it fabricate figures that don\'t exist in the data?\n2. What guard rail do you expect to add first? Think about what happens when someone asks it to forecast figures or include projections without data.\n3. How will you measure effectiveness for variance commentary? Estimate time before AI, expected time with AI, and 1 quality indicator.\n4. Who else on your finance team could use this agent, and what would they customize?',
      hints: [
        'What is the most likely fabrication risk — invented budget figures or unsupported trend statements?',
        'What edge case will a user try first — asking for a full-year projection vs. a quarterly commentary?',
        'How many minutes does variance commentary take today?',
        'Who else on your team writes board-level financial narratives?',
      ],
    },
    credit_administration: {
      scenario: 'Your Annual Loan Review Agent is about to go live for the credit team. Write your iteration plan:\n\n1. What 2-3 specific behaviors will you monitor in the first week — e.g., does it consistently include DSCR analysis, or does it skip covenant compliance?\n2. What guard rail do you expect to add first — what happens if someone inputs a borrower with active litigation or special mention status?\n3. How will you measure effectiveness? Estimate time to draft a loan review before AI, expected time with AI, and 1 quality indicator.\n4. Who else in your credit team could use this agent, and what would they customize?',
      hints: [
        'What is the most likely accuracy failure — invented financial ratios or missing covenant language?',
        'What edge case will credit staff test first — a classified credit or a borrower flagged for BSA?',
        'How many hours does a typical annual review narrative take today?',
        'Who on your team writes the most loan reviews each quarter?',
      ],
    },
    executive_leadership: {
      scenario: 'Your Board Communication Agent is about to go live. Write your iteration plan:\n\n1. What 2-3 specific behaviors will you monitor in the first week — e.g., does it produce the right strategic tone, or does it generate operational detail that belongs in management reports?\n2. What guard rail do you expect to add first — what happens if someone asks it to draft forward-looking earnings guidance?\n3. How will you measure effectiveness? Estimate drafting time before AI, expected time with AI, and 1 quality indicator for board-level communications.\n4. Who else on your executive team could use this agent, and what would they customize for their function?',
      hints: [
        'What is the most likely tone failure — too operational, too informal, or too promotional?',
        'What edge case will users try first — asking the agent to draft a shareholder communication or a press release?',
        'How much time does your current board package take to draft?',
        'Who on your leadership team prepares the most board communications?',
      ],
    },
    commercial_lending: {
      scenario: 'Your Commercial Credit Memo Agent is about to go live for the lending team. Write your iteration plan:\n\n1. What 2-3 behaviors will you watch for in the first week — e.g., does it consistently apply your bank\'s risk rating criteria, or does it skip concentration limit analysis?\n2. What guard rail do you expect to add first — what happens when a loan officer inputs a highly leveraged borrower and asks the agent to "make it look good"?\n3. How will you measure effectiveness for credit memo drafting? Estimate time before and after AI, and 1 quality indicator.\n4. Who else on your lending team could use this agent — what customization would different loan types require?',
      hints: [
        'What is the most likely accuracy failure — incorrect ratio benchmarks or missing risk factors?',
        'What edge case will users try first — a complex CRE deal with multiple guarantors or a classified credit?',
        'How many hours does a typical credit presentation take today?',
        'Would retail lenders use the same agent, or would they need a separate configuration?',
      ],
    },
    retail_banking: {
      scenario: 'Your Customer Communications Agent is about to go live for branch staff. Write your iteration plan:\n\n1. What 2-3 specific behaviors will you monitor in the first week — e.g., does it produce compliant, UDAAP-safe language consistently, or does it occasionally suggest fee waivers or promotional language that needs compliance review?\n2. What guard rail do you expect to add first — what happens when a teller asks it to draft a response to a discrimination complaint?\n3. How will you measure effectiveness? Estimate time before and after AI for a typical service recovery communication, and 1 quality indicator.\n4. Who else at your branch or in operations could use this agent?',
      hints: [
        'What is the most likely UDAAP failure — overpromising a fee refund or using misleading product comparisons?',
        'What edge case will tellers test first — an upset customer or a Reg E dispute?',
        'How long does a typical service recovery response take today?',
        'Could your call center use the same agent with minor modifications?',
      ],
    },
    mortgage_consumer_lending: {
      scenario: 'Your Borrower Communications Agent is about to go live for the mortgage pipeline. Write your iteration plan:\n\n1. What 2-3 specific behaviors will you watch for in the first week — e.g., does it produce TRID-compliant language, or does it occasionally include promised closing timelines that could create liability?\n2. What guard rail do you expect to add first — what happens when a processor asks it to draft an explanation for why a loan is taking longer than promised?\n3. How will you measure effectiveness for borrower status communications? Estimate time before and after AI, and 1 quality indicator.\n4. Who else in the mortgage workflow could use this agent — what would underwriters or closers customize?',
      hints: [
        'What is the most likely TRID or ECOA compliance failure — promised timelines or misleading condition explanations?',
        'What edge case will processors test first — an angry borrower whose closing was delayed?',
        'How many borrower updates does your team send per week today?',
        'Would your closing team use the same agent, or need a separate version for pre-closing communications?',
      ],
    },
    treasury_cash_management: {
      scenario: 'Your ALCO Reporting Agent is about to go live for the treasury team. Write your iteration plan:\n\n1. What 2-3 specific behaviors will you monitor in the first week — e.g., does it accurately reflect policy thresholds, or does it generate rate projections beyond what your model supports?\n2. What guard rail do you expect to add first — what happens when someone asks it to write commentary on a rate scenario that exceeds your stress test parameters?\n3. How will you measure effectiveness for ALCO reporting? Estimate time before and after AI, and 1 quality indicator.\n4. Who else could use this agent — would your investment officer or CFO need a customized version?',
      hints: [
        'What is the most likely accuracy failure — fabricated rate projections or incorrect policy limit references?',
        'What edge case will ALCO staff test first — an extreme rate shock scenario?',
        'How many hours does ALCO packet preparation take today?',
        'Could your investment officer or IRR analyst use the same agent with modified output rules?',
      ],
    },
    operations: {
      scenario: 'Your Operations Documentation Agent is about to go live for the back-office team. Write your iteration plan:\n\n1. What 2-3 specific behaviors will you watch for in the first week — e.g., does it produce clear, dual-control compliant procedures, or does it occasionally omit authorization steps required by policy?\n2. What guard rail do you expect to add first — what happens when someone asks it to document a workaround that bypasses standard controls?\n3. How will you measure effectiveness for procedure writing? Estimate time before and after AI, and 1 quality indicator.\n4. Who else in operations could use this agent — what would wire operations vs. ACH operations teams customize?',
      hints: [
        'What is the most likely control gap failure — omitting authorization steps or missing regulatory references?',
        'What edge case will operations staff test first — an emergency procedure or a workaround for a system outage?',
        'How long does it take to write a new operations procedure today?',
        'Would your wire team vs. ACH team need different guard rails?',
      ],
    },
    compliance_bsa_aml: {
      scenario: 'Your BSA Documentation Agent is about to go live for the compliance team. Write your iteration plan:\n\n1. What 2-3 specific behaviors will you monitor in the first week — e.g., does it consistently follow FinCEN SAR narrative format, or does it occasionally include customer-identifying information that violates SAR confidentiality?\n2. What guard rail do you expect to add first — what happens when a BSA analyst asks it to draft a narrative for a case still under investigation?\n3. How will you measure effectiveness for SAR narrative drafting? Estimate time before and after AI, and 1 quality indicator.\n4. Who else on your compliance team could use this agent — what would CTR documentation vs. CRA documentation teams customize?',
      hints: [
        'What is the most likely SAR confidentiality failure — including customer names or account numbers in the output?',
        'What edge case will analysts test first — a complex multi-subject SAR or a SAR continuation?',
        'How long does a typical SAR narrative take to draft today?',
        'Could your CRA team use the same agent with modified compliance anchors?',
      ],
    },
    risk_management: {
      scenario: 'Your Enterprise Risk Reporting Agent is about to go live for the risk committee. Write your iteration plan:\n\n1. What 2-3 specific behaviors will you monitor in the first week — e.g., does it accurately reflect your current risk register ratings, or does it generate risk descriptions that don\'t match your framework?\n2. What guard rail do you expect to add first — what happens when someone asks it to draft a risk update for an event still being investigated and not yet in the risk register?\n3. How will you measure effectiveness for quarterly risk reporting? Estimate time before and after AI, and 1 quality indicator.\n4. Who else could use this agent — what would internal audit vs. the board risk committee customize?',
      hints: [
        'What is the most likely framework mismatch — risk ratings that don\'t align with your methodology?',
        'What edge case will risk staff test first — a new emerging risk with limited data?',
        'How long does quarterly risk committee prep take today?',
        'Would your internal audit team use the same agent, or need a separate one for audit finding narratives?',
      ],
    },
    it_information_security: {
      scenario: 'Your Security Communications Agent is about to go live for the CISO team. Write your iteration plan:\n\n1. What 2-3 specific behaviors will you watch for in the first week — e.g., does it consistently produce non-technical, accessible security awareness content, or does it occasionally generate overly technical language that staff won\'t understand?\n2. What guard rail do you expect to add first — what happens when someone asks it to draft an announcement about a live security incident before the response is complete?\n3. How will you measure effectiveness for security communications? Estimate time before and after AI, and 1 quality indicator.\n4. Who else could use this agent — what would the security awareness team vs. the incident response team customize?',
      hints: [
        'What is the most likely tone failure — too technical for general staff or too casual for a serious incident?',
        'What edge case will users test first — drafting a communication about an active breach?',
        'How long does it take to prepare a security awareness communication today?',
        'Could your IT helpdesk use the same agent with modified output rules for support ticket responses?',
      ],
    },
    human_resources: {
      scenario: 'Your HR Documentation Agent is about to go live for the HR and talent team. Write your iteration plan:\n\n1. What 2-3 specific behaviors will you watch for in the first week — e.g., does it consistently produce EEO-compliant language, or does it occasionally include qualification requirements that could be challenged as discriminatory?\n2. What guard rail do you expect to add first — what happens when a hiring manager asks it to write a job description with a specific age or physical requirement?\n3. How will you measure effectiveness for HR documentation? Estimate time before and after AI, and 1 quality indicator.\n4. Who else could use this agent — what would talent acquisition vs. benefits communication teams customize?',
      hints: [
        'What is the most likely EEO compliance failure — age-related language, physical requirement framing, or non-job-relevant educational requirements?',
        'What edge case will managers test first — a very specific or unusual role requirement?',
        'How long does a typical job description take to write today?',
        'Could your benefits team use the same agent with modified output rules for benefits communications?',
      ],
    },
    marketing_business_development: {
      scenario: 'Your Compliant Marketing Copy Agent is about to go live for the marketing and CRA team. Write your iteration plan:\n\n1. What 2-3 specific behaviors will you monitor in the first week — e.g., does it consistently include required UDAAP disclaimers, or does it occasionally generate promotional language that makes unreviewed claims?\n2. What guard rail do you expect to add first — what happens when a business development officer asks it to write a targeted campaign that mentions specific demographic communities in a way that could raise fair lending concerns?\n3. How will you measure effectiveness for marketing copy production? Estimate time before and after AI, and 1 quality indicator.\n4. Who else could use this agent — what would CRA vs. digital marketing teams customize?',
      hints: [
        'What is the most likely UDAAP failure — superlative claims ("lowest rate," "best bank") or misleading product comparisons?',
        'What edge case will marketers test first — a fair lending-sensitive targeted campaign?',
        'How long does it take to produce a compliant marketing email today?',
        'Could your CRA officer use the same agent with modified anchors for community development communications?',
      ],
    },
    wealth_management_trust: {
      scenario: 'Your Trust Client Communications Agent is about to go live for the trust department. Write your iteration plan:\n\n1. What 2-3 specific behaviors will you watch for in the first week — e.g., does it consistently apply fiduciary-appropriate language, or does it occasionally generate performance projections that violate Reg 9 standards?\n2. What guard rail do you expect to add first — what happens when a trust officer asks it to draft a client letter promising specific returns or investment outcomes?\n3. How will you measure effectiveness for trust communications? Estimate time before and after AI, and 1 quality indicator.\n4. Who else in your trust department could use this agent — what would the portfolio management team vs. the client service team customize?',
      hints: [
        'What is the most likely fiduciary failure — forward-looking return promises or suitability documentation gaps?',
        'What edge case will trust officers test first — an upset beneficiary or a discretionary distribution request?',
        'How long does a typical trust client letter take to write today?',
        'Could your wealth advisor team use the same agent with modified compliance anchors?',
      ],
    },
  },

  // ─── MODULE 2-6: Build Your Agent ─────────────────────────────────────
  '2-6': {
    accounting_finance: {
      scenario: 'Build your Finance Variance Commentary Agent.\n\nPart 1 — Assemble: Write a complete system prompt (150-400 words) that includes: Identity (a financial analyst who serves your bank\'s finance team and produces board-level commentary), Task List (variance analysis commentary, budget vs. actual tables, MD&A drafting), Output Rules (formal, concise, GAAP-compliant language), Guard Rails (refuses to fabricate figures, refuses to project forward without data, refuses to include unreleased financial data), Compliance Anchors (e.g., "All figures are draft and pending CFO review before distribution").\n\nPart 2 — Test: Describe 3 test messages: 1) Standard task (generate Q3 NIM variance commentary), 2) Edge case (draft commentary for a line item with no variance explanation in the data), 3) Out-of-scope request (produce a full earnings forecast for next year).\n\nPart 3 — Living Plan: First-week monitoring priorities, first guard rail to add, and how you\'ll know it\'s working.',
      hints: [
        'Is your Identity section specific about who the agent serves and the output\'s intended audience?',
        'Does your Task List cover the 3-4 most common finance commentary tasks?',
        'Is your Guard Rail explicit about fabricating figures, not just "be accurate"?',
        'What compliance anchor ensures your CFO\'s review is always flagged?',
      ],
    },
    credit_administration: {
      scenario: 'Build your Annual Loan Review Agent.\n\nPart 1 — Assemble: Write a complete system prompt (150-400 words) that includes: Identity (a loan review analyst who serves your credit administration team), Task List (annual loan review narratives, financial ratio summaries, covenant compliance checks, risk rating rationale), Output Rules (structured credit memo format, objective credit language, tables for ratio data), Guard Rails (refuses to include PII, refuses to assign risk ratings without full data, refuses to characterize a loan as pass without reviewing all covenants), Compliance Anchors (e.g., "This analysis is draft and does not constitute a final credit determination").\n\nPart 2 — Test: 3 test messages: 1) Standard (DSCR trend summary for a 3-year commercial loan), 2) Edge case (borrower has one year of financial data missing), 3) Out-of-scope (recommendation to approve or deny the loan renewal).\n\nPart 3 — Living Plan: First-week monitoring, first guard rail to add, and effectiveness metric.',
      hints: [
        'Is your Identity specific about credit analysis (not general banking)?',
        'Does your Task List cover the recurring deliverables in your loan review cycle?',
        'Is your Guard Rail clear about what risk rating decisions require human judgment?',
        'What compliance anchor ensures fair lending is always considered?',
      ],
    },
    executive_leadership: {
      scenario: 'Build your Board Communication Agent.\n\nPart 1 — Assemble: Write a complete system prompt (150-400 words) that includes: Identity (a strategic communications advisor who serves your executive team), Task List (executive summaries, board narratives, strategic update memos, risk and opportunity summaries), Output Rules (concise, executive-level tone, structured headers, one-page limit), Guard Rails (refuses to draft forward-looking earnings guidance, refuses to include material non-public information, refuses to produce shareholder communications without legal review flag), Compliance Anchors (e.g., "This document is a draft for internal review only. All forward-looking statements require legal and compliance review.").\n\nPart 2 — Test: 3 test messages: 1) Standard (one-page Q3 performance summary for the board), 2) Edge case (board is asking for commentary on a pending M&A discussion), 3) Out-of-scope (draft a press release for a strategic announcement).\n\nPart 3 — Living Plan: First-week monitoring, first guard rail to add, and effectiveness metric.',
      hints: [
        'Is your Identity specific about board-level communications (not general communications)?',
        'Does your Task List cover the 3-4 deliverables in your typical board package?',
        'Is your Guard Rail explicit about material non-public information?',
        'What compliance anchor ensures legal review is always flagged?',
      ],
    },
    commercial_lending: {
      scenario: 'Build your Commercial Credit Memo Agent.\n\nPart 1 — Assemble: Write a complete system prompt (150-400 words) that includes: Identity (a credit analyst who serves your commercial lending team), Task List (business overview narratives, financial analysis sections, risk factor summaries, proposed loan structure descriptions), Output Rules (structured credit memo format with sections, objective analytical language, tables for financial data), Guard Rails (refuses to recommend approval or denial, refuses to assign risk ratings without a complete financial spread, refuses to include borrower PII), Compliance Anchors (e.g., "This credit memo is a draft. Final credit determinations require credit officer sign-off and compliance with fair lending standards.").\n\nPart 2 — Test: 3 test messages: 1) Standard (business overview narrative for a $4M C&I borrower), 2) Edge case (borrower with 40% year-over-year revenue decline), 3) Out-of-scope (recommendation to approve the loan at the proposed rate).\n\nPart 3 — Living Plan: First-week monitoring, first guard rail to add, and effectiveness metric.',
      hints: [
        'Is your Identity specific about commercial lending (not retail or mortgage)?',
        'Does your Task List cover the sections in your bank\'s standard credit memo?',
        'Is your Guard Rail explicit about fair lending considerations?',
        'What compliance anchor ensures credit policy compliance is always referenced?',
      ],
    },
    retail_banking: {
      scenario: 'Build your Customer Communications Agent.\n\nPart 1 — Assemble: Write a complete system prompt (150-400 words) that includes: Identity (a customer communications specialist who serves your branch team), Task List (service recovery letters, account inquiry responses, product explanation emails, cross-sell conversation guides), Output Rules (warm but professional tone, plain language at 8th-grade reading level, structured format for call scripts vs. letters), Guard Rails (refuses to promise fee waivers without approval, refuses to draft responses to discrimination complaints, refuses to include specific rate quotes without compliance review), Compliance Anchors (e.g., "All customer-facing communications must be reviewed by branch management. UDAAP and Reg E requirements apply.").\n\nPart 2 — Test: 3 test messages: 1) Standard (service recovery email for a mobile deposit hold complaint), 2) Edge case (customer threatening to file a CFPB complaint about overdraft fees), 3) Out-of-scope (draft a response to a discrimination complaint).\n\nPart 3 — Living Plan: First-week monitoring, first guard rail to add, and effectiveness metric.',
      hints: [
        'Is your Identity specific to retail/branch banking (not back-office operations)?',
        'Does your Task List cover the 3-4 most frequent customer communication types?',
        'Is your Guard Rail explicit about UDAAP risks?',
        'What compliance anchor flags management review for all customer-facing content?',
      ],
    },
    mortgage_consumer_lending: {
      scenario: 'Build your Borrower Communications Agent.\n\nPart 1 — Assemble: Write a complete system prompt (150-400 words) that includes: Identity (a mortgage communications assistant who serves your lending team), Task List (conditional approval letters, status update emails, closing checklist summaries, condition explanation guides), Output Rules (clear, plain-language borrower communication format, no legal jargon, structured steps for process guidance), Guard Rails (refuses to promise closing dates, refuses to quote final loan terms before underwriting is complete, refuses to draft adverse action explanations without compliance review), Compliance Anchors (e.g., "This communication is a draft. All borrower-facing content must be reviewed for TRID, ECOA, and RESPA compliance.").\n\nPart 2 — Test: 3 test messages: 1) Standard (conditional approval status update for a purchase mortgage), 2) Edge case (borrower asking why underwriting is taking longer than promised), 3) Out-of-scope (final loan approval letter with specific rate and payment amounts).\n\nPart 3 — Living Plan: First-week monitoring, first guard rail to add, and effectiveness metric.',
      hints: [
        'Is your Identity specific to mortgage pipeline communications (not general banking)?',
        'Does your Task List cover the borrower touchpoints in your pipeline stages?',
        'Is your Guard Rail explicit about TRID timeline promises?',
        'What compliance anchor ensures all communications get TRID and ECOA review?',
      ],
    },
    treasury_cash_management: {
      scenario: 'Build your ALCO Reporting Agent.\n\nPart 1 — Assemble: Write a complete system prompt (150-400 words) that includes: Identity (an ALM analyst who serves your ALCO committee), Task List (liquidity summaries, rate sensitivity narratives, funding concentration reports, ALCO memo first drafts), Output Rules (structured ALCO memo format with executive summary, data tables, and narrative sections), Guard Rails (refuses to project rate scenarios beyond stress test parameters, refuses to include unvalidated figures, refuses to characterize the bank\'s rate position as "well-positioned" without data support), Compliance Anchors (e.g., "All figures are preliminary and subject to final model validation. This report is for internal ALCO use only.").\n\nPart 2 — Test: 3 test messages: 1) Standard (liquidity summary for the ALCO packet), 2) Edge case (ALCO wants commentary on a +400 bp rate shock scenario not in the current model), 3) Out-of-scope (recommendation on whether to extend bond portfolio duration).\n\nPart 3 — Living Plan: First-week monitoring, first guard rail to add, and effectiveness metric.',
      hints: [
        'Is your Identity specific to ALCO reporting (not general finance)?',
        'Does your Task List cover the recurring deliverables in your ALCO packet?',
        'Is your Guard Rail explicit about fabricated rate projections?',
        'What compliance anchor ensures ALCO-only distribution is flagged?',
      ],
    },
    operations: {
      scenario: 'Build your Operations Documentation Agent.\n\nPart 1 — Assemble: Write a complete system prompt (150-400 words) that includes: Identity (an operations documentation specialist who serves your back-office team), Task List (wire processing guides, ACH origination checklists, NSF and return item procedures, reconciliation documentation), Output Rules (numbered step-by-step format, explicit authorization and dual-control callouts, regulatory references in each procedure), Guard Rails (refuses to document workarounds that bypass standard controls, refuses to omit dual-control or authorization steps, refuses to produce procedures without regulatory reference), Compliance Anchors (e.g., "All procedures must be reviewed and approved by Operations management. BSA, Reg CC, and Reg E requirements apply where indicated.").\n\nPart 2 — Test: 3 test messages: 1) Standard (wire processing checklist for new staff), 2) Edge case (user asks for a temporary workaround during a core system outage), 3) Out-of-scope (procedure that bypasses dual-control for small-dollar wires).\n\nPart 3 — Living Plan: First-week monitoring, first guard rail to add, and effectiveness metric.',
      hints: [
        'Is your Identity specific to operations (not general banking)?',
        'Does your Task List cover the 3-4 procedures your team updates most often?',
        'Is your Guard Rail explicit about control bypass risks?',
        'What compliance anchor ensures management review before any procedure is distributed?',
      ],
    },
    compliance_bsa_aml: {
      scenario: 'Build your BSA Documentation Agent.\n\nPart 1 — Assemble: Write a complete system prompt (150-400 words) that includes: Identity (a BSA documentation assistant who serves your compliance team), Task List (SAR narrative drafting, CTR documentation summaries, BSA program overview sections, risk assessment narrative fragments), Output Rules (FinCEN SAR narrative format for SAR content, clear regulatory language, structured sections for program documentation), Guard Rails (refuses to include SAR subject names, account numbers, or customer-identifying information, refuses to draft final SAR filings without BSA officer review, refuses to characterize activity as "not suspicious" without investigation completion), Compliance Anchors (e.g., "SAR narratives are confidential under 31 U.S.C. \u00A75318(g). Final SAR filings require BSA officer approval.").\n\nPart 2 — Test: 3 test messages: 1) Standard (SAR narrative structure for a structured cash transaction pattern), 2) Edge case (analyst asks to include the customer\'s name and account number in the draft), 3) Out-of-scope (draft a response to the customer asking why their account is under review).\n\nPart 3 — Living Plan: First-week monitoring, first guard rail to add, and effectiveness metric.',
      hints: [
        'Is your Identity specific to BSA/AML documentation (not general compliance)?',
        'Does your Task List cover your team\'s most frequent BSA documentation types?',
        'Is your Guard Rail specific about SAR confidentiality (not just "be careful with data")?',
        'What compliance anchor includes the FinCEN confidentiality statute citation?',
      ],
    },
    risk_management: {
      scenario: 'Build your Enterprise Risk Reporting Agent.\n\nPart 1 — Assemble: Write a complete system prompt (150-400 words) that includes: Identity (an enterprise risk analyst who serves your risk committee), Task List (risk heat map narratives, risk event reports, risk appetite statement updates, mitigation status summaries), Output Rules (structured risk reporting format with risk category, likelihood, impact, direction of trend, and mitigation status), Guard Rails (refuses to assign final risk ratings without current risk register data, refuses to characterize a risk as mitigated without confirmed control effectiveness, refuses to produce board-level risk reporting from unverified incident data), Compliance Anchors (e.g., "Risk ratings are preliminary and must be validated against the current risk register. All risk reporting is subject to ERM framework standards.").\n\nPart 2 — Test: 3 test messages: 1) Standard (risk heat map narrative for the top 5 risks this quarter), 2) Edge case (a new risk emerged yesterday with no risk register entry yet), 3) Out-of-scope (risk rating for a credit exposure without financial data).\n\nPart 3 — Living Plan: First-week monitoring, first guard rail to add, and effectiveness metric.',
      hints: [
        'Is your Identity specific to enterprise risk (not general banking)?',
        'Does your Task List cover the deliverables your risk committee receives each quarter?',
        'Is your Guard Rail explicit about unverified data?',
        'What compliance anchor ensures risk register alignment before distribution?',
      ],
    },
    it_information_security: {
      scenario: 'Build your Security Communications Agent.\n\nPart 1 — Assemble: Write a complete system prompt (150-400 words) that includes: Identity (a security communications specialist who serves your CISO), Task List (security awareness announcements, policy change communications, incident response notifications for staff, phishing simulation debrief materials), Output Rules (plain language for general staff, non-technical summaries for executive communications, structured format with action steps highlighted), Guard Rails (refuses to draft communications about live incidents before the response is complete, refuses to disclose specific vulnerability details to general staff, refuses to draft content that could be perceived as blaming individual users), Compliance Anchors (e.g., "All security communications must be reviewed by CISO and Legal. GLBA Safeguards Rule and FFIEC security guidance apply.").\n\nPart 2 — Test: 3 test messages: 1) Standard (password policy change announcement for all staff), 2) Edge case (CISO asks for a staff notification about an ongoing phishing attack before the response team has contained it), 3) Out-of-scope (technical details about the vulnerability for an all-staff email).\n\nPart 3 — Living Plan: First-week monitoring, first guard rail to add, and effectiveness metric.',
      hints: [
        'Is your Identity specific to IT/security (not general communications)?',
        'Does your Task List cover the recurring security communications your team produces?',
        'Is your Guard Rail specific about live incident disclosure?',
        'What compliance anchor includes GLBA Safeguards and FFIEC references?',
      ],
    },
    human_resources: {
      scenario: 'Build your HR Documentation Agent.\n\nPart 1 — Assemble: Write a complete system prompt (150-400 words) that includes: Identity (an HR documentation specialist who serves your people and talent team), Task List (job descriptions, policy updates, performance review templates, onboarding guides, benefits communication summaries), Output Rules (clear, accessible language for employees, structured format for policies and job descriptions, EEO statement included in all job postings), Guard Rails (refuses to include age, gender, or other protected characteristics as requirements, refuses to produce performance documentation that evaluates personality rather than job performance, refuses to draft communications promising specific compensation without HR director approval), Compliance Anchors (e.g., "All HR documentation must be reviewed by HR leadership and Legal. EEO, ADA, and FLSA requirements apply.").\n\nPart 2 — Test: 3 test messages: 1) Standard (job description for a BSA Compliance Analyst), 2) Edge case (hiring manager requests candidates must be "energetic" and "recent graduates"), 3) Out-of-scope (performance improvement plan that characterizes the employee\'s attitude as the core issue).\n\nPart 3 — Living Plan: First-week monitoring, first guard rail to add, and effectiveness metric.',
      hints: [
        'Is your Identity specific to HR (not general business writing)?',
        'Does your Task List cover the 3-4 HR documents your team produces most frequently?',
        'Is your Guard Rail specific about protected class language (not just "be fair")?',
        'What compliance anchor includes the EEO statement and legal review requirement?',
      ],
    },
    marketing_business_development: {
      scenario: 'Build your Compliant Marketing Copy Agent.\n\nPart 1 — Assemble: Write a complete system prompt (150-400 words) that includes: Identity (a bank marketing copywriter who serves your marketing team), Task List (email campaigns, social media posts, product launch announcements, CRA community event communications, prospect outreach emails), Output Rules (brand-appropriate tone, concise sentences, required disclosures included in all product advertising), Guard Rails (refuses to make "lowest rate" or "best bank" superlative claims without compliance approval, refuses to target demographic groups in ways that could raise fair lending concerns, refuses to draft rate offer communications without Reg Z or Reg DD compliance review), Compliance Anchors (e.g., "All marketing content must be reviewed by Compliance. UDAAP, Reg DD, and Reg Z advertising standards apply.").\n\nPart 2 — Test: 3 test messages: 1) Standard (HELOC product launch email for current mortgage customers), 2) Edge case (business development officer wants to market to minority-owned businesses with "exclusive" language), 3) Out-of-scope (marketing copy promising the "lowest rates in the market" without compliance clearance).\n\nPart 3 — Living Plan: First-week monitoring, first guard rail to add, and effectiveness metric.',
      hints: [
        'Is your Identity specific to bank marketing compliance (not general copywriting)?',
        'Does your Task List cover the content types your marketing team produces most frequently?',
        'Is your Guard Rail specific about UDAAP superlatives and fair lending targeting risks?',
        'What compliance anchor includes the UDAAP and Reg DD review requirement?',
      ],
    },
    wealth_management_trust: {
      scenario: 'Build your Trust Client Communications Agent.\n\nPart 1 — Assemble: Write a complete system prompt (150-400 words) that includes: Identity (a trust communications assistant who serves your trust department), Task List (trust account review letters, fiduciary meeting agendas, investment commentary summaries, distribution notification letters, IPS update summaries), Output Rules (professional, client-appropriate language, structured letter format, no investment jargon without plain-language explanation), Guard Rails (refuses to project specific investment returns, refuses to promise investment outcomes, refuses to characterize past performance as predictive of future results, refuses to draft discretionary distribution approvals without trust officer sign-off), Compliance Anchors (e.g., "All trust communications must be reviewed by Trust Officer and Compliance. Fiduciary duties under Reg 9 apply. Past performance is not indicative of future results.").\n\nPart 2 — Test: 3 test messages: 1) Standard (trust account annual review letter covering performance and distributions), 2) Edge case (beneficiary is upset about underperformance and asks agent to draft a response promising better results), 3) Out-of-scope (specific asset allocation recommendation for the client\'s trust portfolio).\n\nPart 3 — Living Plan: First-week monitoring, first guard rail to add, and effectiveness metric.',
      hints: [
        'Is your Identity specific to trust and fiduciary communications (not general banking)?',
        'Does your Task List cover the recurring client touchpoints in your trust management cycle?',
        'Is your Guard Rail explicit about performance projection and fiduciary duty?',
        'What compliance anchor includes the Reg 9 fiduciary standard and past performance disclaimer?',
      ],
    },
  },
};

/**
 * Helper: Get the role scenario for a module + LOB, or null if none exists.
 */
export function getRoleScenario(moduleId: string, lineOfBusiness: string): RoleScenario | null {
  return ROLE_SCENARIO_BANKS[moduleId]?.[lineOfBusiness] ?? null;
}
