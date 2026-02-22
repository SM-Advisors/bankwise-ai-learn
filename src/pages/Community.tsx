import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCommunityTopics } from '@/hooks/useCommunityTopics';
import { useCommunityReplies } from '@/hooks/useCommunityReplies';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, ArrowLeft, Plus, Loader2, Trash2, MessageCircle, Clock } from 'lucide-react';
import { ProfileDropdown } from '@/components/ProfileDropdown';

// Helper functions
const getFirstName = (displayName: string | null) => (displayName || 'Anonymous').split(' ')[0];
const getInitial = (name: string) => name.charAt(0).toUpperCase();
const formatRelativeTime = (dateStr: string) => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};
const formatRoleBadge = (role: string | null) => {
  if (!role) return 'Member';
  return role.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

export default function Community() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const { topics, loading: topicsLoading, createTopic, deleteTopic, refetch: refetchTopics } = useCommunityTopics();
  const { toast } = useToast();

  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [posting, setPosting] = useState(false);

  const selectedTopic = topics.find(t => t.id === selectedTopicId) || null;

  if (authLoading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleCreateTopic = async () => {
    if (!newTitle.trim()) {
      toast({ title: 'Title is required', variant: 'destructive' });
      return;
    }
    if (!newBody.trim()) {
      toast({ title: 'Body is required', variant: 'destructive' });
      return;
    }
    setPosting(true);
    const result = await createTopic(newTitle.trim(), newBody.trim());
    setPosting(false);
    if (result.success) {
      toast({ title: 'Topic posted' });
      setDialogOpen(false);
      setNewTitle('');
      setNewBody('');
    } else {
      toast({ title: result.error || 'Failed to post topic', variant: 'destructive' });
    }
  };

  const handleDeleteTopic = async (id: string) => {
    const result = await deleteTopic(id);
    if (result.success) {
      toast({ title: 'Topic deleted' });
      if (selectedTopicId === id) {
        setSelectedTopicId(null);
      }
    } else {
      toast({ title: 'Failed to delete topic', variant: 'destructive' });
    }
  };

  // ─── Topics List View ────────────────────────────────
  if (selectedTopicId === null) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-xl font-display font-bold flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Community Hub
                </h1>
                <p className="text-sm text-muted-foreground">
                  Share ideas and learn from fellow professionals
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ProfileDropdown />
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Summary + New Topic Button */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-muted-foreground">
              {topics.length === 0
                ? 'No discussions yet. Be the first to start a conversation!'
                : `${topics.length} topic${topics.length === 1 ? '' : 's'} in the community.`}
            </p>
            <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setNewTitle(''); setNewBody(''); } }}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Topic
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New Topic</DialogTitle>
                  <DialogDescription>
                    Start a discussion with your fellow banking professionals.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Title</label>
                    <Input
                      placeholder="e.g., Best practices for AI-assisted loan review"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Body</label>
                    <Textarea
                      placeholder="Share your thoughts, questions, or ideas..."
                      value={newBody}
                      onChange={(e) => setNewBody(e.target.value)}
                      rows={5}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => { setDialogOpen(false); setNewTitle(''); setNewBody(''); }}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTopic} disabled={posting}>
                    {posting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    Post
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Topics List */}
          {topicsLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : topics.length === 0 ? (
            <Card className="border-2 border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Users className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-medium mb-1">No topics yet</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Be the first to start a discussion in the community.
                </p>
                <Button className="gap-2" onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Start a Discussion
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {topics.map((topic) => (
                <Card
                  key={topic.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedTopicId(topic.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-9 w-9 shrink-0 mt-0.5">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                          {getInitial(topic.author_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base mb-0.5 truncate">{topic.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                          {topic.body}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">{topic.author_name}</span>
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            {formatRoleBadge(topic.author_role)}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" />
                            {topic.reply_count}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatRelativeTime(topic.created_at)}
                          </div>
                        </div>
                      </div>
                      {user && topic.user_id === user.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTopic(topic.id);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── Topic Detail View ────────────────────────────────
  return (
    <TopicDetailView
      topic={selectedTopic}
      userId={user?.id || null}
      profile={profile}
      onBack={() => {
        setSelectedTopicId(null);
        refetchTopics();
      }}
      onDeleteTopic={(id) => handleDeleteTopic(id)}
    />
  );
}

// Separate component to properly use the replies hook with the topicId
function TopicDetailView({
  topic,
  userId,
  profile,
  onBack,
  onDeleteTopic,
}: {
  topic: ReturnType<typeof useCommunityTopics>['topics'][0] | null;
  userId: string | null;
  profile: any;
  onBack: () => void;
  onDeleteTopic: (id: string) => void;
}) {
  const { replies, loading: repliesLoading, createReply, deleteReply } = useCommunityReplies(topic?.id || null);
  const { toast } = useToast();
  const [replyBody, setReplyBody] = useState('');
  const [replying, setReplying] = useState(false);

  if (!topic) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Topic not found.</p>
          <Button onClick={onBack}>Back to Topics</Button>
        </div>
      </div>
    );
  }

  const handleSubmitReply = async () => {
    if (!replyBody.trim()) {
      toast({ title: 'Reply cannot be empty', variant: 'destructive' });
      return;
    }
    setReplying(true);
    const result = await createReply(replyBody.trim());
    setReplying(false);
    if (result.success) {
      setReplyBody('');
      toast({ title: 'Reply posted' });
    } else {
      toast({ title: result.error || 'Failed to post reply', variant: 'destructive' });
    }
  };

  const handleDeleteReply = async (id: string) => {
    const result = await deleteReply(id);
    if (result.success) {
      toast({ title: 'Reply deleted' });
    } else {
      toast({ title: 'Failed to delete reply', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-display font-bold flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Community Hub
              </h1>
              <p className="text-sm text-muted-foreground">
                Topic Discussion
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ProfileDropdown />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Back button */}
        <Button variant="ghost" size="sm" className="gap-2 mb-4" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
          Back to Topics
        </Button>

        {/* Topic */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <h2 className="text-xl font-bold">{topic.title}</h2>
              {userId && topic.user_id === userId && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive shrink-0"
                  onClick={() => {
                    onDeleteTopic(topic.id);
                    onBack();
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {getInitial(topic.author_name)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{topic.author_name}</span>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {formatRoleBadge(topic.author_role)}
              </Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatRelativeTime(topic.created_at)}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{topic.body}</p>
          </CardContent>
        </Card>

        <Separator className="mb-6" />

        {/* Replies Section */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Replies ({replies.length})
          </h3>
        </div>

        {repliesLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : replies.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No replies yet. Be the first to respond!
          </div>
        ) : (
          <ScrollArea className="mb-6">
            <div className="space-y-3">
              {replies.map((reply) => (
                <Card key={reply.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8 shrink-0 mt-0.5">
                        <AvatarFallback className="bg-muted text-muted-foreground text-xs font-semibold">
                          {getInitial(reply.author_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{reply.author_name}</span>
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            {formatRoleBadge(reply.author_role)}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatRelativeTime(reply.created_at)}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{reply.body}</p>
                      </div>
                      {userId && reply.user_id === userId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive shrink-0"
                          onClick={() => handleDeleteReply(reply.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Reply Input */}
        <Card className="mt-4">
          <CardContent className="p-4">
            <div className="space-y-3">
              <Textarea
                placeholder="Write a reply..."
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                rows={3}
              />
              <div className="flex justify-end">
                <Button onClick={handleSubmitReply} disabled={replying} className="gap-2">
                  {replying && <Loader2 className="h-4 w-4 animate-spin" />}
                  <MessageCircle className="h-4 w-4" />
                  Reply
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
