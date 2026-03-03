import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { FeedbackModal } from './FeedbackModal';

export function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        data-tour="feedback-btn"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-[9998] flex items-center gap-2 px-4 py-2.5 rounded-full border-2 border-destructive text-destructive bg-white shadow-lg hover:shadow-xl hover:bg-destructive/10 transition-all text-sm font-medium"
        aria-label="Submit feedback"
      >
        <MessageSquare className="h-4 w-4" />
        Feedback
      </button>
      <FeedbackModal open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}
