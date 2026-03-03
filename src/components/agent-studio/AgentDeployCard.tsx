import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Rocket, CheckCircle, AlertTriangle, Clock, Bot,
  FileText, Shield, MessageSquare, XCircle,
} from 'lucide-react';
import { countWords } from '@/types/agent';
import type { UserAgent } from '@/types/agent';

interface AgentDeployCardProps {
  agent: UserAgent | null;
  testConversationCount: number;
  onDeploy: () => void;
  onUndeploy: () => void;
  isDeploying?: boolean;
}

export function AgentDeployCard({
  agent,
  testConversationCount,
  onDeploy,
  onUndeploy,
  isDeploying,
}: AgentDeployCardProps) {
  if (!agent) {
    return (
      <ScrollArea className="flex-1">
        <div className="p-4 flex flex-col items-center justify-center min-h-[400px] text-center">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Bot className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-1">No Agent Yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Build your agent template first, then test it to make sure it works as expected before deploying.
          </p>
        </div>
      </ScrollArea>
    );
  }

  const wordCount = agent.system_prompt ? countWords(agent.system_prompt) : 0;
  const hasPrompt = wordCount > 0;
  const hasTests = testConversationCount > 0;
  const canDeploy = hasPrompt && hasTests;
  const isDeployed = agent.is_deployed;

  const deployChecks = [
    {
      label: 'System prompt generated',
      passed: hasPrompt,
      detail: hasPrompt ? `${wordCount} words` : 'Not yet generated',
    },
    {
      label: 'At least 1 test conversation',
      passed: hasTests,
      detail: hasTests ? `${testConversationCount} test(s)` : 'No tests yet',
    },
  ];

  return (
    <ScrollArea className="flex-1">
      <div className="p-4 space-y-4">
        {/* Agent Overview Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Bot className="h-5 w-5" />
                {agent.name}
              </CardTitle>
              <Badge
                variant={isDeployed ? 'default' : 'secondary'}
                className={isDeployed ? 'bg-green-500/15 text-green-600 border-green-500/30' : ''}
              >
                {isDeployed ? 'Active' : agent.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-2 rounded-lg bg-muted/50">
                <FileText className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                <p className="text-lg font-semibold">{wordCount}</p>
                <p className="text-xs text-muted-foreground">Words</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-muted/50">
                <MessageSquare className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                <p className="text-lg font-semibold">{testConversationCount}</p>
                <p className="text-xs text-muted-foreground">Tests</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-muted/50">
                <Shield className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                <p className="text-lg font-semibold">
                  {agent.template_data.guardRails.filter((g) => g.rule.trim()).length}
                </p>
                <p className="text-xs text-muted-foreground">Guard Rails</p>
              </div>
            </div>

            {/* Word count indicator */}
            {hasPrompt && (
              <div className="flex items-center gap-2 text-xs">
                <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      wordCount >= 150 && wordCount <= 400
                        ? 'bg-green-500'
                        : wordCount > 400
                        ? 'bg-amber-500'
                        : 'bg-blue-500'
                    }`}
                    style={{ width: `${Math.min((wordCount / 400) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-muted-foreground whitespace-nowrap">
                  {wordCount >= 150 && wordCount <= 400
                    ? 'Good length'
                    : wordCount > 400
                    ? 'Consider trimming'
                    : 'Could be longer'}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Deploy Checklist */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Deploy Checklist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {deployChecks.map((check, idx) => (
              <div key={idx} className="flex items-center gap-3 py-1.5">
                {check.passed ? (
                  <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{check.label}</p>
                  <p className="text-xs text-muted-foreground">{check.detail}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Deploy / Undeploy Action */}
        {isDeployed ? (
          <Card className="border-green-500/20 bg-green-500/5">
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-center gap-2 text-green-600">
                <Rocket className="h-5 w-5" />
                <span className="font-semibold text-sm">Active for Session 3</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Your agent is deployed. Session 3 practice conversations will use your custom system prompt.
              </p>
              {agent.deployed_at && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Deployed: {new Date(agent.deployed_at).toLocaleDateString()}
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={onUndeploy}
                disabled={isDeploying}
                className="gap-2 w-full text-destructive hover:text-destructive"
              >
                <XCircle className="h-4 w-4" />
                Deactivate Agent
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-4 space-y-3">
              <Button
                onClick={onDeploy}
                disabled={!canDeploy || isDeploying}
                className="gap-2 w-full"
              >
                <Rocket className="h-4 w-4" />
                {isDeploying ? 'Deploying...' : 'Set as Active Agent'}
              </Button>
              {!canDeploy && (
                <p className="text-xs text-muted-foreground text-center">
                  Complete all checklist items above to deploy your agent.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* What deployment means */}
        <Card className="border-dashed">
          <CardContent className="pt-4">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              What happens when you deploy?
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0 mt-0.5" />
                Session 3 practice AI uses your custom system prompt
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0 mt-0.5" />
                A banner shows your agent name in Session 3
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0 mt-0.5" />
                You can update and re-deploy at any time
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0 mt-0.5" />
                Andrea will coach you on your deployed agent
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
