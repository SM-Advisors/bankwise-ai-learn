import { useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

export function useWorkspaceTour(sessionId: string | undefined, sessionTitle: string) {
  useEffect(() => {
    if (!sessionId) return;

    const storageKey = `tour_workspace_${sessionId}_done`;
    if (localStorage.getItem(storageKey)) return;

    // Wait for the workspace to fully render before starting the tour
    const timeout = setTimeout(() => {
      const driverObj = driver({
        showProgress: true,
        progressText: '{{current}} of {{total}}',
        onDestroyStarted: () => {
          localStorage.setItem(storageKey, 'true');
          driverObj.destroy();
        },
        steps: [
          {
            popover: {
              title: `Welcome to ${sessionTitle}`,
              description: "Here's a quick overview of your training workspace.",
              side: 'over' as const,
              align: 'center' as const,
            },
          },
          {
            element: '[data-tour="lesson-content"]',
            popover: {
              title: 'Training Modules',
              description: 'Browse and select modules here. Work through them in order to build your skills.',
              side: 'right' as const,
              align: 'center' as const,
            },
          },
          {
            element: '[data-tour="practice-area"]',
            popover: {
              title: 'Practice Area',
              description: 'Type your prompts and practice here. When ready, submit for Andrea\'s review.',
              side: 'left' as const,
              align: 'center' as const,
            },
          },
          {
            element: '[data-tour="andrea-panel"]',
            popover: {
              title: 'Andrea — Your AI Coach',
              description: 'Andrea coaches you in real time. She adapts to your responses and reviews your practice work.',
              side: 'left' as const,
              align: 'center' as const,
            },
          },
          {
            element: '[data-tour="quick-actions"]',
            popover: {
              title: 'Quick Actions',
              description: 'Ask for a review, see an example, or get a hint anytime using these buttons.',
              side: 'top' as const,
              align: 'center' as const,
            },
          },
        ],
      });

      driverObj.drive();
    }, 1200);

    return () => clearTimeout(timeout);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}
