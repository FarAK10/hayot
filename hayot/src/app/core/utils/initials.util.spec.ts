import { getInitials } from './initials.util';

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
