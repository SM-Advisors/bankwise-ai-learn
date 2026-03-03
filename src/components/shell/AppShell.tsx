import { useRef, type ReactNode } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { NavRail } from './NavRail';
import { TopBar, type BreadcrumbItem } from './TopBar';
import { AndreaDock, type AndreaDockHandle } from './AndreaDock';
import { useAndreaTriggers } from '@/hooks/useAndreaTriggers';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AppShellProps {
  children: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  /** Optional contextual actions rendered in the TopBar right slot */
  topBarActions?: ReactNode;
  /** Optional class on the content <main> wrapper */
  contentClassName?: string;
}

// ─── AppShell ─────────────────────────────────────────────────────────────────
//
// Persistent application shell. The user never "leaves" this shell —
// the content area changes while NavRail, TopBar, and AndreaDock remain constant.
//
// Desktop layout:
//   [NavRail 56px] | [TopBar 64px + Content Area]
//
// Mobile layout:
//   [TopBar 64px + Content Area]
//   [BottomBar 64px]  ← NavRail renders as bottom tab bar

export function AppShell({
  children,
  breadcrumbs,
  topBarActions,
  contentClassName,
}: AppShellProps) {
  const isMobile = useIsMobile();
  const andreaRef = useRef<AndreaDockHandle>(null);
  const { handleDismiss } = useAndreaTriggers(andreaRef);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop NavRail — hidden on mobile (renders as bottom bar) */}
      {!isMobile && <NavRail />}

      {/* Main column */}
      <div
        className={cn(
          'flex flex-1 flex-col min-w-0',
          // Offset for desktop nav rail
          !isMobile && 'ml-14'
        )}
      >
        <TopBar breadcrumbs={breadcrumbs} actions={topBarActions} />

        <main
          className={cn(
            'flex-1 overflow-y-auto',
            // Extra bottom padding on mobile so content clears the bottom bar
            isMobile && 'pb-16',
            contentClassName
          )}
        >
          {children}
        </main>
      </div>

      {/* Mobile NavRail renders as bottom bar — outside main column so it overlays */}
      {isMobile && <NavRail />}

      {/* Andrea Dock — persistent across all views */}
      <AndreaDock ref={andreaRef} onDismiss={handleDismiss} />
    </div>
  );
}
