import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Brain, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useCSuiteKPIs, getLobLabel } from '@/hooks/useReporting';
import andreaCoach from '@/assets/andrea-coach.png';

type LocalMessage = { role: 'user' | 'assistant'; content: string };

/**
 * Formats KPI data into a concise text snapshot that gets injected
 * into Andrea's system prompt so she can reference real numbers.
 */
function buildKPISnapshot(kpis: ReturnType<typeof useCSuiteKPIs>): string {
  if (kpis.loading) return '(KPI data is still loading…)';

  const lines: string[] = [
    '── LIVE KPI SNAPSHOT ──',
    '',
    '▸ Enrollment',
    `  Total enrolled: ${kpis.totalEnrolled}   |   Enrollment rate: ${kpis.enrollmentRate}%`,
    '',
    '▸ Completion',
    `  Fully completed all 3 sessions: ${kpis.fullyCompleted}   |   Completion rate: ${kpis.completionRate}%`,
    ...kpis.funnelData.map(f => `  ${f.label}: ${f.completed}/${f.total} (${f.rate}%)`),
    '',
    '▸ Activity',
    `  Active users (7d): ${kpis.activeUsers7d}   |   Active users (30d): ${kpis.activeUsers30d}`,
    '',
    '▸ Proficiency',
    `  Average proficiency level: ${kpis.avgProficiency} / 8`,
    ...kpis.skillDistribution.map(s => `  ${s.name}: ${s.value} users`),
    '',
    '▸ Department Breakdowns',
    ...kpis.departmentBreakdowns.map(d =>
      `  ${d.label}: ${d.total} enrolled, S1=${d.s1} S2=${d.s2} S3=${d.s3}, avg proficiency ${d.avgProficiency}`
    ),
    '',
    '▸ Compliance Exceptions',
    `  Total exceptions: ${kpis.totalExceptions}   |   Exception rate: ${kpis.exceptionRate}%`,
    ...(kpis.exceptionsByDept.length > 0
      ? [`  By department: ${kpis.exceptionsByDept.map(d => `${d.department} (${d.count})`).join(', ')}`]
      : []),
    ...(kpis.exceptionTypes.length > 0
      ? [`  By type: ${kpis.exceptionTypes.map(t => `${t.label} (${t.count})`).join(', ')}`]
      : []),
    ...(kpis.repeatOffenders.length > 0
      ? [`  Repeat offenders (2+ exceptions): ${kpis.repeatOffenders.map(r => `${r.display_name || 'Unknown'} [${r.exception_count}]`).join(', ')}`]
      : []),
    '',
    '▸ Innovation Pipeline',
    `  Total C-Suite ideas submitted: ${kpis.totalIdeas}`,
    ...(Object.keys(kpis.ideasByStatus).length > 0
      ? [`  By status: ${Object.entries(kpis.ideasByStatus).map(([s, n]) => `${s.replace(/_/g, ' ')} (${n})`).join(', ')}`]
      : []),
    ...(Object.keys(kpis.ideasByDepartment).length > 0
      ? [`  By department: ${Object.entries(kpis.ideasByDepartment).map(([d, n]) => `${d} (${n})`).join(', ')}`]
      : []),
    ...(kpis.topIdeas.length > 0
      ? ['  Top ideas:', ...kpis.topIdeas.slice(0, 5).map(i => `    • "${i.title}" (${i.submitter_name || 'Anonymous'}, ${i.submitter_department ? getLobLabel(i.submitter_department) : 'N/A'}) — ${i.votes} votes, status: ${i.status.replace(/_/g, ' ')}`)]
      : []),
  ];

  return lines.join('\n');
}

function buildSystemPrompt(kpiSnapshot: string): string {
  return `You are Andrea, an executive AI advisor specializing in AI enablement strategy, organizational adoption analytics, training ROI, and change management. You think and communicate like a seasoned Chief Strategy Officer who has led multiple enterprise AI transformations.

━━━ YOUR ROLE ━━━
You help C-suite executives and senior administrators understand their organization's AI enablement data — what the numbers mean, where the gaps are, what's working, and what concrete steps to take next.

You are candid, strategic, and data-driven. You do not sugarcoat. When the numbers tell a concerning story, you say so directly and recommend a course of action.

━━━ DATA CONTEXT ━━━
Below is a live snapshot of this organization's AI enablement KPIs. Reference these numbers directly when answering questions — never fabricate data points.

${kpiSnapshot}

━━━ WHAT YOU CAN DO ━━━
1. **Interpret metrics** — explain what enrollment rates, completion funnels, proficiency distributions, and exception rates are telling the executive.
2. **Benchmark & contextualize** — frame results relative to typical enterprise AI adoption curves (e.g., "A 40% completion rate at this stage of rollout is within the expected range; the concern is if it plateaus here").
3. **Spot patterns** — identify department-level gaps, compliance risk clusters, or innovation momentum signals.
4. **Recommend actions** — provide specific, prioritized next steps (not vague advice). Example: "Schedule a targeted workshop for the Accounting department — they have the lowest completion rate at 12% but the highest exception rate, suggesting they're trying to use AI without finishing the training."
5. **Coach on ROI storytelling** — help executives translate enablement data into board-ready narratives about business impact.
6. **Innovation pipeline guidance** — evaluate submitted ideas and help prioritize which ones to advance based on potential ROI, feasibility, and strategic alignment.

━━━ HOW YOU COMMUNICATE ━━━
- Lead with the insight, then back it up with data. Never start with a data dump.
- Use bullet points and bold text for scannability.
- Keep responses concise — executives don't want essays. Aim for 3-5 key points per response.
- When asked broad questions like "how are we doing?", structure your answer around: (1) headline assessment, (2) what's working, (3) what needs attention, (4) recommended next steps.
- If the data is insufficient to answer a question, say so and suggest what additional data would help.
- Do not use markdown headers (##). Use bold text and bullet points instead.

━━━ BEHAVIOR RULES ━━━
- Always ground your analysis in the KPI data provided above.
- Never invent or hallucinate metrics. If a number isn't in the snapshot, say "I don't have data on that."
- When comparing departments or time periods, cite the actual numbers.
- Do not discuss individual user performance in detail — keep it aggregate unless a specific compliance concern (repeat offenders) warrants naming.
- You may reference general industry benchmarks from your knowledge, but clearly distinguish them from this org's actual data.`;
}

