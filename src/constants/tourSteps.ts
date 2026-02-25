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

// ─── Andrea Dashboard Chat Tour ──────────────────────────────────────────────
// This tour opens the dashboard floating chat panel and walks through it.
// Elements targeted are inside DashboardChat (panel must be open before tour starts).
export const ANDREA_STEPS: DriveStep[] = [
  {
    popover: {
      title: 'Meet Andrea — Your AI Training Coach',
      description: "Andrea lives in the bottom-right corner of your dashboard as a floating chat bubble. She's always available to answer questions about your training journey.",
      side: 'over' as const,
      align: 'center' as const,
    },
  },
  {
    element: '[data-tour="andrea-panel-header"]',
    popover: {
      title: "Andrea's Chat Window",
      description: "This is Andrea's full chat window. Use the history button to revisit past conversations, or the + button to start a fresh chat anytime.",
      side: 'left' as const,
      align: 'start' as const,
    },
  },
  {
    element: '[data-tour="andrea-panel-suggestions"]',
    popover: {
      title: 'Suggested Prompts',
      description: "Not sure where to start? These prompts surface the most useful questions — from 'where do I begin?' to module-specific guidance.",
      side: 'top' as const,
      align: 'center' as const,
    },
  },
  {
    element: '[data-tour="andrea-panel-input"]',
    popover: {
      title: 'Ask Anything',
      description: 'Type any question — about your training progress, AI concepts, or how to apply AI to your day-to-day banking tasks.',
      side: 'top' as const,
      align: 'center' as const,
    },
  },
  {
    element: '[data-tour="brainstorm-btn"]',
    popover: {
      title: 'AI Brainstorm',
      description: "Have a task in mind? Click this to describe it and Andrea will brainstorm how AI could help — adapted to your skill level.",
      side: 'top' as const,
      align: 'center' as const,
    },
  },
  {
    popover: {
      title: "That's Andrea!",
      description: "She's your go-to guide throughout this entire program. Replay this tour anytime from the Help menu.",
      side: 'over' as const,
      align: 'center' as const,
    },
  },
];
