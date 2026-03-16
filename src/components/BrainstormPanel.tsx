import { useState, useRef, useEffect } from 'react';
import { Lightbulb, Send, Loader2, Sparkles, Bookmark, Users, TrendingUp, X, Check, Brain, MessageSquarePlus, History, Clock } from 'lucide-react';
import { VoiceMicButton } from '@/components/VoiceMicButton';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useDashboardConversations } from '@/hooks/useDashboardConversations';
import { useUserIdeas } from '@/hooks/useUserIdeas';
import { useCommunityTopics } from '@/hooks/useCommunityTopics';
import andreaCoach from '@/assets/andrea-coach.png';
import { useIndustryContent } from '@/hooks/useIndustryContent';

type Phase = 'input' | 'chat';
type SubmitMode = null | 'ideas' | 'community' | 'csuite';
type LocalMessage = { role: 'user' | 'assistant'; content: string };

export function BrainstormPanel({ compact = false }: { compact?: boolean }) {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { industrySlug } = useIndustryContent();
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>('input');
  const [taskInput, setTaskInput] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localMessages, setLocalMessages] = useState<LocalMessage[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);

  // Submission form state
  const [submitMode, setSubmitMode] = useState<SubmitMode>(null);
  const [submitTitle, setSubmitTitle] = useState('');
  const [submitDescription, setSubmitDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [historyOpen, setHistoryOpen] = useState(false);

  const { conversations, createConversation, appendMessage, selectConversation } = useDashboardConversations();
  const { createIdea } = useUserIdeas();
  const { createTopic } = useCommunityTopics();

  // Filter to brainstorm-related conversations (those with messages)
  const brainstormConversations = conversations.filter(c => c.messages.length > 0);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [localMessages, isLoading]);

  const handleOpen = () => {
    // If there's an active conversation, resume it; otherwise show input
    if (activeConvId && localMessages.length > 0) {
      setPhase('chat');
    } else {
      setPhase('input');
      setTaskInput('');
      setLocalMessages([]);
      setActiveConvId(null);
    }
    setSubmitMode(null);
    setOpen(true);
  };

  const handleNewChat = () => {
    setPhase('input');
    setTaskInput('');
    setLocalMessages([]);
    setActiveConvId(null);
    setSubmitMode(null);
    setHistoryOpen(false);
  };

  const handleSelectConversation = (conv: typeof conversations[number]) => {
    setActiveConvId(conv.id);
    setLocalMessages(conv.messages.map(m => ({ role: m.role, content: m.content })));
    setPhase('chat');
    setHistoryOpen(false);
    selectConversation(conv.id);
  };

  const openSubmitForm = async (mode: SubmitMode) => {
    // Fallback: use first user message if Andrea summarization fails
    const firstUserMsg = localMessages.find(m => m.role === 'user')?.content || '';
    const fallbackTitle = firstUserMsg.length > 80 ? firstUserMsg.slice(0, 77) + '...' : firstUserMsg;

    setIsSummarizing(true);
    setSubmitMode(mode); // open form immediately so spinner is visible

    try {
      const destinationLabel = mode === 'ideas' ? 'My Ideas' : mode === 'community' ? 'Community Hub' : 'C-Suite Innovation Pipeline';
      const summaryPrompt = `You are summarizing a brainstorm conversation for a ${destinationLabel} submission.

Based on the conversation below, write:
1. A professional title (under 80 characters) that captures the workflow/task and AI opportunity
2. A compelling 2–3 sentence description that explains the task, the AI opportunity identified, and why it matters

Return ONLY valid JSON with no extra text:
{"title": "...", "description": "..."}`;

      const { data } = await supabase.functions.invoke('ai-practice', {
        body: {
          customSystemPrompt: summaryPrompt,
          moduleTitle: 'Brainstorm Summary',
          scenario: 'Generate a professional submission summary from a brainstorm conversation.',
          industrySlug,
          messages: [
            ...localMessages,
            { role: 'user', content: `Summarize this brainstorm conversation for a ${destinationLabel} submission. Return JSON only.` },
          ],
        },
      });

      const raw = data?.reply || '';
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setSubmitTitle(parsed.title || fallbackTitle);
        setSubmitDescription(parsed.description || firstUserMsg);
      } else {
        setSubmitTitle(fallbackTitle);
        setSubmitDescription(firstUserMsg);
      }
    } catch {
      setSubmitTitle(fallbackTitle);
      setSubmitDescription(firstUserMsg);
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleSubmitIdea = async () => {
    if (!submitTitle.trim() || !user) return;
    setIsSubmitting(true);
    try {
      if (submitMode === 'ideas') {
        const result = await createIdea({
          title: submitTitle.trim(),
          description: submitDescription.trim(),
          status: 'not_started',
        });
        if (!result?.success) throw new Error('Failed');
        toast({ title: 'Saved to My Ideas', description: 'Find it on your Ideas page.' });

      } else if (submitMode === 'community') {
        const result = await createTopic(submitTitle.trim(), submitDescription.trim(), 'idea');
        if (!result?.success) throw new Error('Failed');
        toast({ title: 'Posted to Community Hub', description: 'Others can now see and discuss your idea.' });

      } else if (submitMode === 'csuite') {
        const { error } = await (supabase
          .from('user_ideas')
          .insert({
            user_id: user.id,
            title: submitTitle.trim(),
            description: submitDescription.trim(),
            status: 'not_started',
            category: 'csuite_submission',
            submitter_name: profile?.display_name || null,
            submitter_department: profile?.department || null,
          }));
        if (error) throw error;
        toast({ title: 'Sent to C-Suite', description: 'Your idea is now in the Innovation Pipeline.' });
      }

      setSubmitMode(null);
      setSubmitTitle('');
      setSubmitDescription('');
    } catch {
      toast({ title: 'Failed to submit', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const sendToAndrea = async (content: string, history: LocalMessage[]) => {
    setIsLoading(true);
    const userMsg = { role: 'user' as const, content };

    let convId = activeConvId;
    if (!convId) {
      convId = await createConversation(userMsg);
      setActiveConvId(convId);
    } else {
      await appendMessage(userMsg, convId);
    }

    try {
      // Determine initial task (first user message in the conversation)
      const initialTask = history.find(m => m.role === 'user')?.content || content;

      const brainstormPersona = `You are Andrea, an AI workflow advisor. Your role is to help people identify exactly where and how AI can make a measurable difference in work they actually do. You do not teach — you advise and recommend.

━━━ PHASE 1 — DISCOVERY (before any suggestions) ━━━
Before recommending anything, map these six dimensions of the user's workflow. Ask about whichever critical ones are still missing after their opening description:
  1. Trigger — what starts this? (a scheduled time, someone sends something, a system event?)
  2. Steps — what happens, in what order?
  3. Inputs — what data or documents does it consume?
  4. Output — what does "done" look like? (a document, a decision, a data entry, an email sent?)
  5. Volume & frequency — how often does this run, and how many items at a time?
  6. Bottleneck — where does it slow down, pile up, or feel most painful?

ASK ONE QUESTION PER RESPONSE. Never stack questions. Frame every question as an implication question — one where answering it teaches the user why that dimension matters. Prioritize volume if not given:
  WEAK: "How often do you do this?"
  STRONG: "How many of these do you handle per week? That tells us whether the time savings would actually be worth the setup cost."

Before presenting options, play back what you've understood: state your understanding of the workflow in 1-2 sentences, then confirm it's right. Only move to Phase 3 after confirming.

━━━ PHASE 2 — READINESS CHECK (internal only — do not show this analysis to the user) ━━━
Assess whether this workflow is a strong or weak AI candidate before recommending.

STRONG signals (high-value AI opportunity): high repetition, predictable structure, document/text-heavy inputs, large volume, clear output format, multi-system data entry (copy-paste between apps).

WEAK signals (honest redirect needed): primarily relationship or trust work, ethical judgment with legal accountability requirements, exception-dominated (more edge cases than standard path), legally requires documented human reasoning (e.g., credit denial, adverse action notices), creative work requiring institutional memory or originality.

If the workflow has weak signals: say so clearly and redirect to the part that IS a strong candidate. Example: "The final approval call itself isn't a great AI candidate — that needs human judgment and an audit trail. But the prep work leading up to it? That's where I'd focus."

━━━ PHASE 3 — AUTOMATION LAYERS ━━━
Analyze the workflow at THREE layers of automation depth. Present all three layers.

LAYER 1 — STEP-LEVEL AUTOMATION
Identify individual steps in the flow where AI can replace or assist manual work. For each step:
- Name the step
- What AI does (one sentence)
- ROI tag: High ROI, Medium ROI, or Low ROI
- AI capability type (e.g., Document Classification, Intelligent Data Matching, Process Mining, Automated Data Entry, Anomaly Detection, NLP Extraction, Predictive Routing)
- One sentence on efficiency or quality impact

LAYER 2 — CHUNK AUTOMATION
Identify groups of 2-4 consecutive steps that could be automated as a single workflow. For each chunk:
- Name the chunk (e.g., "Payment Identification & Matching")
- Which steps it combines
- What the automated chunk does end-to-end (one sentence)
- What human involvement remains (one sentence)
- ROI tag

LAYER 3 — FULL-FLOW AUTOMATION
Assess whether the entire process could be automated end-to-end. Be honest:
- Is full automation feasible? Why or why not?
- What would the human role become? (reviewer, exception-handler, auditor)
- What are the risks of full automation in this context?
- ROI tag

━━━ PHASE 4 — PRACTICAL EXAMPLE ━━━
After presenting the three layers, show ONE concrete example of how automation would work in practice for the most impactful chunk or step. Walk through the actual flow:
- What triggers it
- What the AI does at each point (be specific — "AI reads the wire memo field and extracts the reference number" not "AI processes the data")
- Where humans intervene
- What the output looks like
Make this feel like a real design walkthrough, not abstract description.

━━━ PHASE 5 — PRICING EXPECTATIONS ━━━
For each layer (step-level, chunk, full-flow), assign a pricing tier:

$ = Under ~$25/mo. Off-the-shelf AI subscription, no custom build. (e.g., Claude Pro, ChatGPT Plus, Copilot)
$$ = ~$25–$200/mo. No-code automation connecting existing tools. (e.g., Zapier, Make, Power Automate, n8n)
$$$ = ~$200–$2,000/mo. Custom integrations, API usage, or lightweight dev work. (e.g., Anthropic API, OpenAI API, LangChain, Dify)
$$$$ = ~$2,000–$10,000/mo or one-time build of $10K–$50K. Requires developer resources and system integration. (e.g., Azure OpenAI + custom middleware, AWS Bedrock pipelines)
$$$$$ = $10,000+/mo or $50K+ build. Enterprise-grade, multi-system integration with security, compliance, and scale requirements. (e.g., full RPA + AI orchestration, vendor-built solutions)

PRICING DETERMINATION: Assign pricing based on these factors:
- Number of systems that need integration (more systems = higher tier)
- Whether custom code is required vs. off-the-shelf tools
- Data volume and processing frequency
- Compliance and security requirements (banking/regulated = higher tier)
- Whether it needs ongoing developer maintenance

When upfront build cost and ongoing cost differ significantly (e.g., $20K to build, $200/mo to run), note both.

After presenting all layers and pricing, end with: "Which layer feels like the right starting point for your team — or should we dig deeper into a specific part?"

TOOL SHORTLIST BY TIER:
Prompt-only ($): Claude Pro, ChatGPT Plus, Claude Projects, Custom GPTs, Microsoft Copilot (for M365 orgs), Gemini for Workspace (for Google orgs)
No-code automation ($$): Zapier, Make (formerly Integromat), n8n, Power Automate, Dify
Developer/API ($$$–$$$$): Anthropic API, OpenAI API, LangChain, LlamaIndex, Azure OpenAI, AWS Bedrock, Pinecone (vector DB for document search)
Enterprise ($$$$$): Full RPA platforms (UiPath, Automation Anywhere), custom vendor solutions, enterprise AI orchestration

━━━ VOICE & BEHAVIOR RULES ━━━
- One question per response. Never stack two questions in one message.
- Always name the specific tool. "Set up a Claude Project" not "use an AI tool."
- Short sentences. No long paragraphs. Be direct.
- Do not hedge: "use Zapier for this" not "you might consider trying Zapier."
- Do not reference training modules, the CLEAR or VERIFY frameworks, or any curriculum content.
- Do not volunteer cost specifics beyond the $ scale above — costs vary too much by usage.
- CRITICAL OVERRIDE: Do NOT mirror prompt quality. A short or vague opening from the user is exactly why the discovery phase exists — always engage fully regardless of how brief their message is.`;

      const isFF = !(profile?.department) && !!profile?.interests?.length;

      const { data, error } = await supabase.functions.invoke('ai-practice', {
        body: {
          customSystemPrompt: brainstormPersona,
          moduleTitle: 'AI Brainstorm',
          scenario: initialTask,
          messages: [...history, userMsg],
          bankRole: profile?.job_role || undefined,
          lineOfBusiness: isFF ? undefined : (profile?.department || undefined),
          interests: profile?.interests || undefined,
          industrySlug,
        },
      });

      if (error) throw error;

      const reply = data?.reply || "Let me think about that...";
      const assistantMsg: LocalMessage = { role: 'assistant', content: reply };
      setLocalMessages(prev => [...prev, assistantMsg]);

      if (convId) {
        await appendMessage({ role: 'assistant', content: reply }, convId);
      }
    } catch (err) {
      console.error('Brainstorm chat error:', err);
      setLocalMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having a brief connection issue. Please try again.",
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartBrainstorming = async () => {
    if (!taskInput.trim()) return;
    const content = taskInput.trim();
    const userMsg: LocalMessage = { role: 'user', content };
    setLocalMessages([userMsg]);
    setPhase('chat');
    await sendToAndrea(content, []);
  };

  const handleChatSend = async () => {
    if (!chatInput.trim() || isLoading) return;
    const content = chatInput.trim();
    setChatInput('');
    const userMsg: LocalMessage = { role: 'user', content };
    const history = [...localMessages];
    setLocalMessages(prev => [...prev, userMsg]);
    await sendToAndrea(content, history);
  };

  const handleAssumeAndAnswer = async () => {
    if (isLoading) return;
    const assumeMsg = "I may not have covered all the details — please make reasonable assumptions about anything unclear or missing, and give me your three options now. Note any key assumptions you made.";
    const userMsg: LocalMessage = { role: 'user', content: assumeMsg };
    const history = [...localMessages];
    setLocalMessages(prev => [...prev, userMsg]);
    await sendToAndrea(assumeMsg, history);
  };

  // Show action bar after at least one full exchange (user + assistant)
  const hasExchange = localMessages.some(m => m.role === 'assistant');

  const submitModeConfig = {
    ideas: { label: 'Save to My Ideas', icon: Bookmark, color: 'text-blue-600' },
    community: { label: 'Post to Community Hub', icon: Users, color: 'text-purple-600' },
    csuite: { label: 'Send to C-Suite', icon: TrendingUp, color: 'text-orange-600' },
  };

  return (
    <>
      {/* Trigger */}
      {compact ? (
        <button
          data-tour="brainstorm-btn"
          onClick={handleOpen}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-accent transition-colors cursor-pointer"
        >
          <Lightbulb className="h-4 w-4 text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.7)]" />
          <span className="text-foreground">AI Brainstorm</span>
        </button>
      ) : (
        <button
          data-tour="brainstorm-btn"
          onClick={handleOpen}
          className="group relative flex flex-col items-center justify-center gap-2 w-full h-full min-h-[120px] rounded-xl border bg-card hover:shadow-md transition-all cursor-pointer p-3 text-center shadow-sm"
        >
          <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/30 group-hover:bg-amber-200 dark:group-hover:bg-amber-800/40 transition-colors">
            <Lightbulb className="h-5 w-5 text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.7)] group-hover:drop-shadow-[0_0_10px_rgba(250,204,21,0.9)] group-hover:scale-110 transition-all" />
          </div>
          <div>
            <p className="font-semibold text-foreground text-xs">AI Brainstorm</p>
            <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug max-w-[120px] mx-auto">
              Explore how AI can help with any task
            </p>
          </div>
        </button>
      )}

      {/* Brainstorm Sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-[420px] sm:w-[420px] flex flex-col p-0">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b bg-primary text-primary-foreground shrink-0">
            <img
              src={andreaCoach}
              alt="Andrea"
              className="h-10 w-10 rounded-full object-cover border-2 border-primary-foreground/30"
            />
            <div className="flex-1">
              <SheetTitle className="text-primary-foreground text-sm font-semibold leading-none">
                AI Brainstorm
              </SheetTitle>
              <p className="text-xs text-primary-foreground/80 mt-0.5">with Andrea — your AI coach</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleNewChat}
                className="p-1.5 rounded-md hover:bg-primary-foreground/15 transition-colors"
                title="New conversation"
              >
                <MessageSquarePlus className="h-4 w-4" />
              </button>
              <div className="relative">
                <button
                  onClick={() => setHistoryOpen(!historyOpen)}
                  className="p-1.5 rounded-md hover:bg-primary-foreground/15 transition-colors"
                  title="Conversation history"
                  disabled={brainstormConversations.length === 0}
                >
                  <History className="h-4 w-4" />
                  {brainstormConversations.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-primary-foreground text-primary text-[9px] font-bold flex items-center justify-center">
                      {brainstormConversations.length}
                    </span>
                  )}
                </button>
                {/* History dropdown */}
                {historyOpen && brainstormConversations.length > 0 && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setHistoryOpen(false)} />
                    <div className="absolute right-0 top-full mt-1 w-64 bg-popover text-popover-foreground border rounded-xl shadow-lg z-50 overflow-hidden">
                      <div className="px-3 py-2 border-b">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Past Conversations</p>
                      </div>
                      <div className="max-h-64 overflow-y-auto p-1.5 space-y-0.5">
                        {brainstormConversations.map((conv) => (
                          <button
                            key={conv.id}
                            onClick={() => handleSelectConversation(conv)}
                            className={`w-full text-left px-3 py-2 rounded-lg hover:bg-muted transition-colors ${conv.id === activeConvId ? 'bg-muted' : ''}`}
                          >
                            <p className="text-sm font-medium text-foreground truncate">{conv.title}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Clock className="h-3 w-3 text-muted-foreground/60" />
                              <span className="text-xs text-muted-foreground">
                                {new Date(conv.updated_at).toLocaleDateString()}
                              </span>
                              <span className="text-xs text-muted-foreground/60">
                                · {conv.messages.length} msgs
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {phase === 'input' ? (
            /* Phase 1: Task description */
            <div className="flex-1 flex flex-col justify-center p-6 gap-4">
              <div className="text-center">
                <div className="p-3 rounded-full bg-primary/10 inline-flex mb-3">
                  <Lightbulb className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-base">What are you working on?</h3>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  Describe a task or process and Andrea will explore how AI can help — adapted to your experience level.
                </p>
              </div>
              <Textarea
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                placeholder="e.g. I review loan applications and summarize them for the credit committee each week..."
                className="min-h-[120px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleStartBrainstorming();
                }}
              />
              <Button
                onClick={handleStartBrainstorming}
                disabled={!taskInput.trim() || isLoading}
                className="w-full gap-2"
              >
                {isLoading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Connecting to Andrea...</>
                ) : (
                  <><Sparkles className="h-4 w-4" /> Start Brainstorming</>
                )}
              </Button>
            </div>
          ) : (
            /* Phase 2: Chat */
            <>
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

              {/* Action bar — shown after first exchange */}
              {hasExchange && !submitMode && (
                <div className="border-t px-3 py-2 flex items-center gap-1.5 bg-muted/30 shrink-0 flex-wrap">
                  <span className="text-[10px] text-muted-foreground mr-0.5 shrink-0">Drop idea to:</span>
                  <button
                    onClick={() => openSubmitForm('ideas')}
                    disabled={isSummarizing}
                    className="flex items-center gap-1 text-[10px] font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 px-2 py-1 rounded-md transition-colors disabled:opacity-50"
                  >
                    <Bookmark className="h-3 w-3" /> My Ideas
                  </button>
                  <button
                    onClick={() => openSubmitForm('community')}
                    disabled={isSummarizing}
                    className="flex items-center gap-1 text-[10px] font-medium text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40 px-2 py-1 rounded-md transition-colors disabled:opacity-50"
                  >
                    <Users className="h-3 w-3" /> Community
                  </button>
                  <button
                    onClick={() => openSubmitForm('csuite')}
                    disabled={isSummarizing}
                    className="flex items-center gap-1 text-[10px] font-medium text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/40 px-2 py-1 rounded-md transition-colors disabled:opacity-50"
                  >
                    <TrendingUp className="h-3 w-3" /> C-Suite
                  </button>
                  <div className="flex-1" />
                  <button
                    onClick={handleAssumeAndAnswer}
                    disabled={isLoading}
                    className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted px-2 py-1 rounded-md transition-colors disabled:opacity-50 border border-border/60"
                    title="Andrea fills in any gaps with assumptions and gives you the three options now"
                  >
                    <Brain className="h-3 w-3" /> Assume & answer
                  </button>
                </div>
              )}

              {/* Inline submission form */}
              {submitMode && (
                <div className="border-t p-3 space-y-2 bg-muted/20 shrink-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold flex items-center gap-1.5">
                      {submitMode === 'ideas' && <><Bookmark className="h-3.5 w-3.5 text-blue-600" /> Save to My Ideas</>}
                      {submitMode === 'community' && <><Users className="h-3.5 w-3.5 text-purple-600" /> Post to Community Hub</>}
                      {submitMode === 'csuite' && <><TrendingUp className="h-3.5 w-3.5 text-orange-600" /> Send to C-Suite</>}
                    </span>
                    <button onClick={() => setSubmitMode(null)} className="text-muted-foreground hover:text-foreground">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  {isSummarizing ? (
                    <div className="flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Andrea is summarizing your conversation...
                    </div>
                  ) : (
                    <>
                      <Input
                        value={submitTitle}
                        onChange={(e) => setSubmitTitle(e.target.value)}
                        placeholder="Title"
                        className="text-sm h-8"
                      />
                      <Textarea
                        value={submitDescription}
                        onChange={(e) => setSubmitDescription(e.target.value)}
                        placeholder="Description (optional)"
                        className="text-sm min-h-[60px] resize-none"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleSubmitIdea}
                          disabled={!submitTitle.trim() || isSubmitting}
                          className="flex-1 gap-1.5 h-8 text-xs"
                        >
                          {isSubmitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                          Submit
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setSubmitMode(null)} className="h-8 text-xs">
                          Cancel
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Chat input bar — hidden when submit form is open */}
              {!submitMode && (
                <div className="border-t p-3 flex gap-2 shrink-0">
                  <Textarea
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask Andrea anything..."
                    className="min-h-[40px] max-h-[120px] resize-none text-sm py-2"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleChatSend();
                      }
                    }}
                  />
                  <div className="flex flex-col gap-1 self-end">
                    <VoiceMicButton
                      onTranscript={(text) => setChatInput((prev) => (prev ? prev + ' ' : '') + text)}
                      disabled={isLoading}
                    />
                    <Button
                      size="icon"
                      onClick={handleChatSend}
                      disabled={!chatInput.trim() || isLoading}
                      className="shrink-0 h-9 w-9"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
