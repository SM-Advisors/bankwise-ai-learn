import { useEffect, useRef } from 'react';
import { driver, type Driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { DASHBOARD_STEPS } from '@/constants/tourSteps';

interface HelpTourProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

export function HelpTour({ open, onOpenChange, onComplete }: HelpTourProps) {
  const driverRef = useRef<Driver | null>(null);

  useEffect(() => {
    if (!open) {
      // Clean up if tour was active and open went false externally
      if (driverRef.current?.isActive()) {
        driverRef.current.destroy();
        driverRef.current = null;
      }
      return;
    }

    const timeout = setTimeout(() => {
      const driverObj = driver({
        showProgress: true,
        progressText: '{{current}} of {{total}}',
        allowClose: true,
        smoothScroll: true,
        onDestroyStarted: () => {
          driverRef.current = null;
          onComplete?.();
          onOpenChange(false);
          driverObj.destroy();
        },
        steps: DASHBOARD_STEPS,
      });

      driverRef.current = driverObj;
      driverObj.drive();
    }, 300);

    return () => clearTimeout(timeout);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
