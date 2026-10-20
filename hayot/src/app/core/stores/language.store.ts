import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { LANGS, Lang, Localized } from '../models/catalog.models';
import { localize } from '../utils/localize.util';
import { UI_STRINGS, UiKey } from '../../shared/i18n/ui-strings';

const STORAGE_KEY = 'payflow.lang';

function readStoredLang(): Lang {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v && (LANGS as readonly string[]).includes(v)) return v as Lang;
  } catch {
    /* storage unavailable */
  }
  return 'ru';
}

export const LanguageStore = signalStore(
  { providedIn: 'root' },
  withState<{ lang: Lang }>({ lang: 'ru' }),
  withComputed(({ lang }) => ({
    dictionary: computed(() => UI_STRINGS[lang()]),
  })),
  withMethods((store) => ({
    setLang(lang: Lang): void {
      patchState(store, { lang });
      try {
        localStorage.setItem(STORAGE_KEY, lang);
        document.documentElement.lang = lang;
      } catch {
        /* storage unavailable */
      }
    },
    localize(text: Localized | null | undefined): string {
      return localize(text, store.lang());
    },
    t(key: UiKey, params?: Record<string, string | number>): string {
      let s: string = store.dictionary()[key];
      for (const [k, v] of Object.entries(params ?? {})) s = s.replaceAll(`{${k}}`, String(v));
      return s;
    },
  })),
  withHooks({
    onInit(store) {
      store.setLang(readStoredLang());
    },
  }),
);
