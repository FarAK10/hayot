import { extractRaw, formatWithMask, maskTemplate, parseMask } from './mask.util';

const PHONE = '998\\((\\d{2})\\)(\\d{3})-(\\d{2})-(\\d{2})';
const RAW_DIGITS = '931234567';
const FORMATTED = '998(93) 123-45-67';
const COUNTRY_CODE = '998';

describe('mask.util', () => {
  const tokens = parseMask(PHONE)!;

  it('builds the template', () => expect(maskTemplate(tokens)).toBe('998(__) ___-__-__'));
  it('formats raw digits', () => {
    expect(formatWithMask(RAW_DIGITS, tokens)).toBe(FORMATTED);
    expect(formatWithMask('9', tokens)).toBe('998(9');
    expect(formatWithMask('93', tokens)).toBe('998(93');
    expect(formatWithMask('', tokens)).toBe('');
  });
  it('extracts raw digits', () => {
    expect(extractRaw(FORMATTED, tokens)).toBe(RAW_DIGITS);
    expect(extractRaw('998(99', tokens)).toBe('99');
    expect(extractRaw(RAW_DIGITS, tokens)).toBe(RAW_DIGITS);
    expect(extractRaw(COUNTRY_CODE + RAW_DIGITS, tokens)).toBe(RAW_DIGITS);
    expect(extractRaw('998(', tokens)).toBe('');
  });
  it('returns null for unsupported masks', () => {
    expect(parseMask('[a-z]+')).toBeNull();
    expect(parseMask('(\\w{3})')).toBeNull();
    expect(parseMask(null)).toBeNull();
  });
});
