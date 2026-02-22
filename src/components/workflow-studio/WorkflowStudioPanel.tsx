import { useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Hammer, FlaskConical, Save } from 'lucide-react';
import { WorkflowBuilder } from './WorkflowBuilder';
import { WorkflowTestChat } from './WorkflowTestChat';
import { WorkflowSummaryCard } from './WorkflowSummaryCard';
import { useUserWorkflows } from '@/hooks/useUserWorkflows';
import type { WorkflowData } from '@/types/workflow';
import { EMPTY_WORKFLOW } from '@/types/workflow';

interface WorkflowStudioPanelProps {
  onSubmitForReview?: (workflowData: WorkflowData, workflowName: string) => void;
}

type StudioTab = 'build' | 'test' | 'save';

export function WorkflowStudioPanel({ onSubmitForReview }: WorkflowStudioPanelProps) {
  const {
    workflows,
    draftWorkflow,
    isLoading,
    createWorkflow,
    updateWorkflow,
  } = useUserWorkflows();

  const [activeTab, setActiveTab] = useState<StudioTab>('build');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Local state (synced from workflow)
  const currentWorkflow = draftWorkflow || workflows[0] || null;
  const [localData, setLocalData] = useState<WorkflowData>(
    currentWorkflow?.workflow_data || EMPTY_WORKFLOW
  );
  const [localName, setLocalName] = useState(currentWorkflow?.name || 'My Workflow');

  // Sync local state when workflow loads from DB
  useEffect(() => {
    if (currentWorkflow) {
      setLocalData(currentWorkflow.workflow_data || EMPTY_WORKFLOW);
      setLocalName(currentWorkflow.name || 'My Workflow');
    }
  }, [currentWorkflow?.id]);

  // Auto-create draft workflow if none exists
  useEffect(() => {
    if (!isLoading && workflows.length === 0) {
      createWorkflow();
    }
  }, [isLoading, workflows.length, createWorkflow]);

  // Handle data changes (debounced save)
  const handleDataChange = useCallback(
    (data: WorkflowData) => {
      setLocalData(data);
      if (currentWorkflow?.id) {
        const timeout = setTimeout(() => {
          updateWorkflow(currentWorkflow.id, { workflow_data: data });
        }, 1500);
        return () => clearTimeout(timeout);
      }
    },
    [currentWorkflow?.id, updateWorkflow]
  );

  // Handle name changes (debounced save)
  const handleNameChange = useCallback(
    (name: string) => {
      setLocalName(name);
      if (currentWorkflow?.id) {
        const timeout = setTimeout(() => {
          updateWorkflow(currentWorkflow.id, { name });
        }, 1000);
        return () => clearTimeout(timeout);
      }
    },
    [currentWorkflow?.id, updateWorkflow]
  );

  // Handle submit for review
  const handleSubmitForReview = useCallback(async () => {
    if (!currentWorkflow?.id) return;
    setIsSubmitting(true);
    try {
      await updateWorkflow(currentWorkflow.id, {
        workflow_data: localData,
        name: localName,
        status: 'testing',
      });
      onSubmitForReview?.(localData, localName);
    } finally {
      setIsSubmitting(false);
    }
  }, [currentWorkflow?.id, localData, localName, updateWorkflow, onSubmitForReview]);

  const tabs: { id: StudioTab; label: string; icon: React.ReactNode }[] = [
    { id: 'build', label: 'Build', icon: <Hammer className="h-4 w-4" /> },
    { id: 'test', label: 'Test', icon: <FlaskConical className="h-4 w-4" /> },
    { id: 'save', label: 'Save', icon: <Save className="h-4 w-4" /> },
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
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 flex flex-col min-h-0 overflow-auto">
        {activeTab === 'build' && (
          <WorkflowBuilder
            workflowData={localData}
            workflowName={localName}
            onDataChange={handleDataChange}
            onNameChange={handleNameChange}
          />
        )}

        {activeTab === 'test' && (
          <WorkflowTestChat
            workflowData={localData}
            workflowName={localName}
          />
        )}

        {activeTab === 'save' && (
          <WorkflowSummaryCard
            workflowData={localData}
            workflowName={localName}
            onSubmitForReview={handleSubmitForReview}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </div>
  );
}
