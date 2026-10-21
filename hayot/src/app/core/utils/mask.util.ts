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

    const [, escapedChar, slotRepeat, plainChar] = match;
    if (slotRepeat !== undefined) {
      tokens.push(...slots(Number(slotRepeat)));
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
  tokens.filter((token) => token.kind === 'slot').length;

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
  return tokens.map((token) => (token.kind === 'slot' ? '_' : token.char)).join('');
}

export function formatWithMask(raw: string, tokens: MaskToken[]): string {
  const digits = onlyDigits(raw);
  if (!digits) {
    return '';
  }
  let formatted = '';
  let digitIndex = 0;
  let literalsBeforeNextDigit = '';
  for (const token of tokens) {
    if (token.kind === 'literal') {
      literalsBeforeNextDigit += token.char;
      continue;
    }
    if (digitIndex >= digits.length) {
      break;
    }
    formatted += literalsBeforeNextDigit + digits[digitIndex];
    digitIndex += 1;
    literalsBeforeNextDigit = '';
  }
  return formatted;
}

export function extractRaw(display: string, tokens: MaskToken[]): string {
  let digits = onlyDigits(display);
  const prefixDigits = onlyDigits(fixedPrefix(tokens));
  if (prefixDigits && digits.startsWith(prefixDigits)) {
    digits = digits.slice(prefixDigits.length);
  }
  return digits.slice(0, slotCount(tokens));
}
