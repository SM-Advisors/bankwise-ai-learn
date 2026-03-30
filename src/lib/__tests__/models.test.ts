/**
 * Phase 2.2 — lib/models.ts
 */

import { describe, it, expect } from 'vitest';
import {
  AVAILABLE_MODELS,
  DEFAULT_MODEL,
  PROVIDER_COLORS,
  getModelById,
  type ModelDefinition,
} from '../models';

describe('getModelById', () => {
  it('returns the correct ModelDefinition for each known model ID', () => {
    for (const model of AVAILABLE_MODELS) {
      const result = getModelById(model.id);
      expect(result).toBeDefined();
      expect(result?.id).toBe(model.id);
    }
  });

  it('returns undefined for an unknown model ID', () => {
    expect(getModelById('not-a-real-model')).toBeUndefined();
    expect(getModelById('')).toBeUndefined();
  });

  it('returns the correct model for claude-sonnet-4-6', () => {
    const model = getModelById('claude-sonnet-4-6');
    expect(model?.label).toBe('Claude Sonnet 4.6');
    expect(model?.provider).toBe('anthropic');
  });
});

describe('DEFAULT_MODEL', () => {
  it('exists in AVAILABLE_MODELS', () => {
    const found = AVAILABLE_MODELS.find((m) => m.id === DEFAULT_MODEL);
    expect(found).toBeDefined();
  });
});

describe('AVAILABLE_MODELS', () => {
  it('all models have required fields', () => {
    for (const model of AVAILABLE_MODELS) {
      expect(model.id, `${model.id} missing id`).toBeTruthy();
      expect(model.label, `${model.id} missing label`).toBeTruthy();
      expect(model.provider, `${model.id} missing provider`).toBeTruthy();
      expect(model.description, `${model.id} missing description`).toBeTruthy();
    }
  });

  it('has at least one model', () => {
    expect(AVAILABLE_MODELS.length).toBeGreaterThan(0);
  });
});

describe('PROVIDER_COLORS', () => {
  it('has an entry for every provider in AVAILABLE_MODELS', () => {
    const providers = new Set(AVAILABLE_MODELS.map((m) => m.provider));
    for (const provider of providers) {
      expect(
        PROVIDER_COLORS[provider],
        `PROVIDER_COLORS missing entry for provider "${provider}"`
      ).toBeTruthy();
    }
  });

  it('all color values are non-empty strings', () => {
    for (const [provider, color] of Object.entries(PROVIDER_COLORS)) {
      expect(typeof color, `PROVIDER_COLORS[${provider}] should be a string`).toBe('string');
      expect(color.length, `PROVIDER_COLORS[${provider}] should not be empty`).toBeGreaterThan(0);
    }
  });
});
