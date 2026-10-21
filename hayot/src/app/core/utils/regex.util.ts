import { DIGIT_GROUP_SIZE } from '../config/app.config.constants';

const NON_DIGITS = /\D/g;
const WHITESPACE = /\s+/;

export const DIGIT_GROUPS = new RegExp(String.raw`\B(?=(\d{${DIGIT_GROUP_SIZE}})+(?!\d))`, 'g');

export const DIGITS_ONLY_VALIDATION = /^(?:\\d(?:\{\d+(?:,\d*)?\})?)+$/;

export const MASK_TOKEN = /\\([^dDwWsSbB0-9])|\(\\d\{(\d+)\}\)|([^\\()[\]{}|*+?^$.])/g;

export const PLACEHOLDER = /\{(\w+)\}/g;

export const onlyDigits = (text: string): string => text.replace(NON_DIGITS, '');

export const splitWords = (text: string): string[] => text.split(WHITESPACE).filter(Boolean);

export const fullMatch = (pattern: string): RegExp => new RegExp(`^(?:${pattern})$`);
