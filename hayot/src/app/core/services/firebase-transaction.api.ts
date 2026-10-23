import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Transaction, TransactionPayload } from '../models/transaction.models';
import { FirebaseClient } from './firebase-client';
import { TransactionApi } from './transaction.api';

@Injectable()
export class FirebaseTransactionApi extends TransactionApi {
  private readonly client = inject(FirebaseClient);

  override makeTransaction(payload: TransactionPayload): Observable<string> {
    return this.client.makeTransaction(payload);
  }

  override getTransactionsHistory(): Observable<Transaction[]> {
    return this.client.getTransactionsHistory();
  }
}
