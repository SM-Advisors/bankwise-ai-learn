import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { FeedbackModal } from './FeedbackModal';

export function FeedbackPill() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-destructive text-destructive bg-transparent text-sm font-medium hover:bg-destructive/10 transition-colors cursor-pointer"
        aria-label="Submit feedback"
      >
        <MessageSquare className="h-3.5 w-3.5" />
        Feedback
      </button>
      <FeedbackModal open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}
