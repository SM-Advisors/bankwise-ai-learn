import { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Plus, Trash2, Save, Eye, CheckCircle, AlertCircle } from 'lucide-react';
import type { AgentTemplateData } from '@/types/agent';
import { assembleSystemPrompt, countWords } from '@/types/agent';

interface AgentTemplateBuilderProps {
  templateData: AgentTemplateData;
  onTemplateChange: (data: AgentTemplateData) => void;
  onSaveAndGenerate: (systemPrompt: string) => void;
  systemPrompt: string;
  agentName: string;
  onNameChange: (name: string) => void;
}

export function AgentTemplateBuilder({
  templateData,
  onTemplateChange,
  onSaveAndGenerate,
  systemPrompt,
  agentName,
  onNameChange,
}: AgentTemplateBuilderProps) {
  const [showPreview, setShowPreview] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced auto-save on change
  const handleChange = useCallback(
    (updater: (prev: AgentTemplateData) => AgentTemplateData) => {
      const updated = updater(templateData);
      onTemplateChange(updated);
    },
    [templateData, onTemplateChange]
  );

  const wordCount = systemPrompt ? countWords(systemPrompt) : 0;
  const livePreview = assembleSystemPrompt(templateData);
  const liveWordCount = countWords(livePreview);

  // Check section completeness
  const isIdentityDone = templateData.identity.trim().length > 0;
  const isTasksDone = templateData.taskList.filter((t) => t.name.trim()).length >= 2;
  const isRulesDone = templateData.outputRules.filter((r) => r.trim()).length >= 2;
  const isGuardRailsDone = templateData.guardRails.filter((g) => g.rule.trim()).length >= 2;
  const isAnchorsDone = templateData.complianceAnchors.filter((a) => a.trim()).length >= 1;
  const allSectionsDone = isIdentityDone && isTasksDone && isRulesDone && isGuardRailsDone && isAnchorsDone;

  const sectionStatus = (done: boolean) =>
    done ? (
      <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
    ) : (
      <AlertCircle className="h-4 w-4 text-muted-foreground/40 shrink-0" />
    );

  return (
    <ScrollArea className="flex-1">
      <div className="p-4 space-y-4">
        {/* Agent Name */}
        <div>
          <Label htmlFor="agent-name" className="text-sm font-medium">
            Agent Name
          </Label>
          <Input
            id="agent-name"
            value={agentName}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="e.g., Collections Communication Agent"
            className="mt-1"
          />
        </div>

        {/* Template Sections */}
        <Accordion type="multiple" defaultValue={['identity', 'tasks', 'rules', 'guardrails', 'anchors']} className="space-y-2">
          {/* IDENTITY */}
          <AccordionItem value="identity" className="border rounded-lg px-4">
            <AccordionTrigger className="py-3 hover:no-underline">
              <div className="flex items-center gap-2">
                {sectionStatus(isIdentityDone)}
                <span className="font-medium text-sm">1. Identity</span>
                <span className="text-xs text-muted-foreground">(2-3 sentences)</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <Textarea
                value={templateData.identity}
                onChange={(e) =>
                  handleChange((prev) => ({ ...prev, identity: e.target.value }))
                }
                placeholder="You are a [Role] for [Department] at [Bank]. You help [Audience] with [Primary Purpose]."
                rows={3}
                className="text-sm"
              />
            </AccordionContent>
          </AccordionItem>

          {/* TASK LIST */}
          <AccordionItem value="tasks" className="border rounded-lg px-4">
            <AccordionTrigger className="py-3 hover:no-underline">
              <div className="flex items-center gap-2">
                {sectionStatus(isTasksDone)}
                <span className="font-medium text-sm">2. Task List</span>
                <span className="text-xs text-muted-foreground">
                  ({templateData.taskList.filter((t) => t.name.trim()).length} tasks)
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4 space-y-3">
              {templateData.taskList.map((task, idx) => (
                <div key={idx} className="space-y-2 p-3 rounded-lg bg-muted/30 border">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium text-muted-foreground">Task {idx + 1}</Label>
                    {templateData.taskList.length > 2 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                        onClick={() =>
                          handleChange((prev) => ({
                            ...prev,
                            taskList: prev.taskList.filter((_, i) => i !== idx),
                          }))
                        }
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <Input
                    value={task.name}
                    onChange={(e) =>
                      handleChange((prev) => ({
                        ...prev,
                        taskList: prev.taskList.map((t, i) =>
                          i === idx ? { ...t, name: e.target.value } : t
                        ),
                      }))
                    }
                    placeholder="Task name (e.g., 30-Day Past-Due Letters)"
                    className="text-sm"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={task.format}
                      onChange={(e) =>
                        handleChange((prev) => ({
                          ...prev,
                          taskList: prev.taskList.map((t, i) =>
                            i === idx ? { ...t, format: e.target.value } : t
                          ),
                        }))
                      }
                      placeholder="Output format"
                      className="text-sm"
                    />
                    <Input
                      value={task.constraint}
                      onChange={(e) =>
                        handleChange((prev) => ({
                          ...prev,
                          taskList: prev.taskList.map((t, i) =>
                            i === idx ? { ...t, constraint: e.target.value } : t
                          ),
                        }))
                      }
                      placeholder="Constraint"
                      className="text-sm"
                    />
                  </div>
                </div>
              ))}
              {templateData.taskList.length < 5 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={() =>
                    handleChange((prev) => ({
                      ...prev,
                      taskList: [...prev.taskList, { name: '', format: '', constraint: '' }],
                    }))
                  }
                >
                  <Plus className="h-3 w-3" />
                  Add Task
                </Button>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* OUTPUT RULES */}
          <AccordionItem value="rules" className="border rounded-lg px-4">
            <AccordionTrigger className="py-3 hover:no-underline">
              <div className="flex items-center gap-2">
                {sectionStatus(isRulesDone)}
                <span className="font-medium text-sm">3. Output Rules</span>
                <span className="text-xs text-muted-foreground">
                  ({templateData.outputRules.filter((r) => r.trim()).length} rules)
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4 space-y-2">
              {templateData.outputRules.map((rule, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input
                    value={rule}
                    onChange={(e) =>
                      handleChange((prev) => ({
                        ...prev,
                        outputRules: prev.outputRules.map((r, i) =>
                          i === idx ? e.target.value : r
                        ),
                      }))
                    }
                    placeholder={`Formatting rule ${idx + 1} (e.g., Always use placeholder names)`}
                    className="text-sm"
                  />
                  {templateData.outputRules.length > 2 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() =>
                        handleChange((prev) => ({
                          ...prev,
                          outputRules: prev.outputRules.filter((_, i) => i !== idx),
                        }))
                      }
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
              {templateData.outputRules.length < 5 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={() =>
                    handleChange((prev) => ({
                      ...prev,
                      outputRules: [...prev.outputRules, ''],
                    }))
                  }
                >
                  <Plus className="h-3 w-3" />
                  Add Rule
                </Button>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* GUARD RAILS */}
          <AccordionItem value="guardrails" className="border rounded-lg px-4">
            <AccordionTrigger className="py-3 hover:no-underline">
              <div className="flex items-center gap-2">
                {sectionStatus(isGuardRailsDone)}
                <span className="font-medium text-sm">4. Guard Rails</span>
                <span className="text-xs text-muted-foreground">
                  ({templateData.guardRails.filter((g) => g.rule.trim()).length} rails)
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4 space-y-3">
              {templateData.guardRails.map((rail, idx) => (
                <div key={idx} className="space-y-2 p-3 rounded-lg bg-muted/30 border">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium text-muted-foreground">Guard Rail {idx + 1}</Label>
                    {templateData.guardRails.length > 2 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                        onClick={() =>
                          handleChange((prev) => ({
                            ...prev,
                            guardRails: prev.guardRails.filter((_, i) => i !== idx),
                          }))
                        }
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <Input
                    value={rail.rule}
                    onChange={(e) =>
                      handleChange((prev) => ({
                        ...prev,
                        guardRails: prev.guardRails.map((g, i) =>
                          i === idx ? { ...g, rule: e.target.value } : g
                        ),
                      }))
                    }
                    placeholder='Do not... (e.g., "Do not draft demand letters")'
                    className="text-sm"
                  />
                  <Input
                    value={rail.alternative}
                    onChange={(e) =>
                      handleChange((prev) => ({
                        ...prev,
                        guardRails: prev.guardRails.map((g, i) =>
                          i === idx ? { ...g, alternative: e.target.value } : g
                        ),
                      }))
                    }
                    placeholder='Alternative response (e.g., "Redirect to legal department")'
                    className="text-sm"
                  />
                </div>
              ))}
              {templateData.guardRails.length < 5 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={() =>
                    handleChange((prev) => ({
                      ...prev,
                      guardRails: [...prev.guardRails, { rule: '', alternative: '' }],
                    }))
                  }
                >
                  <Plus className="h-3 w-3" />
                  Add Guard Rail
                </Button>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* COMPLIANCE ANCHORS */}
          <AccordionItem value="anchors" className="border rounded-lg px-4">
            <AccordionTrigger className="py-3 hover:no-underline">
              <div className="flex items-center gap-2">
                {sectionStatus(isAnchorsDone)}
                <span className="font-medium text-sm">5. Compliance Anchors</span>
                <span className="text-xs text-muted-foreground">
                  ({templateData.complianceAnchors.filter((a) => a.trim()).length} anchors)
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4 space-y-2">
              {templateData.complianceAnchors.map((anchor, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input
                    value={anchor}
                    onChange={(e) =>
                      handleChange((prev) => ({
                        ...prev,
                        complianceAnchors: prev.complianceAnchors.map((a, i) =>
                          i === idx ? e.target.value : a
                        ),
                      }))
                    }
                    placeholder={`Exact phrase to include in outputs (e.g., FDCPA disclosure)`}
                    className="text-sm"
                  />
                  {templateData.complianceAnchors.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() =>
                        handleChange((prev) => ({
                          ...prev,
                          complianceAnchors: prev.complianceAnchors.filter((_, i) => i !== idx),
                        }))
                      }
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
              {templateData.complianceAnchors.length < 3 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={() =>
                    handleChange((prev) => ({
                      ...prev,
                      complianceAnchors: [...prev.complianceAnchors, ''],
                    }))
                  }
                >
                  <Plus className="h-3 w-3" />
                  Add Anchor
                </Button>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <Button
            onClick={() => onSaveAndGenerate(livePreview)}
            disabled={!isIdentityDone}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            Save & Generate Prompt
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
            className="gap-2"
          >
            <Eye className="h-4 w-4" />
            {showPreview ? 'Hide Preview' : 'Preview'}
          </Button>
          <div className="ml-auto flex items-center gap-2">
            <Badge
              variant={
                liveWordCount === 0
                  ? 'outline'
                  : liveWordCount >= 150 && liveWordCount <= 400
                  ? 'default'
                  : 'secondary'
              }
              className={
                liveWordCount >= 150 && liveWordCount <= 400
                  ? 'bg-green-500/15 text-green-600 border-green-500/30'
                  : liveWordCount > 400
                  ? 'bg-amber-500/15 text-amber-600 border-amber-500/30'
                  : ''
              }
            >
              {liveWordCount} words
            </Badge>
            {allSectionsDone && (
              <Badge variant="outline" className="gap-1 text-green-600 border-green-500/30">
                <CheckCircle className="h-3 w-3" />
                Complete
              </Badge>
            )}
          </div>
        </div>

        {/* System Prompt Preview */}
        {showPreview && (
          <Card className="border-dashed">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm flex items-center justify-between">
                <span>System Prompt Preview</span>
                <Badge variant="outline" className="text-xs">{liveWordCount} words</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <pre className="text-xs leading-relaxed whitespace-pre-wrap font-mono bg-muted/50 p-3 rounded-lg max-h-64 overflow-y-auto">
                {livePreview || 'Fill in the template sections above to generate a system prompt.'}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </ScrollArea>
  );
}
