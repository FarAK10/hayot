import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, defer, of } from 'rxjs';
import { PaymentStatus, Transaction, TransactionPayload } from '../core/models/transaction.models';
import { TransactionApi } from '../core/services/transaction.api';

@Injectable()
export class InMemoryTransactionApi extends TransactionApi {
  private readonly transactions$ = new BehaviorSubject<Transaction[]>([]);

  override makeTransaction(payload: TransactionPayload): Observable<string> {
    return defer(() => {
      const transaction: Transaction = {
        ...payload,
        id: crypto.randomUUID(),
        status: PaymentStatus.Success,
        createdAt: Date.now(),
      };
      this.transactions$.next([transaction, ...this.transactions$.value]);
      return of(transaction.id);
    });
  }

  override getTransactionsHistory(): Observable<Transaction[]> {
    return this.transactions$.asObservable();
  }
}
