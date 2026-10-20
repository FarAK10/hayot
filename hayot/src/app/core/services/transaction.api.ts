import { Observable } from 'rxjs';
import { Transaction, TransactionPayload } from '../models/transaction.models';

export abstract class TransactionApi {
  /** Saves a transaction and resolves with its id. */
  abstract create(payload: TransactionPayload): Promise<string>;
  /** The current user's transactions, newest first. */
  abstract history(): Observable<Transaction[]>;
}
