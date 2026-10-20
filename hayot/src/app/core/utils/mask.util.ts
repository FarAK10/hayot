export type MaskToken = { kind: 'literal'; char: string } | { kind: 'slot' };

/**
 * Parses a regex-like mask such as `998\((\d{2})\)(\d{3})-(\d{2})-(\d{2})`.
 * Returns null when the mask uses anything unsupported.
 */
export function parseMask(mask: string | null | undefined): MaskToken[] | null {
  if (!mask) return null;
  const tokens: MaskToken[] = [];
  let i = 0;
  while (i < mask.length) {
    const c = mask[i];
    if (c === '\\') {
      const next = mask[i + 1];
      if (next === undefined || /[dDwWsSbB0-9]/.test(next)) return null;
      tokens.push({ kind: 'literal', char: next });
      // Display nicety: "998(93) 123" rather than "998(93)123".
      if (next === ')' && mask[i + 2] === '(') tokens.push({ kind: 'literal', char: ' ' });
      i += 2;
    } else if (c === '(') {
      const m = /^\(\\d\{(\d+)\}\)/.exec(mask.slice(i));
      if (!m) return null;
      for (let n = 0; n < Number(m[1]); n++) tokens.push({ kind: 'slot' });
      i += m[0].length;
    } else if (/[[\]{}()|*+?^$.]/.test(c)) {
      return null;
    } else {
      tokens.push({ kind: 'literal', char: c });
      i++;
    }
  }
  return tokens.some((t) => t.kind === 'slot') ? tokens : null;
}

export const slotCount = (tokens: MaskToken[]): number =>
  tokens.filter((t) => t.kind === 'slot').length;

/** Literals before the first slot: the fixed, non-editable prefix. */
export function fixedPrefix(tokens: MaskToken[]): string {
  let prefix = '';
  for (const t of tokens) {
    if (t.kind === 'slot') break;
    prefix += t.char;
  }
  return prefix;
}

/** `998(__) ___-__-__` */
export function maskTemplate(tokens: MaskToken[]): string {
  return tokens.map((t) => (t.kind === 'slot' ? '_' : t.char)).join('');
}

/** Formats raw slot digits; empty raw gives an empty string. */
export function formatWithMask(raw: string, tokens: MaskToken[]): string {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  let out = '';
  let di = 0;
  let pendingLiterals = '';
  for (const t of tokens) {
    if (t.kind === 'literal') {
      pendingLiterals += t.char;
    } else {
      if (di >= digits.length) break;
      out += pendingLiterals + digits[di++];
      pendingLiterals = '';
    }
  }
  return out;
}

/** Extracts the slot digits from user input (display text or a pasted number). */
export function extractRaw(display: string, tokens: MaskToken[]): string {
  let digits = display.replace(/\D/g, '');
  const prefixDigits = fixedPrefix(tokens).replace(/\D/g, '');
  if (prefixDigits && digits.startsWith(prefixDigits)) digits = digits.slice(prefixDigits.length);
  return digits.slice(0, slotCount(tokens));
}
