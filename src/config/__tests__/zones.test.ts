/**
 * Phase 3.4 — config/zones.ts validation
 */

import { describe, it, expect } from 'vitest';
import { LEARNER_ZONES, ZONE_BY_ID, type UnlockCondition } from '../zones';

const VALID_UNLOCK_CONDITIONS: UnlockCondition[] = [
  'always',
  'onboarding_completed',
  'session_1_basic_interaction_done',
  'first_practice_done',
  'session_1_completed',
  'session_4_agent_deployed',
];

describe('LEARNER_ZONES — required fields', () => {
  it('all zones have required fields: id, label, description, path, unlockedBy', () => {
    for (const zone of LEARNER_ZONES) {
      expect(zone.id, 'zone missing id').toBeTruthy();
      expect(zone.label, `zone ${zone.id} missing label`).toBeTruthy();
      expect(zone.description, `zone ${zone.id} missing description`).toBeTruthy();
      expect(zone.path, `zone ${zone.id} missing path`).toBeTruthy();
      expect(zone.unlockedBy, `zone ${zone.id} missing unlockedBy`).toBeTruthy();
    }
  });

  it('all zones have a non-null icon', () => {
    for (const zone of LEARNER_ZONES) {
      expect(zone.icon, `zone ${zone.id} missing icon`).toBeDefined();
      expect(zone.icon).not.toBeNull();
    }
  });
});

describe('LEARNER_ZONES — uniqueness', () => {
  it('zone paths are unique', () => {
    const paths = LEARNER_ZONES.map((z) => z.path);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it('zone IDs are unique', () => {
    const ids = LEARNER_ZONES.map((z) => z.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('LEARNER_ZONES — unlock conditions', () => {
  it('all unlockCondition values are valid UnlockCondition type members', () => {
    const validSet = new Set<string>(VALID_UNLOCK_CONDITIONS);
    for (const zone of LEARNER_ZONES) {
      expect(
        validSet.has(zone.unlockedBy),
        `zone ${zone.id} has invalid unlockedBy "${zone.unlockedBy}"`
      ).toBe(true);
    }
  });
});

describe('ZONE_BY_ID', () => {
  it('contains every zone from LEARNER_ZONES', () => {
    for (const zone of LEARNER_ZONES) {
      expect(
        ZONE_BY_ID[zone.id],
        `ZONE_BY_ID missing zone "${zone.id}"`
      ).toBeDefined();
      expect(ZONE_BY_ID[zone.id].id).toBe(zone.id);
    }
  });

  it('has the same number of entries as LEARNER_ZONES', () => {
    expect(Object.keys(ZONE_BY_ID).length).toBe(LEARNER_ZONES.length);
  });
});
