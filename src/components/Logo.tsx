// Real SM Advisors brand assets
import smAdvisorsLogo from '@/assets/SM ADVISORS LOGO_Web_White Background.svg';
import smAdvisorsSpark from '@/assets/SM ADVISORS SPARK_Merch_Transparent.svg';

interface LogoProps {
  /** 'icon' = starburst spark only | 'compact' | 'full' = full logo with white bg | 'white' = same full logo (white bg works on light + dark via container) */
  variant?: 'icon' | 'compact' | 'full' | 'white';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const HEIGHT_MAP: Record<string, Record<string, string>> = {
  sm: { icon: 'h-6 w-6', compact: 'h-6', full: 'h-8', white: 'h-6' },
  md: { icon: 'h-8 w-8', compact: 'h-8', full: 'h-10', white: 'h-8' },
  lg: { icon: 'h-12 w-12', compact: 'h-10', full: 'h-14', white: 'h-10' },
};

export function Logo({ variant = 'compact', className = '', size = 'md' }: LogoProps) {
  // icon variant uses the transparent spark; all others use the full logo
  const logoSrc = variant === 'icon' ? smAdvisorsSpark : smAdvisorsLogo;
  const sizeClass = HEIGHT_MAP[size][variant];

  return (
    <img
      src={logoSrc}
      alt="SM Advisors"
      className={`${sizeClass} object-contain ${className}`}
    />
  );
}
