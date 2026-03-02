import { type ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { SkeletonLoader } from './SkeletonLoader';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SmileCardProps {
  variant?: 'default' | 'interactive' | 'elevated';
  isLoading?: boolean;
  children?: ReactNode;
  className?: string;
  onClick?: () => void;
}

// ─── SmileCard ────────────────────────────────────────────────────────────────
//
// Constrained card primitive for the SMILE design system.
//
// default      → clean bordered card, no interactivity cues
// interactive  → hover border accent + shadow lift + cursor pointer
// elevated     → shadow-elevated, no hover required (used for feature cards)
//
// isLoading    → renders SkeletonLoader in place of children

export function SmileCard({
  variant = 'default',
  isLoading = false,
  children,
  className,
  onClick,
}: SmileCardProps) {
  return (
    <Card
      onClick={onClick}
      className={cn(
        'rounded-lg p-6 transition-all duration-200',
        variant === 'interactive' && [
          'cursor-pointer',
          'hover:border-accent hover:shadow-card',
        ],
        variant === 'elevated' && 'shadow-elevated',
        onClick && 'focus-visible:ring-2 focus-visible:ring-accent outline-none',
        className
      )}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      {isLoading ? <SkeletonLoader type="card" count={1} /> : children}
    </Card>
  );
}
