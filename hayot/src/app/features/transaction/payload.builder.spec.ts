import data from '../../../../public/data/response.json';
import { CatalogResponse } from '../../core/models/catalog.models';
import { normalizeCatalog } from '../../core/stores/catalog.store';
import { buildPayload } from './payload.builder';

const catalog = normalizeCatalog(data as unknown as CatalogResponse);
const electricity = catalog.recipients.find((r) => r.id === 4012)!;
const fields = catalog.fields.filter((f) => f.recipientId === 4012);

describe('buildPayload', () => {
  const value = {
    summa: 150000,
    customer_code: '1234567',
    SERVICE_ID: '3042,3041',
    soato: '27419',
    REGION: '2159',
  };

  it('matches the contract and follows field ord', () => {
    expect(buildPayload(electricity, fields, value, 'ru')).toEqual({
      recipientId: 4012,
      categoryId: 24202,
      amount: 15000000,
      commissionPercent: 1,
      commissionAmount: 150000,
      total: 15150000,
      currency: 'UZS',
      lang: 'ru',
      keyValue: [
        { key: 'REGION', value: '2159' },
        { key: 'soato', value: '27419' },
        { key: 'SERVICE_ID', value: '3042,3041' },
        { key: 'customer_code', value: '1234567' },
        { key: 'summa', value: '15000000' },
      ],
    });
  });

  it('excludes hidden (missing) and empty fields', () => {
    const p = buildPayload(electricity, fields, { customer_code: '123456', summa: 500, soato: '' }, 'en');
    expect(p.keyValue.map((k) => k.key)).toEqual(['customer_code', 'summa']);
  });

  it('rounds the commission and keeps the total consistent', () => {
    const beeline = catalog.recipients.find((r) => r.id === 23303)!;
    const bf = catalog.fields.filter((f) => f.recipientId === 23303);
    const p = buildPayload(beeline, bf, { phone_number: '901234567', summa: 500.01 }, 'uz');
    expect(p.amount).toBe(50001);
    expect(p.commissionAmount).toBe(750);
    expect(p.total).toBe(p.amount + p.commissionAmount);
    expect(p.keyValue).toEqual([
      { key: 'phone_number', value: '901234567' },
      { key: 'summa', value: '50001' },
    ]);
  });
});
