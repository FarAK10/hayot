import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { Transaction } from '../models/transaction.models';
import { TransactionApi } from '../services/transaction.api';

export const HistoryStore = signalStore(
  { providedIn: 'root' },
  withState<{ items: Transaction[]; loading: boolean; failed: boolean }>({
    items: [],
    loading: true,
    failed: false,
  }),
  withMethods((store, api = inject(TransactionApi)) => ({
    /** Subscribes to the user's transactions; call once from the history page. */
    watch: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, failed: false })),
        switchMap(() =>
          api.history().pipe(
            tap({
              next: (items) => patchState(store, { items, loading: false }),
              error: () => patchState(store, { loading: false, failed: true }),
            }),
          ),
        ),
      ),
    ),
  })),
);
