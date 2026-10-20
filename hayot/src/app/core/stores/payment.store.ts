import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { TransactionApi } from '../services/transaction.api';
import { TransactionPayload } from '../models/transaction.models';

type PaymentStatus = 'idle' | 'pending' | 'success' | 'error';

interface PaymentState {
  status: PaymentStatus;
  payload: TransactionPayload | null;
  transactionId: string | null;
}

const initial: PaymentState = { status: 'idle', payload: null, transactionId: null };

/** State of the payment modal's submit flow. */
export const PaymentStore = signalStore(
  { providedIn: 'root' },
  withState<PaymentState>(initial),
  withMethods((store, api = inject(TransactionApi)) => {
    const send = async (payload: TransactionPayload): Promise<void> => {
      patchState(store, { status: 'pending', payload });
      try {
        const transactionId = await api.create(payload);
        patchState(store, { status: 'success', transactionId });
      } catch (e) {
        console.error('Transaction failed', e);
        patchState(store, { status: 'error' });
      }
    };
    return {
      pay: send,
      /** Re-sends the same payload. */
      async retry(): Promise<void> {
        const payload = store.payload();
        if (payload && store.status() !== 'pending') await send(payload);
      },
      reset(): void {
        patchState(store, initial);
      },
    };
  }),
);
