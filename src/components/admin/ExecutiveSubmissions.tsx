import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Building2, Lightbulb, AlertCircle, Bot, GitBranch, Clock, ChevronDown, ChevronRight, Download } from 'lucide-react';

type SubmissionStatus = 'submitted' | 'reviewed' | 'acknowledged' | 'in_progress' | 'archived';
type SubmissionType = 'idea' | 'friction_point' | 'shared_agent' | 'shared_workflow';

interface ExecutiveSubmission {
  id: string;
  user_id: string;
  submission_type: SubmissionType;
  title: string;
  body: string;
  status: SubmissionStatus;
  reviewer_notes: string | null;
  reviewed_at: string | null;
  created_at: string;
}

const STATUS_CONFIG: Record<SubmissionStatus, { label: string; className: string }> = {
  submitted: { label: 'Submitted', className: 'bg-blue-500/10 text-blue-700 dark:text-blue-300' },
  reviewed: { label: 'Reviewed', className: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300' },
  acknowledged: { label: 'Acknowledged', className: 'bg-green-500/10 text-green-700 dark:text-green-300' },
  in_progress: { label: 'In Progress', className: 'bg-purple-500/10 text-purple-700 dark:text-purple-300' },
  archived: { label: 'Archived', className: 'bg-slate-500/10 text-slate-600 dark:text-slate-400' },
};

const TYPE_ICONS: Record<SubmissionType, React.ReactNode> = {
  idea: <Lightbulb className="h-4 w-4 text-yellow-500" />,
  friction_point: <AlertCircle className="h-4 w-4 text-orange-500" />,
  shared_agent: <Bot className="h-4 w-4 text-blue-500" />,
  shared_workflow: <GitBranch className="h-4 w-4 text-purple-500" />,
};

const TYPE_LABELS: Record<SubmissionType, string> = {
  idea: 'Idea',
  friction_point: 'Friction Point',
  shared_agent: 'Shared Agent',
  shared_workflow: 'Shared Workflow',
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

interface ExecutiveSubmissionsProps {
  organizationId?: string | null;
}

export function ExecutiveSubmissions({ organizationId }: ExecutiveSubmissionsProps) {
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<ExecutiveSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<SubmissionStatus | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [noteValues, setNoteValues] = useState<Record<string, string>>({});

  const fetchSubmissions = async () => {
    setLoading(true);

    // Get org user_ids for filtering if org-scoped
    let orgUserIds: Set<string> | null = null;
    if (organizationId) {
      const { data: profiles } = await (supabase
        .from('user_profiles' as any)
        .select('user_id')
        .eq('organization_id', organizationId) as any);
      orgUserIds = new Set((profiles || []).map((p: any) => p.user_id));
    }

    const { data, error } = await (supabase
      .from('executive_submissions' as any)
      .select('*')
      .order('created_at', { ascending: false }) as any);

    if (error) {
      console.error('Failed to load submissions:', error);
      toast({ title: 'Failed to load submissions', variant: 'destructive' });
    } else {
      const filtered = orgUserIds
        ? (data || []).filter((s: any) => orgUserIds!.has(s.user_id))
        : (data || []);
      setSubmissions(filtered);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSubmissions();
  }, [organizationId]);

  const updateSubmission = async (id: string, status: SubmissionStatus) => {
    setUpdatingId(id);
    const notes = noteValues[id] ?? null;
    const { error } = await (supabase
      .from('executive_submissions' as any)
      .update({
        status,
        reviewer_notes: notes,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id) as any);

    if (error) {
      toast({ title: 'Failed to update', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Status updated' });
      setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status, reviewer_notes: notes, reviewed_at: new Date().toISOString() } : s));
    }
    setUpdatingId(null);
  };

  const displayed = statusFilter === 'all' ? submissions : submissions.filter(s => s.status === statusFilter);

  const handleExportCSV = () => {
    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
    const rows = [
      `Executive Submissions Export — ${date}`,
      '',
      '"Title","Type","Status","Reviewer Notes","Created","Reviewed"',
      ...submissions.map((s) =>
        `"${(s.title ?? '').replace(/"/g, '""')}","${TYPE_LABELS[s.submission_type] ?? s.submission_type}","${STATUS_CONFIG[s.status]?.label ?? s.status}","${(s.reviewer_notes ?? '').replace(/"/g, '""')}","${s.created_at ? new Date(s.created_at).toLocaleDateString() : ''}","${s.reviewed_at ? new Date(s.reviewed_at).toLocaleDateString() : ''}"`
      ),
    ];
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `submissions-${date}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters + Export */}
      <div className="flex items-center gap-3 flex-wrap">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <div className="flex items-center gap-1.5 flex-wrap">
          {(['all', 'submitted', 'reviewed', 'acknowledged', 'in_progress', 'archived'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                statusFilter === s
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-muted-foreground hover:border-primary/50'
              }`}
            >
              {s === 'all' ? 'All' : STATUS_CONFIG[s].label}
              {s !== 'all' && (
                <span className="ml-1 opacity-60">
                  ({submissions.filter(sub => sub.status === s).length})
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 ml-auto">
          <span className="text-xs text-muted-foreground">{displayed.length} submission{displayed.length !== 1 ? 's' : ''}</span>
          <Button size="sm" variant="outline" className="gap-1.5 h-7 text-xs" onClick={handleExportCSV}>
            <Download className="h-3 w-3" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Submissions list */}
      {displayed.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No submissions{statusFilter !== 'all' ? ` with status "${STATUS_CONFIG[statusFilter as SubmissionStatus]?.label}"` : ''}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {displayed.map((sub) => {
            const isExpanded = expandedId === sub.id;
            const statusCfg = STATUS_CONFIG[sub.status];
            return (
              <Card key={sub.id} className="overflow-hidden">
                {/* Summary row */}
                <button
                  className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-muted/30 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : sub.id)}
                >
                  <div className="shrink-0 mt-0.5">{TYPE_ICONS[sub.submission_type]}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">{sub.title}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${statusCfg.className}`}>
                        {statusCfg.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                        {TYPE_LABELS[sub.submission_type]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
                      <Clock className="h-2.5 w-2.5" />
                      {formatDate(sub.created_at)}
                    </div>
                  </div>
                  {isExpanded
                    ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  }
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t px-4 py-4 space-y-4">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{sub.body}</p>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Reviewer Notes
                      </label>
                      <Textarea
                        value={noteValues[sub.id] ?? sub.reviewer_notes ?? ''}
                        onChange={(e) => setNoteValues(prev => ({ ...prev, [sub.id]: e.target.value }))}
                        placeholder="Add notes for this submission..."
                        rows={2}
                        className="text-sm resize-none"
                      />
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-muted-foreground">Update status:</span>
                      <Select
                        value={sub.status}
                        onValueChange={(v) => updateSubmission(sub.id, v as SubmissionStatus)}
                        disabled={updatingId === sub.id}
                      >
                        <SelectTrigger className="w-40 h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-card">
                          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                            <SelectItem key={key} value={key} className="text-xs">{cfg.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {updatingId === sub.id && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
                    </div>

                    {sub.reviewed_at && (
                      <p className="text-[10px] text-muted-foreground">Last reviewed: {formatDate(sub.reviewed_at)}</p>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
