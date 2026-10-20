import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Transaction, TransactionPayload } from '../models/transaction.models';
import { TransactionApi } from './transaction.api';

const STORAGE_KEY = 'payflow.transactions';

/** localStorage-backed implementation: offline fallback and test double. */
@Injectable()
export class LocalTransactionApi extends TransactionApi {
  private readonly items$ = new BehaviorSubject<Transaction[]>(this.read());

  override async create(payload: TransactionPayload): Promise<string> {
    const tx: Transaction = {
      ...payload,
      id: crypto.randomUUID(),
      status: 'success',
      createdAt: Date.now(),
    };
    const next = [tx, ...this.items$.value].slice(0, 50);
    this.items$.next(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable: keep in memory only */
    }
    return tx.id;
  }

  override history(): Observable<Transaction[]> {
    return this.items$.asObservable();
  }

  private read(): Transaction[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as Transaction[];
    } catch {
      return [];
    }
  }
}
