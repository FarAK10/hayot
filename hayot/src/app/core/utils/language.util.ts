import { LANG_STORAGE_KEY } from '../config/app.config.constants';
import { LANGS, Lang } from '../models/catalog.models';
import { readStorage, writeStorage } from './storage.util';

export const DEFAULT_LANG = Lang.Ru;

const isLang = (value: string | null): value is Lang =>
  !!value && (LANGS as readonly string[]).includes(value);

export function readStoredLang(): Lang {
  const stored = readStorage(LANG_STORAGE_KEY);
  return isLang(stored) ? stored : DEFAULT_LANG;
}

export function persistLang(lang: Lang): void {
  writeStorage(LANG_STORAGE_KEY, lang);
  document.documentElement.lang = lang;
}
