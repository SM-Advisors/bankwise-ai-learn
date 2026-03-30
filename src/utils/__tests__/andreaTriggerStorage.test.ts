/**
 * Phase 2.3 — utils/andreaTriggerStorage.ts
 */

import { describe, it, expect, beforeEach } from 'vitest';
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

  it('uses sessionStorage (not localStorage)', () => {
    markFiredThisSession();
    expect(sessionStorage.length).toBeGreaterThan(0);
    expect(localStorage.length).toBe(0);
  });
});

describe('isDismissed / markDismissed', () => {
  it('returns false initially for any key', () => {
    expect(isDismissed('some-trigger')).toBe(false);
    expect(isDismissed('another-trigger')).toBe(false);
  });

  it('returns true after markDismissed(key)', () => {
    markDismissed('my-trigger');
    expect(isDismissed('my-trigger')).toBe(true);
  });

  it('different keys are independent', () => {
    markDismissed('trigger-a');
    expect(isDismissed('trigger-a')).toBe(true);
    expect(isDismissed('trigger-b')).toBe(false);
  });

  it('uses localStorage (not sessionStorage)', () => {
    markDismissed('trigger-x');
    expect(localStorage.length).toBeGreaterThan(0);
    expect(sessionStorage.length).toBe(0);
  });

  it('marking dismissed is idempotent (no duplicate entries)', () => {
    markDismissed('dup-key');
    markDismissed('dup-key');
    const raw = localStorage.getItem('andrea_dismissed_triggers')!;
    const list: string[] = JSON.parse(raw);
    expect(list.filter((k) => k === 'dup-key')).toHaveLength(1);
  });

  it('can dismiss multiple different keys', () => {
    markDismissed('key-1');
    markDismissed('key-2');
    markDismissed('key-3');
    expect(isDismissed('key-1')).toBe(true);
    expect(isDismissed('key-2')).toBe(true);
    expect(isDismissed('key-3')).toBe(true);
  });
});
