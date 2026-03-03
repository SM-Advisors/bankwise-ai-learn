import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useFeatureGates } from '@/hooks/useFeatureGates';
import { useAuth } from '@/contexts/AuthContext';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import sparkLogo from '@/assets/SM ADVISORS SPARK_Merch_Transparent.svg';

// ─── NavRail ──────────────────────────────────────────────────────────────────
//
// Desktop: 56px wide vertical rail on the left edge.
// Mobile:  64px tall horizontal bar along the bottom edge.
//
// Progressive disclosure: Only zones returned by useFeatureGates().unlockedZones
// are rendered. Locked zones are completely absent from the DOM.

export function NavRail() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const { unlockedZones } = useFeatureGates();
  const { profile } = useAuth();

  // Resolve the actual path to navigate to for each zone.
  // The 'learn' zone goes to the user's current session, not always session 1.
  function resolveZonePath(zoneId: string, defaultPath: string): string {
    if (zoneId === 'learn') {
      const session = Math.min(profile?.current_session || 1, 4);
      return `/training/${session}`;
    }
    return defaultPath;
  }

  // Sub-paths that belong to each zone (for active highlighting when navigating
  // to a zone's sub-pages, e.g. /prompts is part of Explore zone).
  const ZONE_SUB_PATHS: Record<string, string[]> = {
    explore:   ['/prompts', '/ideas', '/electives', '/journey', '/certificates'],
    profile:   ['/settings', '/memories'],
    community: ['/community'],
    learn:     ['/training'],
  };

  function isActive(zoneId: string, zonePath: string): boolean {
    const path = location.pathname;
    if (zonePath === '/dashboard') return path === '/dashboard';
    // Check primary path
    if (path.startsWith(zonePath)) return true;
    // Check sub-paths for this zone
    const subPaths = ZONE_SUB_PATHS[zoneId] || [];
    return subPaths.some((sub) => path.startsWith(sub));
  }

  // ── Desktop rail ─────────────────────────────────────────────────────────
  if (!isMobile) {
    return (
      <nav
        aria-label="Main navigation"
        className="fixed left-0 top-0 z-40 flex h-screen w-14 flex-col items-center bg-primary py-3 gap-1"
      >
        {/* Logo */}
        <button
          onClick={() => navigate('/dashboard')}
          className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg transition-opacity hover:opacity-80"
          aria-label="Go to home"
        >
          <img src={sparkLogo} alt="SMILE" className="h-7 w-7 object-contain" />
        </button>

        {/* Zone icons */}
        <div className="flex flex-1 flex-col items-center gap-1">
          {unlockedZones.map((zone) => {
            const Icon = zone.icon;
            const active = isActive(zone.id, zone.path);

            return (
              <Tooltip key={zone.id} delayDuration={300}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => navigate(resolveZonePath(zone.id, zone.path))}
                    aria-label={zone.label}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'group flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-150',
                      active
                        ? 'bg-accent/20 text-accent'
                        : 'text-primary-foreground/60 hover:bg-white/10 hover:text-primary-foreground'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                  <p>{zone.label}</p>
                  <p className="text-xs text-muted-foreground">{zone.description}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </nav>
    );
  }

  // ── Mobile bottom bar ─────────────────────────────────────────────────────
  return (
    <nav
      aria-label="Main navigation"
      className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around bg-primary px-2"
    >
      {unlockedZones.map((zone) => {
        const Icon = zone.icon;
        const active = isActive(zone.path);

        return (
          <button
            key={zone.id}
            onClick={() => navigate(resolveZonePath(zone.id, zone.path))}
            aria-label={zone.label}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 transition-all',
              active
                ? 'text-accent'
                : 'text-primary-foreground/60 hover:text-primary-foreground'
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{zone.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
