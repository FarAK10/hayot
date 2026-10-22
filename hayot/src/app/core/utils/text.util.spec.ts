import { Lang } from '../models/catalog.models';
import { getInitials, interpolate, localize } from './text.util';

describe('getInitials', () => {
  it('uses the first letters of the first two words, upper-cased', () => {
    expect(getInitials('uz mobile plus')).toBe('UM');
    expect(getInitials('Beeline')).toBe('B');
  });
  it('handles Cyrillic and extra whitespace', () => {
    expect(getInitials('  горячая   вода ')).toBe('ГВ');
  });
  it('returns an empty string for blank input', () => {
    expect(getInitials('   ')).toBe('');
    expect(getInitials('')).toBe('');
  });
});

describe('localize', () => {
  it('returns the current language', () => {
    expect(localize({ ru: 'А', uz: 'B', en: 'C' }, Lang.Uz)).toBe('B');
  });
  it('falls back ru -> uz -> en', () => {
    expect(localize({ ru: 'А', en: 'C' }, Lang.Uz)).toBe('А');
    expect(localize({ uz: 'B', en: 'C' }, Lang.En)).toBe('C');
    expect(localize({ uz: 'B' }, Lang.En)).toBe('B');
    expect(localize({ en: 'C' }, Lang.Uz)).toBe('C');
    expect(localize(undefined, Lang.Ru)).toBe('');
  });
  it('trims', () => {
    expect(localize({ en: 'Beeline ' }, Lang.En)).toBe('Beeline');
  });
});

describe('interpolate', () => {
  it('fills every placeholder, including numbers', () => {
    const params = { min: 500, max: '1 000' };

    expect(interpolate('from {min} to {max}', params)).toBe('from 500 to 1 000');
  });
  it('replaces a repeated placeholder everywhere', () => {
    expect(interpolate('{value} = {value}', { value: 'x' })).toBe('x = x');
  });
  it('leaves unknown placeholders and plain text untouched', () => {
    expect(interpolate('hello {name}')).toBe('hello {name}');
    expect(interpolate('no placeholders', { min: 1 })).toBe('no placeholders');
  });
});
