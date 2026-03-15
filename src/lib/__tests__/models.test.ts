import { describe, expect, it } from 'vitest';
import { AVAILABLE_MODELS, DEFAULT_MODEL, PROVIDER_COLORS, getModelById } from '../models';

describe('getModelById', () => {
  it('returns the correct model for each known ID', () => {
    for (const model of AVAILABLE_MODELS) {
      expect(getModelById(model.id)).toBe(model);
    }
  });

  it('returns undefined for an unknown model ID', () => {
    expect(getModelById('nonexistent-model')).toBeUndefined();
  });

  it('returns undefined for empty string', () => {
    expect(getModelById('')).toBeUndefined();
  });
});

describe('AVAILABLE_MODELS', () => {
  it('has at least one model', () => {
    expect(AVAILABLE_MODELS.length).toBeGreaterThan(0);
  });

  it('every model has required fields', () => {
    for (const model of AVAILABLE_MODELS) {
      expect(model.id).toBeTruthy();
      expect(model.label).toBeTruthy();
      expect(model.provider).toBeTruthy();
      expect(model.description).toBeTruthy();
    }
  });

  it('has no duplicate IDs', () => {
    const ids = AVAILABLE_MODELS.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('DEFAULT_MODEL', () => {
  it('references a model that exists in AVAILABLE_MODELS', () => {
    expect(getModelById(DEFAULT_MODEL)).toBeDefined();
  });
});

describe('PROVIDER_COLORS', () => {
  it('has an entry for every provider in AVAILABLE_MODELS', () => {
    const providers = new Set(AVAILABLE_MODELS.map((m) => m.provider));
    for (const provider of providers) {
      expect(PROVIDER_COLORS[provider]).toBeTruthy();
    }
  });
});
