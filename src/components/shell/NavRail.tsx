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
import { ChevronRight, ChevronLeft, User, LayoutDashboard, ShieldCheck, Settings, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUserRole } from '@/hooks/useUserRole';
import sparkLogo from '@/assets/spark-icon.png';
import smAdvisorsLogo from '@/assets/sm-advisors-logo-full.png';

// ─── NavRail ──────────────────────────────────────────────────────────────────
//
// Desktop: collapsible vertical rail on the left edge.
//   Collapsed (56px): spark logo + icon-only nav + user initials
//   Expanded  (240px): SM Advisors logo + icon+label+description + user name
// Mobile: 64px tall horizontal bar along the bottom edge.

interface NavRailProps {
  isExpanded: boolean;
  onToggle: () => void;
}

export function NavRail({ isExpanded, onToggle }: NavRailProps) {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const { unlockedZones } = useFeatureGates();
  const { profile, signOut } = useAuth();
  const { isAdmin } = useUserRole();

  const initials = profile?.display_name
    ? profile.display_name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  function resolveZonePath(zoneId: string, defaultPath: string): string {
    if (zoneId === 'learn') {
      const session = Math.min(profile?.current_session || 1, 4);
      return `/training/${session}`;
    }
    return defaultPath;
  }

  const ZONE_SUB_PATHS: Record<string, string[]> = {
    explore:   ['/prompts', '/ideas', '/electives', '/journey', '/certificates'],
    profile:   ['/settings', '/memories', '/profile'],
    community: ['/community'],
    learn:     ['/training'],
  };

  function isActive(zoneId: string, zonePath: string): boolean {
    const path = location.pathname;
    if (zonePath === '/dashboard') return path === '/dashboard';
    if (path.startsWith(zonePath)) return true;
    const subPaths = ZONE_SUB_PATHS[zoneId] || [];
    return subPaths.some((sub) => path.startsWith(sub));
  }

  // ── Desktop rail ─────────────────────────────────────────────────────────
  if (!isMobile) {
    return (
      <nav
        aria-label="Main navigation"
        onClick={(e) => {
          if (e.target === e.currentTarget) onToggle();
        }}
        className={cn(
          'fixed left-0 top-0 z-40 flex h-screen flex-col bg-primary transition-all duration-200 overflow-hidden cursor-pointer',
          isExpanded ? 'w-60' : 'w-14'
        )}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        {isExpanded ? (
          <div className="flex h-16 shrink-0 items-center justify-between px-3 bg-card border-b border-border">
            <button
              onClick={() => navigate('/dashboard')}
              className="transition-opacity hover:opacity-80"
              aria-label="Go to home"
            >
              <img src={smAdvisorsLogo} alt="SM Advisors" className="h-8 object-contain" />
            </button>
            <button
              onClick={onToggle}
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
              aria-label="Collapse menu"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex h-16 shrink-0 flex-col items-center justify-center gap-1 bg-card border-b border-border">
            <button
              onClick={() => navigate('/dashboard')}
              className="transition-opacity hover:opacity-80"
              aria-label="Go to home"
            >
              <img src={sparkLogo} alt="SM Advisors" className="h-7 w-7 object-contain" />
            </button>
            <button
              onClick={onToggle}
              className="flex h-4 w-4 items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Expand menu"
            >
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* ── Zone items ──────────────────────────────────────────────────── */}
        <div onClick={(e) => { if (e.target === e.currentTarget) onToggle(); }} className={cn('flex flex-1 flex-col gap-1', isExpanded ? 'px-2' : 'items-center px-2')}>
          {unlockedZones.map((zone) => {
            const Icon = zone.icon;
            const active = isActive(zone.id, zone.path);

            if (isExpanded) {
              return (
                <button
                  key={zone.id}
                  onClick={() => navigate(resolveZonePath(zone.id, zone.path))}
                  aria-label={zone.label}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-all duration-150 w-full',
                    active
                      ? 'bg-accent/20 text-primary-foreground'
                      : 'text-primary-foreground/70 hover:bg-white/10 hover:text-primary-foreground'
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <div className="overflow-hidden min-w-0">
                    <div className="text-sm font-medium leading-tight truncate">{zone.label}</div>
                    <div className="text-[10px] opacity-60 leading-tight truncate mt-0.5">{zone.description}</div>
                  </div>
                </button>
              );
            }

            return (
              <Tooltip key={zone.id} delayDuration={300}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => navigate(resolveZonePath(zone.id, zone.path))}
                    aria-label={zone.label}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-150',
                      active
                        ? 'bg-accent/20 text-primary-foreground'
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

        {/* ── User at bottom ───────────────────────────────────────────────── */}
        <div className="border-t border-white/10 p-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                aria-label="User menu"
                className={cn(
                  'flex items-center rounded-lg transition-all text-primary-foreground/60 hover:bg-white/10 hover:text-primary-foreground w-full',
                  isExpanded ? 'gap-3 px-2 py-2' : 'justify-center p-1'
                )}
              >
                <div className="h-8 w-8 shrink-0 rounded-full bg-accent/20 flex items-center justify-center text-xs font-semibold text-accent border border-accent/30">
                  {initials}
                </div>
                {isExpanded && (
                  <div className="overflow-hidden min-w-0">
                    <div className="text-sm font-medium leading-tight truncate text-primary-foreground">
                      {profile?.display_name ?? 'User'}
                    </div>
                    <div className="text-[10px] opacity-60 leading-tight truncate">
                      {profile?.job_role ?? profile?.employer_name ?? 'View profile'}
                    </div>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="end" className="w-48 mb-1">
              <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                My Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              {(isAdmin || profile?.is_super_admin) && (
                <DropdownMenuSeparator />
              )}
              {isAdmin && (
                <DropdownMenuItem onClick={() => navigate('/admin')} className="cursor-pointer">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Admin Dashboard
                </DropdownMenuItem>
              )}
              {profile?.is_super_admin && (
                <DropdownMenuItem onClick={() => navigate('/super-admin')} className="cursor-pointer">
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Super Admin
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="cursor-pointer text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
        const active = isActive(zone.id, zone.path);

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
