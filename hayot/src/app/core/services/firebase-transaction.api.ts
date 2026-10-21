import { Injectable } from '@angular/core';
import { Observable, from, map, shareReplay, switchMap } from 'rxjs';
import { Transaction, TransactionPayload } from '../models/transaction.models';
import { TransactionApi } from './transaction.api';

@Injectable()
export class FirebaseTransactionApi extends TransactionApi {
  private readonly client$ = from(import('./firebase-client')).pipe(
    map((module) => new module.FirebaseClient()),
    shareReplay({ bufferSize: 1, refCount: false }),
  );

  override create(payload: TransactionPayload): Observable<string> {
    return this.client$.pipe(switchMap((client) => client.create(payload)));
  }

  override history(): Observable<Transaction[]> {
    return this.client$.pipe(switchMap((client) => client.history()));
  }
}
