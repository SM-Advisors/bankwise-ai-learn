import { useNavigate } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BreadcrumbItem {
  label: string;
  path?: string; // If omitted, item renders as current page (non-link)
}

interface TopBarProps {
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode; // Optional slot for contextual page actions
}

// ─── TopBar ───────────────────────────────────────────────────────────────────
//
// Sticky 64px header sitting below the nav rail offset.
// Left:  Breadcrumb trail
// Right: User avatar + dropdown

export function TopBar({ breadcrumbs = [], actions }: TopBarProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-card px-6">
      {/* Left: breadcrumbs */}
      <div className="flex items-center">
        {breadcrumbs.length > 0 ? (
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((crumb, i) => {
                const isLast = i === breadcrumbs.length - 1;
                return (
                  <span key={i} className="flex items-center">
                    {i > 0 && <BreadcrumbSeparator />}
                    <BreadcrumbItem>
                      {isLast || !crumb.path ? (
                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink
                          href={crumb.path}
                          onClick={(e) => {
                            e.preventDefault();
                            navigate(crumb.path!);
                          }}
                        >
                          {crumb.label}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </span>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        ) : (
          <span className="text-sm font-medium text-muted-foreground">Home</span>
        )}
      </div>

      {/* Right: contextual actions */}
      {actions && (
        <div className="flex-1 flex items-center ml-4">
          {actions}
        </div>
      )}
    </header>
  );
}
