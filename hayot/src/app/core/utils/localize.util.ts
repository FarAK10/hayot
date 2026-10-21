import { Lang, Localized } from '../models/catalog.models';

export function localize(text: Localized | null | undefined, lang: Lang): string {
  if (!text) {
    return '';
  }
  return (text[lang] ?? text.ru ?? text.uz ?? text.en ?? '').trim();
}
