import { useState } from 'react';
import { useAllIdeas } from '@/hooks/useReporting';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Lightbulb, Filter } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'not_started', label: 'Not Started', color: 'bg-gray-500' },
  { value: 'needs_knowledge', label: 'Needs Knowledge', color: 'bg-yellow-500' },
  { value: 'future', label: 'Future', color: 'bg-blue-500' },
];

const STATUS_BADGE: Record<string, { variant: 'default' | 'secondary' | 'outline'; label: string }> = {
  not_started: { variant: 'outline', label: 'Not Started' },
  needs_knowledge: { variant: 'secondary', label: 'Needs Knowledge' },
  future: { variant: 'default', label: 'Future' },
};

interface IdeasInboxProps {
  organizationId?: string | null;
}

export function IdeasInbox({ organizationId }: IdeasInboxProps) {
  const { ideas, loading, updateIdeaStatus } = useAllIdeas(organizationId);
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const filteredIdeas = statusFilter
    ? ideas.filter((i) => i.status === statusFilter)
    : ideas;

  const handleStatusChange = async (id: string, newStatus: string) => {
    const result = await updateIdeaStatus(id, newStatus);
    if (result.success) {
      toast({ title: 'Status updated' });
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Lightbulb className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{ideas.length}</p>
                <p className="text-sm text-muted-foreground">Total Ideas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        {STATUS_OPTIONS.map((status) => (
          <Card key={status.value}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className={`h-3 w-3 rounded-full ${status.color}`} />
                <div>
                  <p className="text-2xl font-bold">
                    {ideas.filter((i) => i.status === status.value).length}
                  </p>
                  <p className="text-sm text-muted-foreground">{status.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">Filter:</span>
        <Button
          variant={statusFilter === null ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter(null)}
        >
          All ({ideas.length})
        </Button>
        {STATUS_OPTIONS.map((status) => (
          <Button
            key={status.value}
            variant={statusFilter === status.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(status.value)}
          >
            {status.label}
          </Button>
        ))}
      </div>

      {/* Ideas List */}
      {filteredIdeas.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Lightbulb className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No ideas found</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredIdeas.map((idea) => {
            const badge = STATUS_BADGE[idea.status] || STATUS_BADGE.not_started;
            return (
              <Card key={idea.id}>
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{idea.title}</h4>
                        <Badge variant={badge.variant} className="text-xs">
                          {badge.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{idea.description}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(idea.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {STATUS_OPTIONS.filter((s) => s.value !== idea.status).map((status) => (
                        <Button
                          key={status.value}
                          variant="ghost"
                          size="sm"
                          className="text-xs"
                          onClick={() => handleStatusChange(idea.id, status.value)}
                        >
                          {status.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
