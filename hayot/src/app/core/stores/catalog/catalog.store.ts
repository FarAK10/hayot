import { HttpClient } from '@angular/common/http';
import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { EMPTY, catchError, pipe, switchMap, tap } from 'rxjs';
import { CATALOG_URL } from '../../config/app.config.constants';
import {
  CatalogResponse,
  Category,
  Field,
  LoadStatus,
  Recipient,
} from '../../models/catalog.models';
import { isCatalogPending, normalizeCatalog } from '../../utils/catalog.util';
import { groupBy, indexBy } from '../../utils/collection.util';
import { SearchGroup, catalogGroups } from '../../utils/search.util';

interface CatalogState extends CatalogResponse {
  status: LoadStatus;
  input: string;
  query: string;
}

export const CatalogStore = signalStore(
  { providedIn: 'root' },
  withState<CatalogState>({
    categories: [],
    recipients: [],
    fields: [],
    status: LoadStatus.Idle,
    input: '',
    query: '',
  }),
  withComputed(({ categories, recipients, fields, status, query }) => {
    const recipientsByCategory = computed(() =>
      groupBy(recipients(), (recipient) => recipient.categoryId),
    );
    const fieldsByRecipient = computed(() => groupBy(fields(), (field) => field.recipientId));

    return {
      recipientsByCategory,
      fieldsByRecipient,
      categoryById: computed(() => indexBy(categories(), (category) => category.id)),
      recipientById: computed(() => indexBy(recipients(), (recipient) => recipient.id)),
      loading: computed(() => isCatalogPending(status())),
      failed: computed(() => status() === LoadStatus.Error),
      groups: computed<SearchGroup[]>(() =>
        catalogGroups(query(), categories(), (id) => recipientsByCategory().get(id) ?? []),
      ),
    };
  }),
  withMethods((store, http = inject(HttpClient)) => ({
    load: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { status: LoadStatus.Loading })),
        switchMap(() =>
          http.get<CatalogResponse>(CATALOG_URL).pipe(
            tap((data) =>
              patchState(store, { ...normalizeCatalog(data), status: LoadStatus.Loaded }),
            ),
            catchError(() => {
              patchState(store, { status: LoadStatus.Error });
              return EMPTY;
            }),
          ),
        ),
      ),
    ),
    setSearchInput(input: string): void {
      patchState(store, { input });
    },
    setSearchQuery(query: string): void {
      patchState(store, { query });
    },
    setSearchImmediate(value: string): void {
      patchState(store, { input: value, query: value });
    },
    clearSearch(): void {
      patchState(store, { input: '', query: '' });
    },
    recipientsOf: (categoryId: number): Recipient[] =>
      store.recipientsByCategory().get(categoryId) ?? [],
    category: (id: number): Category | undefined => store.categoryById().get(id),
    recipient: (id: number): Recipient | undefined => store.recipientById().get(id),
    fieldsFor: (recipientId: number): Field[] => store.fieldsByRecipient().get(recipientId) ?? [],
  })),
);
