import { useRef } from 'react';
import { driver, type DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useAuth } from '@/contexts/AuthContext';

export type TourId = 'dashboard' | 'admin' | 'andrea';

/**
 * Central tour hook — wraps driver.js and tracks per-tour completion in the DB.
 *
 * Usage:
 *   const { isCompleted, startTour } = useTour('admin');
 *   if (!isCompleted) startTour(ADMIN_STEPS);
 *
 * Tour completion is stored in user_profiles.tours_completed (JSONB).
 * 'dashboard' also mirrors to the legacy tour_completed boolean for backward compat.
 */
export function useTour(tourId: TourId) {
  const { profile, updateProfile } = useAuth();
  const driverRef = useRef<ReturnType<typeof driver> | null>(null);

  // Check completion: 'dashboard' checks both legacy boolean and new JSONB map
  const isCompleted: boolean =
    tourId === 'dashboard'
      ? (profile?.tour_completed === true || !!(profile?.tours_completed?.[tourId]))
      : !!(profile?.tours_completed?.[tourId]);

  const markComplete = async () => {
    const current = (profile?.tours_completed ?? {}) as Record<string, boolean>;
    const update: Record<string, unknown> = {
      tours_completed: { ...current, [tourId]: true },
    };
    // Keep legacy boolean in sync for dashboard tour
    if (tourId === 'dashboard') update.tour_completed = true;
    await updateProfileupdate;
  };

  const startTour = (steps: DriveStep[], onComplete?: () => void) => {
    // Clean up any active tour first
    if (driverRef.current?.isActive()) {
      driverRef.current.destroy();
      driverRef.current = null;
    }

    const driverObj = driver({
      showProgress: true,
      progressText: '{{current}} of {{total}}',
      allowClose: true,
      onDestroyStarted: () => {
        driverRef.current = null;
        // Mark complete whenever the tour finishes OR is skipped
        markComplete();
        onComplete?.();
        driverObj.destroy();
      },
      steps,
    });

    driverRef.current = driverObj;
    driverObj.drive();
  };

  /** Force-stop an active tour without marking it complete */
  const destroyTour = () => {
    if (driverRef.current?.isActive()) {
      driverRef.current.destroy();
    }
    driverRef.current = null;
  };

  return { isCompleted, startTour, destroyTour };
}
