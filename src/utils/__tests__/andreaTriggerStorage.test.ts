import { describe, expect, it, beforeEach } from 'vitest';
import {
  hasFiredThisSession,
  markFiredThisSession,
  isDismissed,
  markDismissed,
} from '../andreaTriggerStorage';

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
});

describe('hasFiredThisSession / markFiredThisSession', () => {
  it('returns false initially', () => {
    expect(hasFiredThisSession()).toBe(false);
  });

  it('returns true after markFiredThisSession()', () => {
    markFiredThisSession();
    expect(hasFiredThisSession()).toBe(true);
  });

  it('uses sessionStorage (key: andrea_session_fired)', () => {
    markFiredThisSession();
    expect(sessionStorage.getItem('andrea_session_fired')).toBe('1');
  });
});

describe('isDismissed / markDismissed', () => {
  it('returns false for an unknown key', () => {
    expect(isDismissed('some_trigger')).toBe(false);
  });

  it('returns true after markDismissed()', () => {
    markDismissed('trigger_a');
    expect(isDismissed('trigger_a')).toBe(true);
  });

  it('different keys are independent', () => {
    markDismissed('trigger_a');
    expect(isDismissed('trigger_a')).toBe(true);
    expect(isDismissed('trigger_b')).toBe(false);
  });

  it('does not duplicate keys on repeated dismiss', () => {
    markDismissed('trigger_a');
    markDismissed('trigger_a');
    const stored = JSON.parse(localStorage.getItem('andrea_dismissed_triggers') || '[]');
    expect(stored.filter((k: string) => k === 'trigger_a').length).toBe(1);
  });

  it('uses localStorage (key: andrea_dismissed_triggers)', () => {
    markDismissed('x');
    const raw = localStorage.getItem('andrea_dismissed_triggers');
    expect(raw).toBeTruthy();
    expect(JSON.parse(raw!)).toContain('x');
  });

  it('handles corrupted localStorage gracefully', () => {
    localStorage.setItem('andrea_dismissed_triggers', 'not-valid-json');
    expect(isDismissed('anything')).toBe(false);
    // markDismissed should not throw
    markDismissed('anything');
  });
});
