import { calcCommission, formatSum, toTiyin } from './amount.util';

describe('amount.util', () => {
  it('converts sum to tiyin', () => expect(toTiyin(150000)).toBe(15000000));
  it('formats with separators', () => expect(formatSum(1500000)).toBe('1 500 000'));
  it('rounds commission and totals up', () => {
    expect(calcCommission(15000000, 1)).toEqual({
      amount: 15000000,
      commissionAmount: 150000,
      total: 15150000,
    });
    const r = calcCommission(50001, 1.5);
    expect(r.commissionAmount).toBe(750);
    expect(r.total).toBe(50751);
  });
});
