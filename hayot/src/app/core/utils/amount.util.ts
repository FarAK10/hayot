import { AMOUNT_DIVISOR, PERCENT_BASE } from '../config/app.config.constants';
import { DIGIT_GROUPS } from './regex.util';

export const toTiyin = (sum: number): number => Math.round(sum * AMOUNT_DIVISOR);
export const fromTiyin = (tiyin: number): number => tiyin / AMOUNT_DIVISOR;

export function formatSum(sum: number): string {
  return Math.round(sum).toString().replace(DIGIT_GROUPS, ' ');
}

export interface CommissionResult {
  amount: number;
  commissionAmount: number;
  total: number;
}

export function calcCommission(amountTiyin: number, percent: number): CommissionResult {
  const commissionAmount = Math.round((amountTiyin * percent) / PERCENT_BASE);
  return { amount: amountTiyin, commissionAmount, total: amountTiyin + commissionAmount };
}

export const formatTiyin = (tiyin: number): string => formatSum(fromTiyin(tiyin));
