import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { EMPTY, catchError, exhaustMap, pipe, tap } from 'rxjs';
import { TransactionApi } from '../../services/transaction.api';
import { PaymentStatus, TransactionPayload } from '../../models/transaction.models';

interface PaymentState {
  status: PaymentStatus;
  payload: TransactionPayload | null;
  transactionId: string | null;
}

const initial: PaymentState = { status: PaymentStatus.Idle, payload: null, transactionId: null };

export const PaymentStore = signalStore(
  { providedIn: 'root' },
  withState<PaymentState>(initial),
  withMethods((store, api = inject(TransactionApi)) => {
    const pay = rxMethod<TransactionPayload>(
      pipe(
        tap((payload) => patchState(store, { status: PaymentStatus.Pending, payload })),
        exhaustMap((payload) =>
          api.makeTransaction(payload).pipe(
            tap((transactionId) =>
              patchState(store, { status: PaymentStatus.Success, transactionId }),
            ),
            catchError((error) => {
              console.error('Transaction failed', error);
              patchState(store, { status: PaymentStatus.Error });
              return EMPTY;
            }),
          ),
        ),
      ),
    );

    return {
      pay,
      retry(): void {
        const payload = store.payload();
        if (payload && store.status() !== PaymentStatus.Pending) {
          pay(payload);
        }
      },
      reset(): void {
        patchState(store, initial);
      },
    };
  }),
);
