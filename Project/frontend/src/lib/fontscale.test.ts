import { describe, expect, it } from 'vitest';
import { parseFontScale } from './fontscale';

describe('parseFontScale', () => {
  it('accepts the known sizes and falls back to normal', () => {
    expect(parseFontScale('groter')).toBe('groter');
    expect(parseFontScale('grootst')).toBe('grootst');
    expect(parseFontScale('normaal')).toBe('normaal');
    expect(parseFontScale('enorm')).toBe('normaal');
    expect(parseFontScale(null)).toBe('normaal');
  });
});
