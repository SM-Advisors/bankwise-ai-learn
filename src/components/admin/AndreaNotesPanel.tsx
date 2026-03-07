import { Trash2, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminAndreaNotes } from '@/hooks/useAdminAndreaChat';
import { format } from 'date-fns';

interface AndreaNotesPanelProps {
  organizationId?: string | null;
}

export function AndreaNotesPanel({ organizationId }: AndreaNotesPanelProps) {
  const { notes, loading, deleteNote } = useAdminAndreaNotes(organizationId || null);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FileText className="h-10 w-10 text-muted-foreground/40 mb-3" />
        <p className="text-sm font-medium text-muted-foreground">No notes yet</p>
        <p className="text-xs text-muted-foreground/70 mt-1 max-w-xs">
          Use the "Summarize" button in Andrea's chat to save conversation summaries here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notes.map((note) => (
        <Card key={note.id} className="relative group">
          <CardContent className="p-4">
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{note.summary}</p>
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-muted-foreground">
                {format(new Date(note.created_at), 'MMM d, yyyy · h:mm a')}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                onClick={() => deleteNote(note.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
