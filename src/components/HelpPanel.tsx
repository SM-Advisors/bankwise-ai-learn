import { useNavigate, useLocation } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useOrgResources } from '@/hooks/useOrgResources';
import { useTour, type TourId } from '@/hooks/useTour';
import { DASHBOARD_STEPS, ADMIN_STEPS, ANDREA_STEPS } from '@/constants/tourSteps';
import {
  Play,
  ExternalLink,
  Video,
  FileText,
  Link,
  Map,
  Settings,
  Bot,
  GraduationCap,
  BookOpen,
} from 'lucide-react';

interface HelpPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface TourDefinition {
  id: TourId;
  name: string;
  description: string;
  icon: React.ElementType;
  adminOnly?: boolean;
  route: string; // the page this tour belongs to
  routeTourParam: string; // query param to trigger tour on that page
}

const TOUR_DEFINITIONS: TourDefinition[] = [
  {
    id: 'dashboard',
    name: 'Main Dashboard',
    description: 'Tour the dashboard — profile, training sessions, Andrea, and your live feed.',
    icon: GraduationCap,
    route: '/dashboard',
    routeTourParam: 'dashboard',
  },
  {
    id: 'admin',
    name: 'Admin Dashboard',
    description: 'Tour the admin controls — user management, analytics, training, and config.',
    icon: Settings,
    adminOnly: true,
    route: '/admin',
    routeTourParam: 'admin',
  },
  {
    id: 'andrea',
    name: 'Andrea — Your AI Coach',
    description: "Tour Andrea's chat window — how to ask questions, use suggested prompts, and brainstorm with AI.",
    icon: Bot,
    route: '/dashboard',
    routeTourParam: 'andrea',
  },
];

const RESOURCE_ICONS: Record<string, React.ElementType> = {
  video: Video,
  document: FileText,
  link: Link,
};

// Inline tour runner for when the user is already on the right page
function useTourRunner(tourId: TourId) {
  const tourHook = useTour(tourId);
  const stepsMap: Record<TourId, typeof DASHBOARD_STEPS> = {
    dashboard: DASHBOARD_STEPS,
    admin: ADMIN_STEPS,
    andrea: ANDREA_STEPS,
  };
  return () => tourHook.startTour(stepsMap[tourId]);
}

export function HelpPanel({ open, onOpenChange }: HelpPanelProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, effectiveOrgId } = useAuth();
  const { isAdmin } = useUserRole();
  const { resources, loading: resourcesLoading } = useOrgResources(effectiveOrgId);

  const runDashboard = useTourRunner('dashboard');
  const runAdmin = useTourRunner('admin');
  const runAndrea = useTourRunner('andrea');

  const tourRunners: Record<TourId, () => void> = {
    dashboard: runDashboard,
    admin: runAdmin,
    andrea: runAndrea,
  };

  const handleStartTour = (tour: TourDefinition) => {
    onOpenChange(false);

    // If already on the right page, start tour directly after panel closes
    if (location.pathname === tour.route) {
      // For Andrea specifically, also switch to the advisor tab
      if (tour.id === 'andrea') {
        setTimeout(() => navigate(`${tour.route}?tour=${tour.routeTourParam}`), 200);
        return;
      }
      setTimeout(() => tourRunners[tour.id](), 300);
    } else {
      // Navigate to the tour's page and let it auto-start via ?tour= param
      setTimeout(() => navigate(`${tour.route}?tour=${tour.routeTourParam}`), 200);
    }
  };

  const visibleTours = TOUR_DEFINITIONS.filter((t) => !t.adminOnly || isAdmin);
  const activeResources = resources.filter((r) => r.is_active);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Help & Resources
          </DialogTitle>
        </DialogHeader>

        {/* ── Guided Tours ────────────────────────────────────── */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Guided Tours
          </p>
          {visibleTours.map((tour) => {
            const Icon = tour.icon;
            return (
              <div
                key={tour.id}
                className="flex items-start justify-between gap-3 p-3 rounded-lg border bg-muted/30"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="mt-0.5 flex-shrink-0 h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{tour.name}</p>
                      {tour.adminOnly && (
                        <Badge variant="secondary" className="text-[10px] px-1 py-0">
                          Admin
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {tour.description}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStartTour(tour)}
                  className="shrink-0 gap-1.5"
                >
                  <Play className="h-3 w-3" />
                  Replay
                </Button>
              </div>
            );
          })}
        </div>

        {/* ── Additional Resources ────────────────────────────── */}
        {(!resourcesLoading && activeResources.length > 0) && (
          <>
            <Separator />
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Additional Resources
              </p>
              {activeResources.map((resource) => {
                const Icon = RESOURCE_ICONS[resource.resource_type] ?? Link;
                return (
                  <a
                    key={resource.id}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors group"
                  >
                    <div className="mt-0.5 flex-shrink-0 h-8 w-8 rounded-md bg-muted flex items-center justify-center">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm group-hover:text-primary transition-colors">
                        {resource.title}
                      </p>
                      {resource.description && (
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {resource.description}
                        </p>
                      )}
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-1" />
                  </a>
                );
              })}
            </div>
          </>
        )}

        {/* Empty state for resources */}
        {!resourcesLoading && activeResources.length === 0 && profile?.organization_id && (
          <>
            <Separator />
            <div className="py-4 text-center text-muted-foreground text-sm">
              <Map className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p>No additional resources yet.</p>
              {isAdmin && (
                <p className="text-xs mt-1">
                  Add resources in <strong>Admin → Config → Resources</strong>.
                </p>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
