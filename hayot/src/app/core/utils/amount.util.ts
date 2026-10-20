import { AMOUNT_DIVISOR } from '../config/app.config.constants';

export const toTiyin = (sum: number): number => Math.round(sum * AMOUNT_DIVISOR);
export const fromTiyin = (tiyin: number): number => tiyin / AMOUNT_DIVISOR;

/** 1500000 -> "1 500 000" (non-breaking spaces) */
export function formatSum(sum: number): string {
  return Math.round(sum)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

export interface CommissionResult {
  amount: number;
  commissionAmount: number;
  total: number;
}

/** All values in tiyin. */
export function calcCommission(amountTiyin: number, percent: number): CommissionResult {
  const commissionAmount = Math.round((amountTiyin * percent) / 100);
  return { amount: amountTiyin, commissionAmount, total: amountTiyin + commissionAmount };
}
