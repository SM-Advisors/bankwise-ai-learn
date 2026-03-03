import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useFeatureGates } from '@/hooks/useFeatureGates';
import type { AndreaDockHandle } from '@/components/shell/AndreaDock';
import {
  hasFiredThisSession,
  markFiredThisSession,
  isDismissed,
  markDismissed,
} from '@/utils/andreaTriggerStorage';

// ── Trigger rules (from SMILE brief §3) ──────────────────────────────────────
//
// Implemented (client-side, no extra DB queries needed):
//   1. Return engagement  — user logs in after 3+ days away
//   2. Feature unlock (Explore)   — Explore zone just became available
//   3. Feature unlock (Community) — Community zone just became available
//   4. Stall detection    — 10 min on /training/* without moving on
//
// Deferred (require backend signals not yet available):
//   • Pattern recognition  — last 3 prompts share a structural weakness
//   • Skill readiness      — performance signals exceed current track
//   • Community connection — teammate posted on same module
//   • Value capture        — idea/workflow/win submitted
//
// Constraints enforced:
//   • Max one signal per browser session (sessionStorage flag)
//   • Never repeats after dismiss (localStorage dismissed list)
//   • Stall timer resets when user navigates away

export function useAndreaTriggers(andreaRef: React.RefObject<AndreaDockHandle>) {
  const { profile } = useAuth();
  const location = useLocation();
  const { canAccessExplore, canAccessCommunity } = useFeatureGates();

  // Track current trigger key so dismissal can mark it
  const currentKeyRef = useRef<string | null>(null);

  // Snapshot the unlock state at mount time — we only want to fire when the
  // state *transitions* from false → true, not when the user already had access.
  const hadExploreRef = useRef(canAccessExplore);
  const hadCommunityRef = useRef(canAccessCommunity);

  const stallTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Core fire function ──────────────────────────────────────────────────────
  const fire = (key: string, message: string) => {
    if (hasFiredThisSession()) return;
    if (isDismissed(key)) return;

    currentKeyRef.current = key;
    andreaRef.current?.nudge(message);
    markFiredThisSession();
  };

  // ── Dismissal handler (called by AndreaDock when user clicks X) ─────────────
  const handleDismiss = () => {
    if (currentKeyRef.current) {
      markDismissed(currentKeyRef.current);
      currentKeyRef.current = null;
    }
  };

  // ── Trigger 1: Return engagement ─────────────────────────────────────────────
  useEffect(() => {
    if (!profile?.updated_at) return;

    const daysSince =
      (Date.now() - new Date(profile.updated_at).getTime()) / 86_400_000;
    if (daysSince < 3) return;

    const key = `return_s${profile.current_session}`;
    fire(
      key,
      `Welcome back. You were working on Session ${profile.current_session} — ready to pick up where you left off?`,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  // ── Trigger 2: Explore zone just unlocked ────────────────────────────────────
  useEffect(() => {
    if (!canAccessExplore) return;
    if (hadExploreRef.current) return; // already had access at mount
    hadExploreRef.current = true;

    fire(
      'unlock_explore',
      'New area unlocked: Explore. That prompt you just built? You can save it to your Prompt Library now.',
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canAccessExplore]);

  // ── Trigger 3: Community zone just unlocked ──────────────────────────────────
  useEffect(() => {
    if (!canAccessCommunity) return;
    if (hadCommunityRef.current) return; // already had access at mount
    hadCommunityRef.current = true;

    fire(
      'unlock_community',
      'Your Community is now unlocked. Others on your team are already sharing wins — check it out.',
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canAccessCommunity]);

  // ── Trigger 4: Stall detection (10 min on training without moving on) ────────
  useEffect(() => {
    if (stallTimerRef.current) {
      clearTimeout(stallTimerRef.current);
      stallTimerRef.current = null;
    }

    if (!location.pathname.startsWith('/training/')) return;

    const key = `stall_${location.pathname}`;
    stallTimerRef.current = setTimeout(() => {
      fire(key, "You've been here a while. Want me to break this down a different way?");
    }, 10 * 60 * 1000); // 10 minutes

    return () => {
      if (stallTimerRef.current) {
        clearTimeout(stallTimerRef.current);
        stallTimerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return { handleDismiss };
}
