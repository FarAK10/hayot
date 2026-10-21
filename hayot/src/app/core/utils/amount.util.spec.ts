import { AMOUNT_DIVISOR, PERCENT_BASE } from '../config/app.config.constants';
import { calcCommission, formatSum, toTiyin } from './amount.util';

const AMOUNT_SUM = 150_000;
const AMOUNT_TIYIN = AMOUNT_SUM * AMOUNT_DIVISOR;
const COMMISSION_PERCENT = 1;

const LARGE_SUM = 1_500_000;
const NBSP = ' ';
const LARGE_SUM_TEXT = ['1', '500', '000'].join(NBSP);

describe('amount.util', () => {
  it('converts sum to tiyin', () => expect(toTiyin(AMOUNT_SUM)).toBe(AMOUNT_TIYIN));
  it('formats with separators', () => expect(formatSum(LARGE_SUM)).toBe(LARGE_SUM_TEXT));

  it('calculates the commission and the total', () => {
    const commissionAmount = (AMOUNT_TIYIN * COMMISSION_PERCENT) / PERCENT_BASE;
    const expected = {
      amount: AMOUNT_TIYIN,
      commissionAmount,
      total: AMOUNT_TIYIN + commissionAmount,
    };

    expect(calcCommission(AMOUNT_TIYIN, COMMISSION_PERCENT)).toEqual(expected);
  });

  it('rounds a fractional commission and keeps the total consistent', () => {
    const oddAmountTiyin = 50_001;
    const fractionalPercent = 1.5;
    const roundedCommission = Math.round((oddAmountTiyin * fractionalPercent) / PERCENT_BASE);

    const result = calcCommission(oddAmountTiyin, fractionalPercent);

    expect(result.commissionAmount).toBe(roundedCommission);
    expect(result.total).toBe(oddAmountTiyin + roundedCommission);
  });
});
