import { MAX_INITIALS } from '../config/app.config.constants';
import { Lang, Localized } from '../models/catalog.models';
import { PLACEHOLDER, splitWords } from './regex.util';

export type InterpolationParams = Record<string, string | number>;

export function getInitials(name: string): string {
  return splitWords(name)
    .slice(0, MAX_INITIALS)
    .map((word) => word[0].toUpperCase())
    .join('');
}

export function localize(text: Localized | null | undefined, lang: Lang): string {
  if (!text) {
    return '';
  }
  return (text[lang] ?? text[Lang.Ru] ?? text[Lang.Uz] ?? text[Lang.En] ?? '').trim();
}

export function interpolate(template: string, params: InterpolationParams = {}): string {
  return template.replace(PLACEHOLDER, (placeholder, name: string) =>
    name in params ? String(params[name]) : placeholder,
  );
}
