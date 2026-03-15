import { Home, BookOpen, Compass, Users, User, Bot, type LucideIcon } from 'lucide-react';

// ─── Unlock conditions ───────────────────────────────────────────────────────
// Each condition maps to a check in useFeatureGates.ts.
// Zones are ABSENT from the UI until their condition is met — not disabled.
export type UnlockCondition =
  | 'always'
  | 'onboarding_completed'
  | 'session_1_basic_interaction_done'  // Basic Interaction (1-3) complete → unlocks Explore
  | 'first_practice_done'       // Any practice chat started → unlocks Community
  | 'session_1_completed'       // Full session 1 done
  | 'session_3_agent_deployed'; // User has deployed their first agent → unlocks Agents zone

// ─── Zone definition ─────────────────────────────────────────────────────────
export interface Zone {
  id: string;
  icon: LucideIcon;
  label: string;
  description: string;
  path: string;
  unlockedBy: UnlockCondition;
}

// ─── Learner zones ────────────────────────────────────────────────────────────
// Order here is the order they appear in the NavRail.
export const LEARNER_ZONES: Zone[] = [
  {
    id: 'home',
    icon: Home,
    label: 'Home',
    description: 'What should I do next?',
    path: '/dashboard',
    unlockedBy: 'always',
  },
  {
    id: 'learn',
    icon: BookOpen,
    label: 'Learn',
    description: 'Your training sessions',
    path: '/training/1',
    unlockedBy: 'onboarding_completed',
  },
  {
    id: 'explore',
    icon: Compass,
    label: 'Explore',
    description: 'Prompt library, ideas, sandboxes, electives',
    path: '/explore',
    unlockedBy: 'session_1_basic_interaction_done',
  },
  {
    id: 'community',
    icon: Users,
    label: 'Community',
    description: 'Share wins, connect with peers',
    path: '/community',
    unlockedBy: 'first_practice_done',
  },
  {
    id: 'agents',
    icon: Bot,
    label: 'Agents',
    description: 'Your deployed AI agents',
    path: '/agents',
    unlockedBy: 'session_3_agent_deployed',
  },
  {
    id: 'profile',
    icon: User,
    label: 'Profile',
    description: 'Preferences, memories, skills & progress',
    path: '/profile',
    unlockedBy: 'onboarding_completed',
  },
];

// ─── Lookup helper ────────────────────────────────────────────────────────────
export const ZONE_BY_ID = Object.fromEntries(
  LEARNER_ZONES.map((z) => [z.id, z])
) as Record<string, Zone>;
