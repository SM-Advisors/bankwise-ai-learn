import { describe, expect, it } from 'vitest';
import { LEARNER_ZONES, ZONE_BY_ID, type UnlockCondition } from '../zones';

const VALID_UNLOCK_CONDITIONS: UnlockCondition[] = [
  'always',
  'onboarding_completed',
  'session_1_basic_interaction_done',
  'first_practice_done',
  'session_1_completed',
  'session_3_agent_deployed',
];

describe('LEARNER_ZONES structure', () => {
  it('has at least 4 zones', () => {
    expect(LEARNER_ZONES.length).toBeGreaterThanOrEqual(4);
  });

  it('every zone has required fields', () => {
    for (const zone of LEARNER_ZONES) {
      expect(zone.id).toBeTruthy();
      expect(zone.label).toBeTruthy();
      expect(zone.description).toBeTruthy();
      expect(zone.path).toBeTruthy();
      expect(zone.icon).toBeDefined();
      expect(zone.unlockedBy).toBeTruthy();
    }
  });

  it('all unlockedBy values are valid UnlockConditions', () => {
    for (const zone of LEARNER_ZONES) {
      expect(VALID_UNLOCK_CONDITIONS).toContain(zone.unlockedBy);
    }
  });

  it('zone IDs are unique', () => {
    const ids = LEARNER_ZONES.map((z) => z.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('zone paths are unique', () => {
    const paths = LEARNER_ZONES.map((z) => z.path);
    expect(new Set(paths).size).toBe(paths.length);
  });
});

describe('ZONE_BY_ID', () => {
  it('contains every zone from LEARNER_ZONES', () => {
    for (const zone of LEARNER_ZONES) {
      expect(ZONE_BY_ID[zone.id]).toBe(zone);
    }
  });

  it('has exactly as many entries as LEARNER_ZONES', () => {
    expect(Object.keys(ZONE_BY_ID).length).toBe(LEARNER_ZONES.length);
  });
});

describe('known zones exist', () => {
  it('home zone is always unlocked', () => {
    expect(ZONE_BY_ID['home'].unlockedBy).toBe('always');
  });

  it('learn zone requires onboarding', () => {
    expect(ZONE_BY_ID['learn'].unlockedBy).toBe('onboarding_completed');
  });

  it('explore zone requires basic interaction completion', () => {
    expect(ZONE_BY_ID['explore'].unlockedBy).toBe('session_1_basic_interaction_done');
  });

  it('community zone requires first practice', () => {
    expect(ZONE_BY_ID['community'].unlockedBy).toBe('first_practice_done');
  });
});
