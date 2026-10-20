import { localize } from './localize.util';

describe('localize', () => {
  it('returns the current language', () => {
    expect(localize({ ru: 'А', uz: 'B', en: 'C' }, 'uz')).toBe('B');
  });
  it('falls back ru -> uz -> en', () => {
    expect(localize({ ru: 'А', en: 'C' }, 'uz')).toBe('А');
    expect(localize({ uz: 'B', en: 'C' }, 'en' as const)).toBe('C');
    expect(localize({ uz: 'B' }, 'en')).toBe('B');
    expect(localize({ en: 'C' }, 'uz')).toBe('C');
    expect(localize(undefined, 'ru')).toBe('');
  });
  it('trims', () => {
    expect(localize({ en: 'Beeline ' }, 'en')).toBe('Beeline');
  });
});
