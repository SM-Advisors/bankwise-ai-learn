import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Clock, Loader2, MessageSquare } from 'lucide-react';

interface PendingTopic {
  id: string;
  user_id: string;
  author_name: string;
  author_role: string | null;
  title: string;
  body: string;
  category: string | null;
  created_at: string;
}

interface CommunityReviewQueueProps {
  organizationId?: string | null;
}

export function CommunityReviewQueue({ organizationId }: CommunityReviewQueueProps) {
  const { toast } = useToast();
  const [topics, setTopics] = useState<PendingTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const fetchPending = useCallback(async () => {
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
      .from('community_topics' as any)
      .select('id, user_id, author_name, author_role, title, body, category, created_at')
      .eq('status', 'pending')
      .order('created_at', { ascending: true }) as any);

    if (!error) {
      const filtered = orgUserIds
        ? (data || []).filter((t: any) => orgUserIds!.has(t.user_id))
        : (data || []);
      setTopics(filtered);
    }
    setLoading(false);
  }, [organizationId]);

  useEffect(() => { fetchPending(); }, [fetchPending]);

  const handleAction = async (id: string, action: 'approved' | 'rejected') => {
    setActioningId(id);
    const { error } = await (supabase
      .from('community_topics' as any)
      .update({ status: action })
      .eq('id', id) as any);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({
        title: action === 'approved' ? 'Post approved' : 'Post rejected',
        description: action === 'approved'
          ? 'The post is now visible to all users.'
          : 'The post has been rejected and will not be published.',
      });
      setTopics(prev => prev.filter(t => t.id !== id));
    }
    setActioningId(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Community Review Queue
        </CardTitle>
        <CardDescription>
          Review and approve community posts before they are visible to all users.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : topics.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <CheckCircle className="h-10 w-10 mx-auto mb-3 text-green-500/50" />
            <p className="font-medium">All caught up!</p>
            <p className="text-sm">No posts pending review.</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[600px]">
            <div className="space-y-4">
              {topics.map((topic) => (
                <div key={topic.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                        {topic.category && (
                          <Badge variant="secondary" className="text-xs capitalize">
                            {topic.category.replace(/_/g, ' ')}
                          </Badge>
                        )}
                      </div>
                      <h4 className="font-semibold truncate">{topic.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        by {topic.author_name}{topic.author_role ? ` · ${topic.author_role}` : ''} ·{' '}
                        {new Date(topic.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3">{topic.body}</p>
                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      className="gap-1.5 bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleAction(topic.id, 'approved')}
                      disabled={actioningId === topic.id}
                    >
                      {actioningId === topic.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10"
                      onClick={() => handleAction(topic.id, 'rejected')}
                      disabled={actioningId === topic.id}
                    >
                      <XCircle className="h-3 w-3" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
