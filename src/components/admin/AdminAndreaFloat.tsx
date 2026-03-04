import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CSuiteAdvisorPanel } from '@/components/admin/CSuiteAdvisorPanel';
import andreaCoach from '@/assets/andrea-coach.png';

interface AdminAndreaFloatProps {
  organizationId?: string | null;
}

/**
 * Floating Andrea bubble for the Admin Dashboard.
 * Mirrors the DashboardChat floating pattern — a fixed bottom-right button
 * that opens the C-Suite Advisor Panel as an overlay.
 */
export function AdminAndreaFloat({ organizationId }: AdminAndreaFloatProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[9999] h-20 w-20 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 overflow-hidden border-2 border-primary/30 bg-white"
        aria-label="Open Andrea — C-Suite AI Advisor"
        title="Andrea — C-Suite AI Advisor"
      >
        <img src={andreaCoach} alt="Andrea" className="h-full w-full object-cover" />
        {/* Status dot */}
        <span className="absolute bottom-1 right-1 h-3 w-3 rounded-full bg-green-500 border-2 border-white" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-2">
      {/* Close button above the panel */}
      <Button
        size="icon"
        variant="outline"
        className="h-8 w-8 rounded-full shadow"
        onClick={() => setIsOpen(false)}
        aria-label="Close Andrea panel"
      >
        <X className="h-4 w-4" />
      </Button>

      {/* C-Suite Advisor panel */}
      <Card className="w-[480px] h-[700px] overflow-hidden shadow-2xl flex flex-col [&>div]:h-full">
        <CSuiteAdvisorPanel organizationId={organizationId} />
      </Card>
    </div>
  );
}
