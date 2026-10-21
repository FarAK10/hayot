import type { QueryDocumentSnapshot } from 'firebase/firestore';
import { Transaction } from '../models/transaction.models';

export function toTransaction(document: QueryDocumentSnapshot): Transaction {
  const data = document.data({ serverTimestamps: 'estimate' });
  const createdAt = data['createdAt']?.toMillis() ?? Date.now();
  return { ...data, id: document.id, createdAt } as Transaction;
}
