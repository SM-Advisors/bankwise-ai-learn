import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { FeedbackModal } from './FeedbackModal';
import { useAuth } from '@/contexts/AuthContext';

export function FeedbackButton() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-[9998] flex items-center gap-2 px-4 py-2.5 rounded-full bg-destructive text-destructive-foreground shadow-lg hover:shadow-xl hover:bg-destructive/90 transition-all text-sm font-medium"
        aria-label="Submit feedback"
      >
        <MessageSquare className="h-4 w-4" />
        Feedback
      </button>
      <FeedbackModal open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}
