-- Create table for bank-specific policies
CREATE TABLE public.bank_policies (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  policy_type text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  summary text,
  icon text DEFAULT 'BookOpen',
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bank_policies ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read active policies
CREATE POLICY "Authenticated users can view active policies"
ON public.bank_policies
FOR SELECT
TO authenticated
USING (is_active = true);

-- Create trigger for updated_at
CREATE TRIGGER update_bank_policies_updated_at
BEFORE UPDATE ON public.bank_policies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default policies based on industry standards
INSERT INTO public.bank_policies (policy_type, title, content, summary, icon, display_order) VALUES
('ai_usage', 'AI Usage Policy', '# AI Usage Policy for Financial Institutions

## Purpose
This policy establishes guidelines for the responsible use of artificial intelligence (AI) tools and technologies within our organization, ensuring compliance with regulatory requirements and protection of customer data.

## Scope
This policy applies to all employees, contractors, and third parties who use AI tools in connection with their work for the organization.

## General Principles

### 1. Human Oversight
- All AI-generated outputs must be reviewed by qualified personnel before use
- Critical decisions affecting customers must involve human judgment
- Employees remain accountable for work products, regardless of AI assistance

### 2. Approved AI Tools
- Only AI tools approved by IT Security may be used for work purposes
- Personal AI accounts should not be used for work-related tasks
- New AI tools must undergo security review before deployment

### 3. Data Protection
- Never input customer PII (personally identifiable information) into external AI tools
- Avoid sharing confidential business information with AI systems
- Be aware that AI conversations may be logged and reviewed

## Prohibited Uses
- Using AI to make automated lending or credit decisions without human review
- Inputting customer Social Security numbers, account numbers, or passwords
- Using AI to generate customer communications without review
- Sharing proprietary models, algorithms, or competitive information

## Compliance Requirements
- All AI usage must comply with applicable banking regulations
- Document AI-assisted processes for audit purposes
- Report any AI-related incidents to the compliance team

## Training Requirements
- All employees must complete AI awareness training annually
- Specialized training required for advanced AI tool users
- Managers must understand AI capabilities and limitations', 
'Guidelines for responsible AI use including approved tools, data protection, and compliance requirements.',
'BookOpen', 1),

('data_security', 'Data Security Guidelines', '# Data Security Guidelines for AI Usage

## Classification of Data

### Highly Confidential (Never Use with External AI)
- Customer Social Security Numbers
- Account numbers and passwords
- Credit card information
- Internal audit reports
- Board meeting minutes
- Merger and acquisition information

### Confidential (Use Only with Approved Internal AI)
- Customer names and contact information
- Transaction histories
- Internal financial reports
- Employee records
- Proprietary processes

### Internal Use (May Use with Approved AI with Caution)
- General business processes
- Non-sensitive communications
- Training materials
- Public-facing content drafts

### Public (Acceptable for AI Use)
- Published reports and statements
- Marketing materials
- General industry information
- Educational content

## AI-Specific Security Requirements

### Before Using AI Tools
1. Verify the tool is on the approved list
2. Confirm data classification allows AI processing
3. Remove or anonymize sensitive data when possible
4. Use secure network connections

### During AI Interactions
1. Monitor for unintended data exposure
2. Avoid iterative queries that could reconstruct sensitive data
3. Be cautious of AI "hallucinations" presenting false data
4. Log significant AI interactions for audit purposes

### After AI Use
1. Review outputs for inadvertent sensitive data
2. Properly store or dispose of AI-generated content
3. Report any security concerns immediately
4. Document AI usage per compliance requirements

## Incident Reporting
Contact the Information Security team immediately if:
- Sensitive data was inadvertently shared with AI
- AI output contains unexpected customer information
- You suspect AI tool compromise or misuse
- Third-party AI vendor reports a breach',
'Data classification levels and security requirements when using AI tools.',
'Shield', 2),

('best_practices', 'AI Best Practices', '# Best Practices for AI in Banking

## Effective Prompting

### Structure Your Requests
1. **Be Specific**: Clearly state what you need
2. **Provide Context**: Include relevant background information
3. **Set Constraints**: Specify format, length, or tone requirements
4. **Request Verification**: Ask AI to explain its reasoning

### Example: Good vs. Poor Prompts

**Poor**: "Write an email about a loan"

**Good**: "Write a professional email to a business customer informing them their $250,000 commercial loan application has been approved. Include next steps for documentation and a friendly closing. Keep it under 200 words."

## Quality Assurance

### Always Verify
- Check calculations and numerical data independently
- Verify regulatory citations and compliance statements
- Confirm customer information accuracy
- Review for appropriate tone and professionalism

### Document AI Assistance
- Note when AI assisted with customer communications
- Maintain records for audit purposes
- Track AI usage patterns for process improvement

## Efficiency Tips

### Task Batching
- Prepare multiple related requests together
- Use consistent formatting for similar tasks
- Build template prompts for recurring work

### Iterative Refinement
- Start with a basic request, then refine
- Ask follow-up questions for clarification
- Request alternative approaches when needed

## Common Use Cases

### Customer Communications
- Draft response templates
- Summarize complex information
- Translate financial concepts for customers

### Internal Documentation
- Meeting summaries and action items
- Process documentation
- Training material development

### Analysis Support
- Research summaries
- Trend identification
- Report generation frameworks

## What AI Cannot Do
- Make final credit or lending decisions
- Replace professional judgment
- Guarantee regulatory compliance
- Provide legal or financial advice',
'Tips for effective AI prompting, quality assurance, and common use cases in banking.',
'Lightbulb', 3);