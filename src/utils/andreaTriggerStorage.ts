// ── Andrea Proactive Trigger Storage ─────────────────────────────────────────
//
// sessionStorage: tracks whether a trigger has fired in the current session.
//   (brief: "max one proactive signal per session")
//
// localStorage: tracks triggers the user has dismissed.
//   (brief: "if user dismissed it, that trigger does not fire again for same context")

const SESSION_FIRED_KEY = 'andrea_session_fired';
const DISMISSED_KEY = 'andrea_dismissed_triggers';

export function hasFiredThisSession(): boolean {
  return !!sessionStorage.getItem(SESSION_FIRED_KEY);
}

export function markFiredThisSession(): void {
  sessionStorage.setItem(SESSION_FIRED_KEY, '1');
}

export function isDismissed(key: string): boolean {
  try {
    const list: string[] = JSON.parse(localStorage.getItem(DISMISSED_KEY) || '[]');
    return list.includes(key);
  } catch {
    return false;
  }
}

export function markDismissed(key: string): void {
  try {
    const list: string[] = JSON.parse(localStorage.getItem(DISMISSED_KEY) || '[]');
    if (!list.includes(key)) {
      list.push(key);
      localStorage.setItem(DISMISSED_KEY, JSON.stringify(list));
    }
  } catch {
    // ignore storage errors
  }
}
