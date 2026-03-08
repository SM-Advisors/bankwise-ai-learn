import { describe, expect, it } from 'vitest';
import { getNodeText } from '@testing-library/dom';

describe('test harness sanity', () => {
  it('jsdom/document environment is available', () => {
    const el = document.createElement('div');
    el.textContent = 'Bankwise';
    expect(getNodeText(el)).toBe('Bankwise');
  });
});
