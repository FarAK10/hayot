import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { debounceTime, distinctUntilChanged, pipe, tap } from 'rxjs';
import { SEARCH_DEBOUNCE } from '../config/app.config.constants';
import { Category, LANGS, Localized, Recipient } from '../models/catalog.models';
import { matchesQuery, normalize } from '../utils/search.util';
import { CatalogStore } from './catalog.store';

export interface SearchGroup {
  category: Category;
  recipients: Recipient[];
}

const allLangs = (text: Localized | undefined): string[] =>
  LANGS.map((l) => text?.[l] ?? '').filter(Boolean);

/** Groups matching recipients by category, keeping the input (ord) order. */
export function searchCatalog(
  query: string,
  categories: readonly Category[],
  recipientsOf: (categoryId: number) => readonly Recipient[],
): SearchGroup[] {
  if (!normalize(query)) return [];
  const groups: SearchGroup[] = [];
  for (const category of categories) {
    const all = recipientsOf(category.id);
    const recipients = matchesQuery(query, allLangs(category.name))
      ? [...all]
      : all.filter((r) => matchesQuery(query, [...allLangs(r.name), ...allLangs(r.fullName)]));
    if (recipients.length) groups.push({ category, recipients });
  }
  return groups;
}

export const SearchStore = signalStore(
  { providedIn: 'root' },
  withState({ input: '', query: '' }),
  withComputed((store, catalog = inject(CatalogStore)) => ({
    active: computed(() => normalize(store.query()) !== ''),
    groups: computed(() => {
      const map = catalog.recipientsByCategory();
      return searchCatalog(store.query(), catalog.categories(), (id) => map.get(id) ?? []);
    }),
  })),
  withMethods((store) => {
    const debounce = rxMethod<string>(
      pipe(
        debounceTime(SEARCH_DEBOUNCE),
        distinctUntilChanged(),
        tap((query) => patchState(store, { query })),
      ),
    );
    return {
      /** Called as the user types; `query` follows after the debounce. */
      setInput(input: string): void {
        patchState(store, { input });
        debounce(input);
      },
      /** Applies a value coming from the URL immediately. */
      setImmediate(value: string): void {
        patchState(store, { input: value, query: value });
      },
      clear(): void {
        patchState(store, { input: '', query: '' });
      },
    };
  }),
);
