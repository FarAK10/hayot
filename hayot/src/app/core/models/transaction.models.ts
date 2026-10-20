import { Lang } from './catalog.models';

export interface KeyValue {
  key: string;
  value: string;
}

export interface TransactionPayload {
  recipientId: number;
  categoryId: number;
  /** tiyin */
  amount: number;
  commissionPercent: number;
  /** tiyin */
  commissionAmount: number;
  /** tiyin */
  total: number;
  currency: string;
  lang: Lang;
  keyValue: KeyValue[];
}

export interface Transaction extends TransactionPayload {
  id: string;
  uid?: string;
  status: 'success';
  /** epoch millis */
  createdAt: number;
}
