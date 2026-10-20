import { Injectable } from '@angular/core';
import { Observable, from, switchMap } from 'rxjs';
import { Transaction, TransactionPayload } from '../models/transaction.models';
import { TransactionApi } from './transaction.api';

/** Loads the Firebase SDK lazily, keeping it out of the initial bundle. */
@Injectable()
export class FirebaseTransactionApi extends TransactionApi {
  private readonly client = import('./firebase-client').then((m) => new m.FirebaseClient());

  override async create(payload: TransactionPayload): Promise<string> {
    return (await this.client).create(payload);
  }

  override history(): Observable<Transaction[]> {
    return from(this.client).pipe(switchMap((c) => c.history()));
  }
}
