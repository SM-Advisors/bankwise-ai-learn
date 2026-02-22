import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCommunityTopics } from '@/hooks/useCommunityTopics';
import { useCommunityReplies } from '@/hooks/useCommunityReplies';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Users, Plus, Loader2, Trash2, MessageCircle, Clock,
  ArrowLeft, Link2, Paperclip, ExternalLink,
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────
const getFirstName = (displayName: string | null) =>
  (displayName || 'Anonymous').split(' ')[0];
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
  return role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

// ─── URL detection ────────────────────────────────────
const URL_REGEX = /(https?:\/\/[^\s<]+[^\s<.,;:!?"')\]])/gi;

function RichText({ text }: { text: string }) {
  const parts = text.split(URL_REGEX);
  return (
    <span>
      {parts.map((part, i) =>
        URL_REGEX.test(part) ? (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-2 hover:text-primary/80 inline-flex items-center gap-0.5 break-all"
            onClick={(e) => e.stopPropagation()}
          >
            {part.length > 60 ? part.slice(0, 57) + '...' : part}
            <ExternalLink className="h-3 w-3 shrink-0 inline" />
          </a>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}

// ─── Attachment rendering ─────────────────────────────
function AttachmentList({ attachments }: { attachments: string[] }) {
  if (!attachments.length) return null;
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {attachments.map((url, i) => {
        const isImage = /\.(png|jpe?g|gif|webp|svg)$/i.test(url);
        if (isImage) {
          return (
            <a key={i} href={url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
              <img
                src={url}
                alt="attachment"
                className="h-20 w-20 rounded-md object-cover border hover:opacity-80 transition-opacity"
              />
            </a>
          );
        }
        const filename = url.split('/').pop() || 'attachment';
        return (
          <a
            key={i}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs bg-muted px-2.5 py-1.5 rounded-md hover:bg-muted/80 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <Paperclip className="h-3 w-3" />
            {filename.length > 30 ? filename.slice(0, 27) + '...' : filename}
          </a>
        );
      })}
    </div>
  );
}

// ─── Link input helper ────────────────────────────────
function LinkAttachmentInput({
  links,
  onAddLink,
  onRemoveLink,
}: {
  links: string[];
  onAddLink: (url: string) => void;
  onRemoveLink: (idx: number) => void;
}) {
  const [inputVal, setInputVal] = useState('');
  const handleAdd = () => {
    const trimmed = inputVal.trim();
    if (!trimmed) return;
    onAddLink(trimmed);
    setInputVal('');
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Link2 className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Paste a link or file URL..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAdd(); } }}
            className="pl-8 text-xs h-8"
          />
        </div>
        <Button variant="outline" size="sm" className="h-8 text-xs" onClick={handleAdd} disabled={!inputVal.trim()}>
          Add
        </Button>
      </div>
      {links.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {links.map((link, i) => (
            <Badge key={i} variant="secondary" className="gap-1 text-[10px] pr-1 max-w-[200px]">
              <Paperclip className="h-2.5 w-2.5 shrink-0" />
              <span className="truncate">{link.split('/').pop() || link}</span>
              <button
                onClick={() => onRemoveLink(i)}
                className="ml-0.5 text-muted-foreground hover:text-destructive"
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Parse attachments from body ──────────────────────
// Attachments are stored as [attachments:url1,url2] at the end of the body
const ATTACHMENT_REGEX = /\[attachments:(.*?)\]\s*$/;

function parseBodyAndAttachments(raw: string): { text: string; attachments: string[] } {
  const match = raw.match(ATTACHMENT_REGEX);
  if (!match) return { text: raw, attachments: [] };
  const text = raw.slice(0, match.index).trimEnd();
  const attachments = match[1].split(',').map((s) => s.trim()).filter(Boolean);
  return { text, attachments };
}

function encodeAttachments(body: string, links: string[]): string {
  if (!links.length) return body;
  return `${body}\n[attachments:${links.join(',')}]`;
}

// ══════════════════════════════════════════════════════
// Community Feed — Inline dashboard component
// ══════════════════════════════════════════════════════
export function CommunityFeed() {
  const { user, profile, loading: authLoading } = useAuth();
  const { topics, loading: topicsLoading, createTopic, deleteTopic, refetch: refetchTopics } = useCommunityTopics();
  const { toast } = useToast();

  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newLinks, setNewLinks] = useState<string[]>([]);
  const [posting, setPosting] = useState(false);

  const selectedTopic = topics.find((t) => t.id === selectedTopicId) || null;

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
    const bodyWithAttachments = encodeAttachments(newBody.trim(), newLinks);
    const result = await createTopic(newTitle.trim(), bodyWithAttachments);
    setPosting(false);
    if (result.success) {
      toast({ title: 'Topic posted' });
      setDialogOpen(false);
      setNewTitle('');
      setNewBody('');
      setNewLinks([]);
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

  // ─── Loading ─────────────────────────────────────
  if (authLoading || !profile) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // ─── Topic Detail ────────────────────────────────
  if (selectedTopicId !== null && selectedTopic) {
    return (
      <TopicDetailInline
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

  // ─── Topics List ─────────────────────────────────
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-muted-foreground">
          {topics.length === 0
            ? 'Start a conversation!'
            : `${topics.length} topic${topics.length === 1 ? '' : 's'}`}
        </p>
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) { setNewTitle(''); setNewBody(''); setNewLinks([]); }
          }}
        >
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5 h-7 text-xs">
              <Plus className="h-3.5 w-3.5" />
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
                  placeholder="Share your thoughts, questions, or ideas... Paste links directly in the text or add them below."
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  rows={4}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Links & Attachments</label>
                <LinkAttachmentInput
                  links={newLinks}
                  onAddLink={(url) => setNewLinks((prev) => [...prev, url])}
                  onRemoveLink={(idx) => setNewLinks((prev) => prev.filter((_, i) => i !== idx))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => { setDialogOpen(false); setNewTitle(''); setNewBody(''); setNewLinks([]); }}
              >
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

      {/* Feed */}
      <ScrollArea className="flex-1 -mx-1 px-1" style={{ maxHeight: '320px' }}>
        {topicsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : topics.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Users className="h-8 w-8 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground mb-2">No topics yet</p>
            <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => setDialogOpen(true)}>
              <Plus className="h-3.5 w-3.5" />
              Start a Discussion
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {topics.map((topic) => {
              const { text: bodyText, attachments } = parseBodyAndAttachments(topic.body);
              return (
                <div
                  key={topic.id}
                  className="p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedTopicId(topic.id)}
                >
                  <div className="flex items-start gap-2.5">
                    <Avatar className="h-7 w-7 shrink-0 mt-0.5">
                      <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                        {getInitial(topic.author_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate">{topic.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        <RichText text={bodyText} />
                      </p>
                      {attachments.length > 0 && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                          <Paperclip className="h-3 w-3" />
                          {attachments.length} attachment{attachments.length > 1 ? 's' : ''}
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground">
                        <span className="font-medium text-foreground">{topic.author_name}</span>
                        <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4">
                          {formatRoleBadge(topic.author_role)}
                        </Badge>
                        <span className="flex items-center gap-0.5">
                          <MessageCircle className="h-2.5 w-2.5" />
                          {topic.reply_count}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <Clock className="h-2.5 w-2.5" />
                          {formatRelativeTime(topic.created_at)}
                        </span>
                      </div>
                    </div>
                    {user && topic.user_id === user.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTopic(topic.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// Topic Detail — Inline version (no page navigation)
// ══════════════════════════════════════════════════════
function TopicDetailInline({
  topic,
  userId,
  profile,
  onBack,
  onDeleteTopic,
}: {
  topic: ReturnType<typeof useCommunityTopics>['topics'][0];
  userId: string | null;
  profile: any;
  onBack: () => void;
  onDeleteTopic: (id: string) => void;
}) {
  const { replies, loading: repliesLoading, createReply, deleteReply } = useCommunityReplies(topic.id);
  const { toast } = useToast();
  const [replyBody, setReplyBody] = useState('');
  const [replyLinks, setReplyLinks] = useState<string[]>([]);
  const [replying, setReplying] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);

  const { text: topicText, attachments: topicAttachments } = parseBodyAndAttachments(topic.body);

  const handleSubmitReply = async () => {
    if (!replyBody.trim()) {
      toast({ title: 'Reply cannot be empty', variant: 'destructive' });
      return;
    }
    setReplying(true);
    const bodyWithAttachments = encodeAttachments(replyBody.trim(), replyLinks);
    const result = await createReply(bodyWithAttachments);
    setReplying(false);
    if (result.success) {
      setReplyBody('');
      setReplyLinks([]);
      setShowLinkInput(false);
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
    <div className="flex flex-col h-full">
      {/* Back + Title */}
      <div className="flex items-center gap-2 mb-3">
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h4 className="text-sm font-semibold truncate flex-1">{topic.title}</h4>
        {userId && topic.user_id === userId && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-destructive hover:text-destructive shrink-0"
            onClick={() => { onDeleteTopic(topic.id); onBack(); }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {/* Topic Body */}
      <div className="p-3 rounded-lg border bg-muted/30 mb-3">
        <div className="flex items-center gap-2 mb-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
              {getInitial(topic.author_name)}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs font-medium">{topic.author_name}</span>
          <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4">
            {formatRoleBadge(topic.author_role)}
          </Badge>
          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 ml-auto">
            <Clock className="h-2.5 w-2.5" />
            {formatRelativeTime(topic.created_at)}
          </span>
        </div>
        <p className="text-xs whitespace-pre-wrap leading-relaxed">
          <RichText text={topicText} />
        </p>
        <AttachmentList attachments={topicAttachments} />
      </div>

      <Separator className="mb-2" />

      {/* Replies */}
      <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
        <MessageCircle className="h-3.5 w-3.5" />
        {replies.length} repl{replies.length === 1 ? 'y' : 'ies'}
      </div>

      <ScrollArea className="flex-1 -mx-1 px-1 mb-3" style={{ maxHeight: '180px' }}>
        {repliesLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : replies.length === 0 ? (
          <div className="text-center py-4 text-xs text-muted-foreground">
            No replies yet. Be the first to respond!
          </div>
        ) : (
          <div className="space-y-2">
            {replies.map((reply) => {
              const { text: replyText, attachments: replyAttachments } = parseBodyAndAttachments(reply.body);
              return (
                <div key={reply.id} className="p-2.5 rounded-md border">
                  <div className="flex items-start gap-2">
                    <Avatar className="h-6 w-6 shrink-0 mt-0.5">
                      <AvatarFallback className="bg-muted text-muted-foreground text-[10px] font-semibold">
                        {getInitial(reply.author_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-xs font-medium">{reply.author_name}</span>
                        <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4">
                          {formatRoleBadge(reply.author_role)}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          <Clock className="h-2.5 w-2.5" />
                          {formatRelativeTime(reply.created_at)}
                        </span>
                      </div>
                      <p className="text-xs whitespace-pre-wrap">
                        <RichText text={replyText} />
                      </p>
                      <AttachmentList attachments={replyAttachments} />
                    </div>
                    {userId && reply.user_id === userId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 text-muted-foreground hover:text-destructive shrink-0"
                        onClick={() => handleDeleteReply(reply.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Reply Composer */}
      <div className="space-y-2 pt-2 border-t">
        <Textarea
          placeholder="Write a reply... Paste links directly in your text."
          value={replyBody}
          onChange={(e) => setReplyBody(e.target.value)}
          rows={2}
          className="text-xs resize-none"
        />
        {showLinkInput && (
          <LinkAttachmentInput
            links={replyLinks}
            onAddLink={(url) => setReplyLinks((prev) => [...prev, url])}
            onRemoveLink={(idx) => setReplyLinks((prev) => prev.filter((_, i) => i !== idx))}
          />
        )}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1.5 text-muted-foreground"
            onClick={() => setShowLinkInput(!showLinkInput)}
          >
            <Paperclip className="h-3.5 w-3.5" />
            {showLinkInput ? 'Hide' : 'Attach'}
          </Button>
          <Button size="sm" onClick={handleSubmitReply} disabled={replying} className="gap-1.5 h-7 text-xs">
            {replying && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Reply
          </Button>
        </div>
      </div>
    </div>
  );
}
