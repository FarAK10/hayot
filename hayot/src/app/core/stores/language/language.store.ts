import { computed } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { Lang, Localized } from '../../models/catalog.models';
import { InterpolationParams, interpolate } from '../../utils/interpolate.util';
import { DEFAULT_LANG, persistLang, readStoredLang } from '../../utils/language.util';
import { localize } from '../../utils/localize.util';
import { UI_STRINGS, UiKey } from '../../../shared/i18n/ui-strings';

export const LanguageStore = signalStore(
  { providedIn: 'root' },
  withState<{ lang: Lang }>({ lang: DEFAULT_LANG }),
  withComputed(({ lang }) => ({
    dictionary: computed(() => UI_STRINGS[lang()]),
  })),
  withMethods((store) => ({
    setLang(lang: Lang): void {
      patchState(store, { lang });
      persistLang(lang);
    },
    localize(text: Localized | null | undefined): string {
      return localize(text, store.lang());
    },
    t(key: UiKey, params?: InterpolationParams): string {
      const template: string = store.dictionary()[key];
      return interpolate(template, params);
    },
  })),
  withHooks({
    onInit(store) {
      store.setLang(readStoredLang());
    },
  }),
);
