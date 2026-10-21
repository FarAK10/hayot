import { Lang } from './catalog.models';

export enum PaymentStatus {
  Idle = 'idle',
  Pending = 'pending',
  Success = 'success',
  Error = 'error',
}

export interface KeyValue {
  key: string;
  value: string;
}

export interface TransactionPayload {
  recipientId: number;
  categoryId: number;
  amount: number;
  commissionPercent: number;
  commissionAmount: number;
  total: number;
  currency: string;
  lang: Lang;
  keyValue: KeyValue[];
}

export interface Transaction extends TransactionPayload {
  id: string;
  uid?: string;
  status: PaymentStatus.Success;
  createdAt: number;
}
