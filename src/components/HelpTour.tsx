import { useEffect, useRef } from 'react';
import { driver, type Driver } from 'driver.js';
import 'driver.js/dist/driver.css';

interface HelpTourProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

export function HelpTour({ open, onOpenChange, onComplete }: HelpTourProps) {
  const driverRef = useRef<Driver | null>(null);

  useEffect(() => {
    if (!open) {
      // Clean up if tour was active and open went false externally
      if (driverRef.current?.isActive()) {
        driverRef.current.destroy();
        driverRef.current = null;
      }
      return;
    }

    const timeout = setTimeout(() => {
      const driverObj = driver({
        showProgress: true,
        progressText: '{{current}} of {{total}}',
        onDestroyStarted: () => {
          driverRef.current = null;
          onComplete?.();
          onOpenChange(false);
          driverObj.destroy();
        },
        steps: [
          {
            popover: {
              title: 'Welcome to SM Advisors AI Enablement!',
              description: "Let's show you around the platform. This quick tour highlights the key areas you'll use during your AI enablement journey.",
              side: 'over' as const,
              align: 'center' as const,
            },
          },
          {
            element: '[data-tour="profile-card"]',
            popover: {
              title: 'Your Profile & Progress',
              description: 'Your name, role, AI level, and overall training progress live here. It updates as you complete modules.',
              side: 'bottom' as const,
              align: 'start' as const,
            },
          },
          {
            element: '[data-tour="sessions-grid"]',
            popover: {
              title: 'Training Sessions',
              description: 'Four sessions take you from prompting basics to advanced AI integration. Complete them in order.',
              side: 'bottom' as const,
              align: 'center' as const,
            },
          },
          {
            element: '[data-tour="brainstorm-btn"]',
            popover: {
              title: 'AI Brainstorm',
              description: "Describe any task you're working on and Andrea will explore how AI can help — adapted to your skill level.",
              side: 'top' as const,
              align: 'center' as const,
            },
          },
          {
            element: '[data-tour="andrea-bubble"]',
            popover: {
              title: 'Andrea — Your AI Coach',
              description: 'Andrea is here on the dashboard for general questions and inside every training module.',
              side: 'left' as const,
              align: 'end' as const,
            },
          },
          {
            element: '[data-tour="live-feed"]',
            popover: {
              title: 'Live Enablement Feed',
              description: 'Watch real training videos and join live sessions here.',
              side: 'top' as const,
              align: 'start' as const,
            },
          },
          {
            element: '[data-tour="feedback-btn"]',
            popover: {
              title: 'Feedback',
              description: 'Use this to flag issues or share observations during your training.',
              side: 'top' as const,
              align: 'start' as const,
            },
          },
          {
            popover: {
              title: "You're all set!",
              description: "Start with Session 1 to begin building your AI skills. You can replay this tour anytime from the Help menu.",
              side: 'over' as const,
              align: 'center' as const,
            },
          },
        ],
      });

      driverRef.current = driverObj;
      driverObj.drive();
    }, 300);

    return () => clearTimeout(timeout);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
