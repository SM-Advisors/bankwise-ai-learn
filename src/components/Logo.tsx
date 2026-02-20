import smAdvisorsIcon from '@/assets/sm-advisors-icon.svg';
import smAdvisorsLogo from '@/assets/sm-advisors-logo.svg';
import smAdvisorsLogoFull from '@/assets/sm-advisors-logo-full.svg';
import smAdvisorsLogoWhite from '@/assets/sm-advisors-logo-white.svg';

interface LogoProps {
  /** 'icon' = starburst only | 'compact' = starburst + name | 'full' = starburst + name + tagline | 'white' = white version for dark backgrounds */
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
  const logoSrc = {
    icon: smAdvisorsIcon,
    compact: smAdvisorsLogo,
    full: smAdvisorsLogoFull,
    white: smAdvisorsLogoWhite,
  }[variant];

  const sizeClass = HEIGHT_MAP[size][variant];

  return (
    <img
      src={logoSrc}
      alt="SM Advisors"
      className={`${sizeClass} object-contain ${className}`}
    />
  );
}
