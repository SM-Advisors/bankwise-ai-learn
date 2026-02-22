import { useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Hammer, FlaskConical, Rocket } from 'lucide-react';
import { AgentTemplateBuilder } from './AgentTemplateBuilder';
import { AgentTestChat } from './AgentTestChat';
import { AgentDeployCard } from './AgentDeployCard';
import { useUserAgents } from '@/hooks/useUserAgents';
import type { AgentTemplateData } from '@/types/agent';
import { EMPTY_TEMPLATE, assembleSystemPrompt } from '@/types/agent';
import type { ModuleContent } from '@/data/trainingContent';

interface AgentStudioPanelProps {
  module: ModuleContent;
  onSubmitForReview?: (systemPrompt: string, templateData: AgentTemplateData) => void;
}

type StudioTab = 'build' | 'test' | 'deploy';

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

  // Determine default tab based on module
  const defaultTab: StudioTab = module.id === '2-5' ? 'test' : 'build';
  const [activeTab, setActiveTab] = useState<StudioTab>(defaultTab);
  const [isDeploying, setIsDeploying] = useState(false);
  const [testConversationId, setTestConversationId] = useState<string | null>(null);

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

  // Handle template changes (debounced save)
  const handleTemplateChange = useCallback(
    (data: AgentTemplateData) => {
      setLocalTemplate(data);
      if (currentAgent?.id) {
        // Debounced save — save template_data to DB
        const timeout = setTimeout(() => {
          updateAgent(currentAgent.id, { template_data: data });
        }, 1500);
        return () => clearTimeout(timeout);
      }
    },
    [currentAgent?.id, updateAgent]
  );

  // Handle name changes
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

  // Handle "Save & Generate Prompt"
  const handleSaveAndGenerate = useCallback(
    (systemPrompt: string) => {
      setLocalSystemPrompt(systemPrompt);
      if (currentAgent?.id) {
        updateAgent(currentAgent.id, {
          system_prompt: systemPrompt,
          template_data: localTemplate,
          status: 'testing',
        });
      }
    },
    [currentAgent?.id, localTemplate, updateAgent]
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
      if (!currentAgent?.id || messages.length === 0) return;

      // Create conversation on first message
      if (!testConversationId && messages.length === 1) {
        const id = await createTestConversation(currentAgent.id, 'freeform');
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
    [currentAgent?.id, testConversationId, createTestConversation, appendTestMessage]
  );

  const tabs: { id: StudioTab; label: string; icon: React.ReactNode }[] = [
    { id: 'build', label: 'Build', icon: <Hammer className="h-4 w-4" /> },
    { id: 'test', label: 'Test', icon: <FlaskConical className="h-4 w-4" /> },
    { id: 'deploy', label: 'Deploy', icon: <Rocket className="h-4 w-4" /> },
  ];

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-background">
      {/* Tab bar */}
      <div className="flex items-center justify-center px-4 pt-4 pb-2">
        <div className="inline-flex items-center rounded-full border border-border bg-card p-0.5 shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-5 py-1.5 text-sm font-medium rounded-full transition-colors ${
                activeTab === tab.id
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.id === 'deploy' && currentAgent?.is_deployed && (
                <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 flex flex-col min-h-0">
        {activeTab === 'build' && (
          <AgentTemplateBuilder
            templateData={localTemplate}
            onTemplateChange={handleTemplateChange}
            onSaveAndGenerate={handleSaveAndGenerate}
            systemPrompt={localSystemPrompt}
            agentName={localName}
            onNameChange={handleNameChange}
          />
        )}

        {activeTab === 'test' && (
          <AgentTestChat
            systemPrompt={localSystemPrompt}
            agentId={currentAgent?.id || ''}
            agentName={localName}
            onConversationChange={handleTestConversationChange}
          />
        )}

        {activeTab === 'deploy' && (
          <AgentDeployCard
            agent={currentAgent}
            testConversationCount={testConversations.length}
            onDeploy={handleDeploy}
            onUndeploy={handleUndeploy}
            isDeploying={isDeploying}
          />
        )}
      </div>
    </div>
  );
}
