import { HttpClient } from '@angular/common/http';
import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import { CatalogResponse, Category, Field, Recipient } from '../models/catalog.models';

export const CATALOG_URL = 'data/response.json';

const byOrd = <T extends { ord: number }>(a: T, b: T): number => a.ord - b.ord;

/** Sorts every level by `ord` without mutating the API response. */
export function normalizeCatalog(data: CatalogResponse): CatalogResponse {
  return {
    categories: [...data.categories].sort(byOrd),
    recipients: [...data.recipients].sort(byOrd),
    fields: [...data.fields]
      .map((f) => (f.values ? { ...f, values: [...f.values].sort(byOrd) } : f))
      .sort(byOrd),
  };
}

type Status = 'idle' | 'loading' | 'loaded' | 'error';

interface CatalogState extends CatalogResponse {
  status: Status;
}

export const CatalogStore = signalStore(
  { providedIn: 'root' },
  withState<CatalogState>({ categories: [], recipients: [], fields: [], status: 'idle' }),
  withComputed(({ categories, recipients, fields, status }) => {
    const recipientsByCategory = computed(() => {
      const map = new Map<number, Recipient[]>();
      for (const r of recipients()) (map.get(r.categoryId) ?? map.set(r.categoryId, []).get(r.categoryId)!).push(r);
      return map;
    });
    const fieldsByRecipient = computed(() => {
      const map = new Map<number, Field[]>();
      for (const f of fields()) (map.get(f.recipientId) ?? map.set(f.recipientId, []).get(f.recipientId)!).push(f);
      return map;
    });
    return {
      recipientsByCategory,
      fieldsByRecipient,
      categoryById: computed(() => new Map(categories().map((c) => [c.id, c]))),
      recipientById: computed(() => new Map(recipients().map((r) => [r.id, r]))),
      loading: computed(() => status() === 'loading' || status() === 'idle'),
      failed: computed(() => status() === 'error'),
    };
  }),
  withMethods((store, http = inject(HttpClient)) => ({
    async load(): Promise<void> {
      patchState(store, { status: 'loading' });
      try {
        const data = await firstValueFrom(http.get<CatalogResponse>(CATALOG_URL));
        patchState(store, { ...normalizeCatalog(data), status: 'loaded' });
      } catch {
        patchState(store, { status: 'error' });
      }
    },
    recipientsOf: (categoryId: number): Recipient[] => store.recipientsByCategory().get(categoryId) ?? [],
    category: (id: number): Category | undefined => store.categoryById().get(id),
    recipient: (id: number): Recipient | undefined => store.recipientById().get(id),
    fieldsFor: (recipientId: number): Field[] => store.fieldsByRecipient().get(recipientId) ?? [],
  })),
);
