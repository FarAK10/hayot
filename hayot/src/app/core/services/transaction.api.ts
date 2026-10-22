import { Observable } from 'rxjs';
import { Transaction, TransactionPayload } from '../models/transaction.models';

export abstract class TransactionApi {
  abstract makeTransaction(payload: TransactionPayload): Observable<string>;
  abstract getHistory(): Observable<Transaction[]>;
}
