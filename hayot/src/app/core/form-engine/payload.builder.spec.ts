import { AMOUNT_DIVISOR, CURRENCY, PERCENT_BASE } from '../config/app.config.constants';
import { TransactionPayload } from '../models/transaction.models';
import { RecipientId, Region, fieldsOf, recipientOf } from '../../testing/catalog.fixture';
import { buildPayload } from './payload.builder';

describe('buildPayload', () => {
  const electricity = recipientOf(RecipientId.Electricity);
  const electricityFields = fieldsOf(RecipientId.Electricity);

  const AMOUNT_SUM = 150_000;
  const AMOUNT_TIYIN = AMOUNT_SUM * AMOUNT_DIVISOR;
  const COMMISSION_TIYIN = (AMOUNT_TIYIN * electricity.commission) / PERCENT_BASE;

  const formValue = {
    summa: AMOUNT_SUM,
    customer_code: '1234567',
    SERVICE_ID: '3042,3041',
    soato: '27419',
    REGION: Region.TashkentRegion,
  };

  it('matches the contract and follows field ord', () => {
    const expected: TransactionPayload = {
      recipientId: electricity.id,
      categoryId: electricity.categoryId,
      amount: AMOUNT_TIYIN,
      commissionPercent: electricity.commission,
      commissionAmount: COMMISSION_TIYIN,
      total: AMOUNT_TIYIN + COMMISSION_TIYIN,
      currency: CURRENCY,
      lang: 'ru',
      keyValue: [
        { key: 'REGION', value: formValue.REGION },
        { key: 'soato', value: formValue.soato },
        { key: 'SERVICE_ID', value: formValue.SERVICE_ID },
        { key: 'customer_code', value: formValue.customer_code },
        { key: 'summa', value: String(AMOUNT_TIYIN) },
      ],
    };

    expect(buildPayload(electricity, electricityFields, formValue, 'ru')).toEqual(expected);
  });

  it('excludes hidden (missing) and empty fields', () => {
    const partialValue = { customer_code: '123456', summa: 500, soato: '' };

    const payload = buildPayload(electricity, electricityFields, partialValue, 'en');

    expect(payload.keyValue.map((pair) => pair.key)).toEqual(['customer_code', 'summa']);
  });

  it('rounds the commission and keeps the total consistent', () => {
    const beeline = recipientOf(RecipientId.Beeline);
    const oddAmountSum = 500.01;
    const oddAmountTiyin = Math.round(oddAmountSum * AMOUNT_DIVISOR);
    const roundedCommission = Math.round((oddAmountTiyin * beeline.commission) / PERCENT_BASE);
    const beelineValue = { phone_number: '901234567', summa: oddAmountSum };
    const expectedKeyValue = [
      { key: 'phone_number', value: beelineValue.phone_number },
      { key: 'summa', value: String(oddAmountTiyin) },
    ];

    const payload = buildPayload(beeline, fieldsOf(RecipientId.Beeline), beelineValue, 'uz');

    expect(payload.amount).toBe(oddAmountTiyin);
    expect(payload.commissionAmount).toBe(roundedCommission);
    expect(payload.total).toBe(payload.amount + payload.commissionAmount);
    expect(payload.keyValue).toEqual(expectedKeyValue);
  });
});
