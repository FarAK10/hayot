import { Lang } from '../models/catalog.models';
import { AMOUNT_DIVISOR } from '../config/app.config.constants';
import { KeyValue } from '../models/transaction.models';
import { RecipientId, Region, fieldOf, selectFieldOf } from '../../testing/catalog.fixture';
import { formatTiyin } from './amount.util';
import { toDetailRow } from './detail-row.util';
import { localize } from './text.util';

const SUM_LABEL = 'sum';

describe('toDetailRow', () => {
  const regionField = selectFieldOf(RecipientId.Electricity, 'REGION');
  const amountField = fieldOf(RecipientId.Electricity, 'summa');
  const codeField = fieldOf(RecipientId.Electricity, 'customer_code');
  const phoneField = fieldOf(RecipientId.Beeline, 'phone_number');

  it('uses the localized field name as the label', () => {
    const pair: KeyValue = { key: 'customer_code', value: '1234567' };
    const expected = { key: pair.key, label: localize(codeField.name, Lang.En), value: pair.value };

    expect(toDetailRow(pair, codeField, Lang.En, SUM_LABEL)).toEqual(expected);
  });

  it('shows the option name instead of a select value, in the active language', () => {
    const pair: KeyValue = { key: 'REGION', value: Region.TashkentCity };
    const option = regionField.options.find((candidate) => candidate.value === pair.value)!;

    expect(toDetailRow(pair, regionField, Lang.Uz, SUM_LABEL).value).toBe(
      localize(option.name, Lang.Uz),
    );
    expect(toDetailRow(pair, regionField, Lang.Ru, SUM_LABEL).label).toBe(
      localize(regionField.name, Lang.Ru),
    );
  });

  it('formats a stored amount (tiyin) as a sum with its label', () => {
    const amountSum = 252_454;
    const pair: KeyValue = { key: 'summa', value: String(amountSum * AMOUNT_DIVISOR) };
    const expectedValue = `${formatTiyin(amountSum * AMOUNT_DIVISOR)} ${SUM_LABEL}`;

    expect(toDetailRow(pair, amountField, Lang.Ru, SUM_LABEL).value).toBe(expectedValue);
  });

  it('formats a masked phone number with its mask', () => {
    const pair: KeyValue = { key: 'phone_number', value: '901234567' };

    expect(toDetailRow(pair, phoneField, Lang.Ru, SUM_LABEL).value).toBe('998(90) 123-45-67');
  });

  it('falls back to the raw pair when the field is unknown', () => {
    const pair: KeyValue = { key: 'legacy_key', value: 'abc' };
    const expected = { key: pair.key, label: pair.key, value: pair.value };

    expect(toDetailRow(pair, undefined, Lang.Ru, SUM_LABEL)).toEqual(expected);
  });
});
