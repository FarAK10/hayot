import { MASK_TOKEN, onlyDigits } from './regex.util';

export type MaskToken = { kind: 'literal'; char: string } | { kind: 'slot' };

const literal = (char: string): MaskToken => ({ kind: 'literal', char });
const slots = (count: number): MaskToken[] =>
  Array.from({ length: count }, (): MaskToken => ({ kind: 'slot' }));

export function parseMask(mask: string | null | undefined): MaskToken[] | null {
  if (!mask) {
    return null;
  }
  const tokens: MaskToken[] = [];
  let consumed = 0;

  for (const match of mask.matchAll(MASK_TOKEN)) {
    const isContiguous = match.index === consumed;
    if (!isContiguous) {
      return null;
    }
    consumed += match[0].length;

    const [, escapedChar, slotCount, plainChar] = match;
    if (slotCount !== undefined) {
      tokens.push(...slots(Number(slotCount)));
      continue;
    }
    tokens.push(literal(escapedChar ?? plainChar));
    if (escapedChar === ')' && mask[consumed] === '(') {
      tokens.push(literal(' '));
    }
  }

  const coversWholeMask = consumed === mask.length;
  const hasSlot = tokens.some((token) => token.kind === 'slot');
  return coversWholeMask && hasSlot ? tokens : null;
}

export const slotCount = (tokens: MaskToken[]): number =>
  tokens.filter((t) => t.kind === 'slot').length;

export function fixedPrefix(tokens: MaskToken[]): string {
  let prefix = '';
  for (const token of tokens) {
    if (token.kind === 'slot') {
      break;
    }
    prefix += token.char;
  }
  return prefix;
}

export function maskTemplate(tokens: MaskToken[]): string {
  return tokens.map((t) => (t.kind === 'slot' ? '_' : t.char)).join('');
}

export function formatWithMask(raw: string, tokens: MaskToken[]): string {
  const digits = onlyDigits(raw);
  if (!digits) {
    return '';
  }
  let out = '';
  let di = 0;
  let pendingLiterals = '';
  for (const token of tokens) {
    if (token.kind === 'literal') {
      pendingLiterals += token.char;
    } else {
      if (di >= digits.length) {
        break;
      }
      out += pendingLiterals + digits[di++];
      pendingLiterals = '';
    }
  }
  return out;
}

export function extractRaw(display: string, tokens: MaskToken[]): string {
  let digits = onlyDigits(display);
  const prefixDigits = onlyDigits(fixedPrefix(tokens));
  if (prefixDigits && digits.startsWith(prefixDigits)) {
    digits = digits.slice(prefixDigits.length);
  }
  return digits.slice(0, slotCount(tokens));
}
