import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Paperclip, X } from 'lucide-react';

interface FeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export function FeedbackModal({ open, onOpenChange }: FeedbackModalProps) {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setFileError('');
    if (selected && selected.size > MAX_FILE_SIZE) {
      setFileError('File exceeds the 5 MB limit.');
      setFile(null);
      e.target.value = '';
      return;
    }
    setFile(selected);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const blob = item.getAsFile();
        if (!blob) return;
        if (blob.size > MAX_FILE_SIZE) {
          setFileError('Pasted image exceeds the 5 MB limit.');
          return;
        }
        setFileError('');
        setFile(new File([blob], `screenshot-${Date.now()}.png`, { type: blob.type }));
        return;
      }
    }
  };

  const removeFile = () => {
    setFile(null);
    setFileError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const readFileAsBase64 = (f: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(f);
    });

  const handleSubmit = async () => {
    if (!message.trim() || !user) return;
    setIsSubmitting(true);
    try {
      let fileData: string | null = null;
      let fileName: string | null = null;
      let fileType: string | null = null;

      if (file) {
        fileData = await readFileAsBase64(file);
        fileName = file.name;
        fileType = file.type;
      }

      const userName = profile?.display_name || user.email || 'Unknown';

      const { error } = await (supabase
        .from('user_feedback' as any)
        .insert({
          user_id: user.id,
          user_name: userName,
          message: message.trim(),
          file_name: fileName,
          file_type: fileType,
          file_data: fileData,
        }) as any);

      if (error) throw error;

      toast({ title: 'Feedback submitted!', description: 'Thank you for your feedback.' });
      setMessage('');
      setFile(null);
      setFileError('');
      onOpenChange(false);
    } catch (err) {
      console.error('Feedback submit error:', err);
      toast({ title: 'Failed to submit feedback', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setMessage('');
      setFile(null);
      setFileError('');
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Submit Feedback</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            placeholder="Describe what you found, what worked, or what didn't... You can also paste a screenshot (Ctrl+V / ⌘V)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onPaste={handlePaste}
            rows={5}
            className="resize-none"
          />

          {/* File attachment */}
          {file ? (
            <div className="flex items-center gap-2 text-sm border rounded-md px-3 py-2 bg-muted">
              <Paperclip className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="flex-1 truncate">{file.name}</span>
              <span className="text-xs text-muted-foreground shrink-0">
                {(file.size / 1024).toFixed(0)} KB
              </span>
              <button onClick={removeFile} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                id="feedback-file"
                className="sr-only"
                accept="image/*,.pdf,.doc,.docx,.txt"
                onChange={handleFileChange}
              />
              <label
                htmlFor="feedback-file"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
              >
                <Paperclip className="h-4 w-4" />
                Attach a file (screenshot, PDF, etc.) — max 5 MB
              </label>
            </div>
          )}

          {fileError && <p className="text-sm text-destructive">{fileError}</p>}

          <Button
            onClick={handleSubmit}
            disabled={!message.trim() || isSubmitting}
            className="w-full"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Submit Feedback
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
