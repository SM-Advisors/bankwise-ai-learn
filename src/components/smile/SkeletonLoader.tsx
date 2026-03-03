import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

type SkeletonType = 'card' | 'text' | 'list-item' | 'module-strip';

interface SkeletonLoaderProps {
  type?: SkeletonType;
  count?: number;
  className?: string;
}

// ─── SkeletonLoader ───────────────────────────────────────────────────────────
//
// Composable skeleton loading states for SMILE components.
//
// card         → image block + 3 text lines (used inside SmileCard isLoading)
// text         → N lines of varying width (paragraph placeholder)
// list-item    → N rows of [icon placeholder] + [2 lines] (feed/list content)
// module-strip → row of N small dots (for ProgressStrip loading state)

export function SkeletonLoader({
  type = 'text',
  count = 3,
  className,
}: SkeletonLoaderProps) {
  if (type === 'card') {
    return (
      <div className={cn('space-y-3', className)}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-32 w-full rounded-md" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'text') {
    const widths = ['w-full', 'w-5/6', 'w-4/5', 'w-3/4', 'w-2/3'];
    return (
      <div className={cn('space-y-2', className)}>
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton
            key={i}
            className={cn('h-4', widths[i % widths.length])}
          />
        ))}
      </div>
    );
  }

  if (type === 'list-item') {
    return (
      <div className={cn('space-y-3', className)}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // module-strip: row of small dots
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-3 w-3 rounded-full" />
      ))}
    </div>
  );
}
