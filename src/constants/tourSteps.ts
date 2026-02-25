import type { DriveStep } from 'driver.js';

// ─── Dashboard Tour ──────────────────────────────────────────────────────────
export const DASHBOARD_STEPS: DriveStep[] = [
  {
    popover: {
      title: 'Welcome to SM Advisors AI Enablement!',
      description: "Let's show you around the platform. This quick tour highlights the key areas you'll use during your AI enablement journey.",
      side: 'over' as const,
      align: 'center' as const,
    },
  },
  {
    element: '[data-tour="profile-card"]',
    popover: {
      title: 'Your Profile & Progress',
      description: 'Your name, role, AI level, and overall training progress live here. It updates as you complete modules.',
      side: 'bottom' as const,
      align: 'start' as const,
    },
  },
  {
    element: '[data-tour="bank-policies-btn"]',
    popover: {
      title: 'Bank Policies',
      description: "Your bank's AI governance and usage policies live here. Check back as your institution updates its guidelines — knowing the guardrails makes you a more confident AI user.",
      side: 'bottom' as const,
      align: 'start' as const,
    },
  },
  {
    element: '[data-tour="personalization-btn"]',
    popover: {
      title: 'My Personalization',
      description: "Your personal AI hub. Tune Andrea's tone, verbosity, and formatting in <b>AI Settings</b>; review what she remembers about you in <b>Memories</b>; track AI use cases in <b>My Ideas</b>; save reusable prompts in <b>Prompt Library</b>; and track your growth in <b>My AI Journey</b>.",
      side: 'bottom' as const,
      align: 'end' as const,
    },
  },
  {
    element: '[data-tour="sessions-grid"]',
    popover: {
      title: 'Training Sessions',
      description: 'Four sessions take you from prompting basics to advanced AI integration. Complete them in order.',
      side: 'bottom' as const,
      align: 'center' as const,
    },
  },
  {
    element: '[data-tour="brainstorm-btn"]',
    popover: {
      title: 'AI Brainstorm',
      description: "Describe any task you're working on and Andrea will explore how AI can help — adapted to your skill level.",
      side: 'top' as const,
      align: 'center' as const,
    },
  },
  {
    element: '[data-tour="andrea-bubble"]',
    popover: {
      title: 'Andrea — Your AI Coach',
      description: 'Andrea is here on the dashboard for general questions and inside every training module.',
      side: 'left' as const,
      align: 'end' as const,
    },
  },
  {
    element: '[data-tour="live-feed"]',
    popover: {
      title: 'Live Enablement Feed',
      description: 'Watch real training videos and join live sessions here.',
      side: 'top' as const,
      align: 'start' as const,
    },
  },
  {
    element: '[data-tour="feedback-btn"]',
    popover: {
      title: 'Feedback',
      description: 'Use this to flag issues or share observations during your training.',
      side: 'top' as const,
      align: 'start' as const,
    },
  },
  {
    popover: {
      title: "You're all set!",
      description: "Start with Session 1 to begin building your AI skills. You can replay this tour anytime from the Help menu.",
      side: 'over' as const,
      align: 'center' as const,
    },
  },
];

// ─── Admin Dashboard Tour ────────────────────────────────────────────────────
export const ADMIN_STEPS: DriveStep[] = [
  {
    popover: {
      title: 'Welcome to the Admin Dashboard',
      description: "Here's a quick overview of everything you can manage from here.",
      side: 'over' as const,
      align: 'center' as const,
    },
  },
  {
    element: '[data-tour="admin-people-tab"]',
    popover: {
      title: 'People',
      description: 'Manage users, organizations, and departments. Activate or deactivate accounts and assign roles.',
      side: 'bottom' as const,
      align: 'start' as const,
    },
  },
  {
    element: '[data-tour="admin-analytics-tab"]',
    popover: {
      title: 'Analytics',
      description: 'Track enrollment funnels, session completion rates, compliance exceptions, and talk to Andrea for live executive insights.',
      side: 'bottom' as const,
      align: 'start' as const,
    },
  },
  {
    element: '[data-tour="admin-engagement-tab"]',
    popover: {
      title: 'Engagement',
      description: "Review submitted ideas, capstone work, and moderate community content from your organization's learners.",
      side: 'bottom' as const,
      align: 'start' as const,
    },
  },
  {
    element: '[data-tour="admin-training-tab"]',
    popover: {
      title: 'Training',
      description: 'Schedule live sessions, manage bank AI policies, configure learning styles, and review curriculum content.',
      side: 'bottom' as const,
      align: 'start' as const,
    },
  },
  {
    element: '[data-tour="admin-config-tab"]',
    popover: {
      title: 'Config',
      description: 'Manage events, platform settings, and add resources (videos, docs, links) that appear in the user Help panel.',
      side: 'bottom' as const,
      align: 'start' as const,
    },
  },
  {
    popover: {
      title: "You're ready!",
      description: "Use the tabs to navigate. Each section has its own sub-tabs for more detail. Replay this tour anytime from the Help menu.",
      side: 'over' as const,
      align: 'center' as const,
    },
  },
];

// ─── Andrea C-Suite Advisor Tour ─────────────────────────────────────────────
export const ANDREA_STEPS: DriveStep[] = [
  {
    popover: {
      title: 'Meet Andrea — C-Suite AI Advisor',
      description: "Andrea is your strategic AI advisor. She has live access to your organization's KPI data and can answer executive-level questions about your AI training program.",
      side: 'over' as const,
      align: 'center' as const,
    },
  },
  {
    element: '[data-tour="andrea-kpi-bar"]',
    popover: {
      title: 'Live KPI Snapshot',
      description: 'These metrics are live — enrollment rates, completion funnels, and compliance exception counts. Andrea reads this data before every response so her answers are always grounded in real numbers.',
      side: 'bottom' as const,
      align: 'center' as const,
    },
  },
  {
    element: '[data-tour="andrea-suggestions"]',
    popover: {
      title: 'Suggested Questions',
      description: "Start here. These chips surface the most common executive questions about your org's AI training progress — completion gaps, at-risk departments, compliance trends.",
      side: 'top' as const,
      align: 'center' as const,
    },
  },
  {
    element: '[data-tour="andrea-input"]',
    popover: {
      title: 'Ask Andrea Anything',
      description: 'Type any strategic question — completion rates by department, users who need follow-up, ROI framing for leadership, or compliance risk summaries. She knows your data.',
      side: 'top' as const,
      align: 'center' as const,
    },
  },
  {
    popover: {
      title: "That's Andrea!",
      description: "Her conversation resets when you click the reset button. Replay this tour anytime from the Help menu.",
      side: 'over' as const,
      align: 'center' as const,
    },
  },
];
