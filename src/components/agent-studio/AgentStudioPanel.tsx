import { useState, useEffect, useCallback } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Rocket, FlaskConical, FileText, CheckCircle, AlertCircle, Settings2, Info, Plus, Trash2 } from 'lucide-react';
import { AgentTemplateBuilder } from './AgentTemplateBuilder';
import { AgentTestChat } from './AgentTestChat';
import { useUserAgents } from '@/hooks/useUserAgents';
import type { AgentTemplateData } from '@/types/agent';
import { EMPTY_TEMPLATE, assembleSystemPrompt, countWords } from '@/types/agent';
import type { ModuleContent } from '@/data/trainingContent';

interface AgentStudioPanelProps {
  module: ModuleContent;
  onSubmitForReview?: (systemPrompt: string, templateData: AgentTemplateData) => void;
}

export function AgentStudioPanel({
  module,
  onSubmitForReview,
}: AgentStudioPanelProps) {
  const {
    agents,
    draftAgent,
    isLoading,
    testConversations,
    createAgent,
    updateAgent,
    deployAgent,
    undeployAgent,
    fetchTestConversations,
    createTestConversation,
    appendTestMessage,
  } = useUserAgents();

  const [isDeploying, setIsDeploying] = useState(false);
  const [testConversationId, setTestConversationId] = useState<string | null>(null);
  const [currentTestType, setCurrentTestType] = useState<'freeform' | 'standard' | 'edge' | 'out_of_scope'>('freeform');
  const [mode, setMode] = useState<'guided' | 'advanced'>('guided');
  const [advancedPrompt, setAdvancedPrompt] = useState('');

  // Local template state (synced from agent)
  const currentAgent = draftAgent || agents[0] || null;
  const [localTemplate, setLocalTemplate] = useState<AgentTemplateData>(
    currentAgent?.template_data || EMPTY_TEMPLATE
  );
  const [localName, setLocalName] = useState(currentAgent?.name || 'My Agent');
  const [localSystemPrompt, setLocalSystemPrompt] = useState(currentAgent?.system_prompt || '');

  // Sync local state when agent loads from DB
  useEffect(() => {
    if (currentAgent) {
      setLocalTemplate(currentAgent.template_data || EMPTY_TEMPLATE);
      setLocalName(currentAgent.name || 'My Agent');
      setLocalSystemPrompt(currentAgent.system_prompt || '');
    }
  }, [currentAgent?.id]);

  // Auto-create draft agent if none exists
  useEffect(() => {
    if (!isLoading && agents.length === 0) {
      createAgent();
    }
  }, [isLoading, agents.length, createAgent]);

  // Fetch test conversations when agent is available
  useEffect(() => {
    if (currentAgent?.id) {
      fetchTestConversations(currentAgent.id);
    }
  }, [currentAgent?.id, fetchTestConversations]);

  // Auto-save in guided mode: when localTemplate changes, generate system prompt
  useEffect(() => {
    if (mode === 'guided') {
      const prompt = assembleSystemPrompt(localTemplate);
      setLocalSystemPrompt(prompt);
    }
  }, [localTemplate, mode]);

  // Auto-save in advanced mode: debounced save for freeform textarea
  useEffect(() => {
    if (mode === 'advanced' && currentAgent?.id && advancedPrompt !== localSystemPrompt) {
      const timeout = setTimeout(() => {
        setLocalSystemPrompt(advancedPrompt);
        updateAgent(currentAgent.id, { system_prompt: advancedPrompt, status: 'testing' });
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [advancedPrompt, mode]);

  // Handle template changes (debounced save)
  const handleTemplateChange = useCallback(
    (data: AgentTemplateData) => {
      setLocalTemplate(data);
      if (currentAgent?.id) {
        // Debounced save — save template_data and generated system prompt to DB
        const timeout = setTimeout(() => {
          const prompt = assembleSystemPrompt(data);
          updateAgent(currentAgent.id, {
            template_data: data,
            system_prompt: prompt,
            status: 'testing',
          });
        }, 1500);
        return () => clearTimeout(timeout);
      }
    },
    [currentAgent?.id, updateAgent]
  );

  // Handle name changes (debounced)
  const handleNameChange = useCallback(
    (name: string) => {
      setLocalName(name);
      if (currentAgent?.id) {
        const timeout = setTimeout(() => {
          updateAgent(currentAgent.id, { name });
        }, 1000);
        return () => clearTimeout(timeout);
      }
    },
    [currentAgent?.id, updateAgent]
  );

  // Handle deploy
  const handleDeploy = useCallback(async () => {
    if (!currentAgent?.id) return;
    setIsDeploying(true);
    try {
      await deployAgent(currentAgent.id);
    } finally {
      setIsDeploying(false);
    }
  }, [currentAgent?.id, deployAgent]);

  // Handle undeploy
  const handleUndeploy = useCallback(async () => {
    if (!currentAgent?.id) return;
    setIsDeploying(true);
    try {
      await undeployAgent(currentAgent.id);
    } finally {
      setIsDeploying(false);
    }
  }, [currentAgent?.id, undeployAgent]);

  // Track test conversations when messages change
  const handleTestConversationChange = useCallback(
    async (messages: Array<{ role: 'user' | 'assistant'; content: string }>) => {
      if (!currentAgent?.id) return;

      // Reset when chat is cleared
      if (messages.length === 0) {
        setTestConversationId(null);
        setCurrentTestType('freeform');
        return;
      }

      // Create conversation on first message, using the tracked test type
      if (!testConversationId && messages.length === 1) {
        const id = await createTestConversation(currentAgent.id, currentTestType);
        if (id) {
          setTestConversationId(id);
          await appendTestMessage(id, messages[0]);
        }
        return;
      }

      // Append latest message
      if (testConversationId && messages.length > 0) {
        const latestMessage = messages[messages.length - 1];
        await appendTestMessage(testConversationId, latestMessage);
      }
    },
    [currentAgent?.id, testConversationId, currentTestType, createTestConversation, appendTestMessage]
  );

  // Mode switching
  const handleModeSwitch = (newMode: 'guided' | 'advanced') => {
    if (newMode === mode) return;
    if (newMode === 'advanced') {
      // Pre-fill advanced textarea from current template
      setAdvancedPrompt(assembleSystemPrompt(localTemplate));
    }
    setMode(newMode);
  };

  // Computed values
  const wordCount = countWords(localSystemPrompt);
  const isIdentityDone = localTemplate.identity.trim().length > 0;
  const isTasksDone = localTemplate.taskList.filter((t) => t.name.trim()).length >= 2;
  const isRulesDone = localTemplate.outputRules.filter((r) => r.trim()).length >= 2;
  const isGuardRailsDone = localTemplate.guardRails.filter((g) => g.rule.trim()).length >= 2;
  const isAnchorsDone = localTemplate.complianceAnchors.filter((a) => a.trim()).length >= 1;
  const allSectionsDone = isIdentityDone && isTasksDone && isRulesDone && isGuardRailsDone && isAnchorsDone;

  const hasPrompt = localSystemPrompt.trim().length > 0;
  const coveredTypes = new Set(testConversations.map((t) => t.test_type));
  const hasStandardTest = coveredTypes.has('standard');
  const hasEdgeTest = coveredTypes.has('edge');
  const hasOutOfScopeTest = coveredTypes.has('out_of_scope');
  const canDeploy = hasPrompt && hasStandardTest && hasEdgeTest && hasOutOfScopeTest;
  const isDeployed = currentAgent?.is_deployed ?? false;

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-background">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <Input
          value={localName}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="Agent name..."
          className="flex-1 h-9 text-sm font-medium"
        />
        <Button
          variant={isDeployed ? 'outline' : 'default'}
          size="sm"
          onClick={isDeployed ? handleUndeploy : handleDeploy}
          disabled={(!canDeploy && !isDeployed) || isDeploying}
          className={`gap-2 shrink-0 ${
            isDeployed ? 'text-green-600 border-green-500/30 hover:text-destructive hover:border-destructive/30' : ''
          }`}
        >
          <Rocket className="h-4 w-4" />
          {isDeploying ? 'Deploying...' : isDeployed ? 'Deployed' : 'Deploy'}
          {isDeployed && <CheckCircle className="h-3.5 w-3.5" />}
        </Button>
        {onSubmitForReview && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSubmitForReview(localSystemPrompt, localTemplate)}
            disabled={!hasPrompt}
            className="shrink-0"
          >
            Get Andrea's Feedback
          </Button>
        )}
      </div>

      {/* Main content area — side by side */}
      <div className="flex flex-row flex-1 min-h-0">
        {/* Left panel — Configure */}
        <div className="w-1/2 border-r border-border flex flex-col min-h-0">
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-4">
              {/* Section header */}
              <div className="flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Configure</span>
              </div>

              {/* Module-aware context banner — shown for modules 3-4 through 3-7 */}
              {(['3-4', '3-5', '3-6', '3-7'] as string[]).includes(module.id) && (() => {
                const CONTEXT: Record<string, string> = {
                  '3-4': 'You\'re building on the agent you created in Module 3-3. This module: add knowledge so your agent becomes a specialist, not just a generalist.',
                  '3-5': 'Your agent is taking shape. This module: enable file input so users can hand your agent a document and get work done on it.',
                  '3-6': 'Almost there. This module: connect tools so your agent can take actions, not just give advice.',
                  '3-7': 'Capstone — pull everything together. Deploy your agent and use it for a real task.',
                };
                return (
                  <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-primary/5 border border-primary/10 text-xs text-muted-foreground leading-relaxed">
                    <Info className="h-3.5 w-3.5 text-primary/60 shrink-0 mt-0.5" />
                    <span>{CONTEXT[module.id]}</span>
                  </div>
                );
              })()}

              {/* Mode toggle */}
              <div className="inline-flex items-center rounded-lg border border-border bg-muted/50 p-0.5">
                <button
                  onClick={() => handleModeSwitch('guided')}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    mode === 'guided'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Guided
                </button>
                <button
                  onClick={() => handleModeSwitch('advanced')}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    mode === 'advanced'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Advanced
                </button>
              </div>

              {/* Guided mode — template builder */}
              {mode === 'guided' && (
                <AgentTemplateBuilder
                  templateData={localTemplate}
                  onTemplateChange={handleTemplateChange}
                />
              )}

              {/* Advanced mode — freeform textarea */}
              {mode === 'advanced' && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    Edit the system prompt directly. Changes auto-save after 1.5 seconds.
                  </p>
                  <Textarea
                    value={advancedPrompt}
                    onChange={(e) => setAdvancedPrompt(e.target.value)}
                    placeholder="Write your system prompt here..."
                    rows={20}
                    className="text-sm font-mono leading-relaxed"
                  />
                </div>
              )}

              {/* Knowledge Sources */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Knowledge Sources</span>
                    {(localTemplate.knowledge_base || []).length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        ({(localTemplate.knowledge_base || []).length})
                      </span>
                    )}
                  </div>
                  {(localTemplate.knowledge_base || []).length < 5 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 gap-1 text-xs"
                      onClick={() =>
                        handleTemplateChange({
                          ...localTemplate,
                          knowledge_base: [
                            ...(localTemplate.knowledge_base || []),
                            { title: '', content: '' },
                          ],
                        })
                      }
                    >
                      <Plus className="h-3 w-3" />
                      Add source
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Paste bank policies, procedures, or reference materials. Your agent will draw on these when answering questions.
                </p>
                {(localTemplate.knowledge_base || []).length === 0 ? (
                  <div className="rounded-lg border-2 border-dashed border-muted-foreground/15 px-4 py-5 text-center text-xs text-muted-foreground">
                    No knowledge added yet. Add a source to make your agent a specialist.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(localTemplate.knowledge_base || []).map((block, idx) => (
                      <div key={idx} className="space-y-2 p-3 rounded-lg border bg-muted/20">
                        <div className="flex items-center gap-2">
                          <input
                            value={block.title}
                            onChange={(e) =>
                              handleTemplateChange({
                                ...localTemplate,
                                knowledge_base: (localTemplate.knowledge_base || []).map((b, i) =>
                                  i === idx ? { ...b, title: e.target.value } : b
                                ),
                              })
                            }
                            placeholder="Document title (e.g., Overdraft Policy)"
                            className="flex-1 h-7 text-xs rounded-md border border-input bg-background px-3 py-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 shrink-0 text-muted-foreground hover:text-destructive"
                            onClick={() =>
                              handleTemplateChange({
                                ...localTemplate,
                                knowledge_base: (localTemplate.knowledge_base || []).filter(
                                  (_, i) => i !== idx
                                ),
                              })
                            }
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <textarea
                          value={block.content}
                          onChange={(e) =>
                            handleTemplateChange({
                              ...localTemplate,
                              knowledge_base: (localTemplate.knowledge_base || []).map((b, i) =>
                                i === idx ? { ...b, content: e.target.value } : b
                              ),
                            })
                          }
                          placeholder="Paste document content here..."
                          rows={4}
                          className="w-full text-xs rounded-md border border-input bg-background px-3 py-2 resize-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring leading-relaxed"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Word count + completion status */}
              <div className="flex items-center gap-2 pt-1">
                <Badge
                  variant={
                    wordCount === 0
                      ? 'outline'
                      : wordCount >= 150 && wordCount <= 400
                      ? 'default'
                      : 'secondary'
                  }
                  className={
                    wordCount >= 150 && wordCount <= 400
                      ? 'bg-green-500/15 text-green-600 border-green-500/30'
                      : wordCount > 400
                      ? 'bg-amber-500/15 text-amber-600 border-amber-500/30'
                      : ''
                  }
                >
                  {wordCount} words
                </Badge>
                {allSectionsDone && (
                  <Badge variant="outline" className="gap-1 text-green-600 border-green-500/30">
                    <CheckCircle className="h-3 w-3" />
                    Complete
                  </Badge>
                )}
              </div>

              {/* Deploy checklist */}
              <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Deploy checklist</p>
                {[
                  { done: hasPrompt, label: 'System prompt written' },
                  { done: hasStandardTest, label: 'Standard task tested' },
                  { done: hasEdgeTest, label: 'Edge case tested' },
                  { done: hasOutOfScopeTest, label: 'Out-of-scope tested' },
                ].map(({ done, label }) => (
                  <div key={label} className="flex items-center gap-2">
                    {done ? (
                      <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />
                    ) : (
                      <AlertCircle className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
                    )}
                    <span className={`text-xs ${done ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Right panel — Test */}
        <div className="w-1/2 flex flex-col min-h-0">
          {/* Right panel header */}
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border">
            <FlaskConical className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Test your agent</span>
          </div>
          {/* Chat component */}
          <AgentTestChat
            systemPrompt={localSystemPrompt}
            agentId={currentAgent?.id || ''}
            agentName={localName}
            onConversationChange={handleTestConversationChange}
            onTestTypeChange={setCurrentTestType}
          />
        </div>
      </div>

      {/* Bottom deploy status bar */}
      {isDeployed && (
        <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border-t border-green-500/20">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-green-600">Active for Session 3</span>
        </div>
      )}
    </div>
  );
}