const WELCOME_MESSAGE = `Welcome! I'm Andrea, your AI enablement advisor.

I have access to your organization's live training and adoption KPIs. I can help you:

• **Understand the data** — what enrollment, completion, and proficiency numbers are really telling you
• **Spot risks** — compliance exceptions, stalled departments, or adoption gaps
• **Plan next steps** — specific, prioritized actions to accelerate AI adoption
• **Build the ROI story** — how to present this data to your board

What would you like to explore first?`;

interface CSuiteAdvisorPanelProps {
  organizationId?: string | null;
}

export function CSuiteAdvisorPanel({ organizationId }: CSuiteAdvisorPanelProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const kpis = useCSuiteKPIs(organizationId || null);

  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localMessages, setLocalMessages] = useState<LocalMessage[]>([
    { role: 'assistant', content: WELCOME_MESSAGE },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [localMessages, isLoading]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMsg: LocalMessage = { role: 'user', content };
    const history = [...localMessages];
    setLocalMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const kpiSnapshot = buildKPISnapshot(kpis);
      const systemPrompt = buildSystemPrompt(kpiSnapshot);

      const { data, error } = await supabase.functions.invoke('ai-practice', {
        body: {
          customSystemPrompt: systemPrompt,
          moduleTitle: 'C-Suite AI Advisor',
          scenario: 'Executive AI enablement advisory session with live KPI data.',
          messages: [...history, userMsg],
          bankRole: profile?.job_role || 'Executive',
        },
      });

      if (error) throw error;

      const reply = data?.reply || "I'm having trouble accessing the data right now. Please try again.";
      setLocalMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      console.error('C-Suite advisor error:', err);
      setLocalMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having a brief connection issue. Please try again.",
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatSend = () => {
    if (!chatInput.trim() || isLoading) return;
    const content = chatInput.trim();
    setChatInput('');
    sendMessage(content);
  };

  const handleReset = () => {
    setLocalMessages([{ role: 'assistant', content: WELCOME_MESSAGE }]);
    setChatInput('');
  };

  // Quick-start suggestion chips
  const suggestions = [
    'How is our AI adoption going overall?',
    'Which departments need the most attention?',
    'What should I present to the board?',
    'Are there any compliance risks?',
  ];

  const handleSuggestion = (text: string) => {
    sendMessage(text);
  };

  return (
    <Card className="flex flex-col h-full min-h-[500px] overflow-hidden">
      {/* Header — data-tour="andrea-kpi-bar" for tour targeting */}
      <div data-tour="andrea-kpi-bar" className="flex items-center gap-3 px-4 py-3 border-b bg-primary text-primary-foreground shrink-0">
        <img
          src={andreaCoach}
          alt="Andrea"
          className="h-10 w-10 rounded-full object-cover border-2 border-primary-foreground/30"
        />
        <div className="flex-1">
          <p className="text-sm font-semibold leading-none">Andrea — Executive AI Advisor</p>
          <p className="text-xs text-primary-foreground/80 mt-0.5">
            {kpis.loading ? 'Loading KPI data…' : `Analyzing ${kpis.totalEnrolled} enrolled users across ${kpis.departmentBreakdowns.length} departments`}
          </p>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-1 text-xs text-primary-foreground/70 hover:text-primary-foreground transition-colors px-2 py-1 rounded hover:bg-primary-foreground/10"
          title="Start a new conversation"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {localMessages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-xl px-3 py-2.5">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion chips — only show when there's just the welcome message */}
      {localMessages.length === 1 && !isLoading && (
        <div data-tour="andrea-suggestions" className="px-4 pb-2 flex flex-wrap gap-1.5 shrink-0">
          {suggestions.map((text) => (
            <button
              key={text}
              onClick={() => handleSuggestion(text)}
              className="text-xs px-3 py-1.5 rounded-full border border-border bg-background hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              {text}
            </button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <div data-tour="andrea-input" className="border-t p-3 flex gap-2 shrink-0">
        <Textarea
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="Ask Andrea about your AI enablement data..."
          className="min-h-[40px] max-h-[120px] resize-none text-sm py-2"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleChatSend();
            }
          }}
        />
        <Button
          size="icon"
          onClick={handleChatSend}
          disabled={!chatInput.trim() || isLoading}
          className="shrink-0 self-end h-9 w-9"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
