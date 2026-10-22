import { FormControl } from '@angular/forms';
import { AMOUNT_DIVISOR } from '../config/app.config.constants';
import { Field } from '../models/catalog.models';
import { RecipientId, Region, fieldOf, fieldsOf, recipientOf } from '../../testing/catalog.fixture';
import { filterOptions, isVisible, dependentsOf, parentKeysOf } from './field-visibility.util';
import { buildValidators } from './validators.factory';

const SOATO_OPTIONS_COUNT = { [Region.TashkentRegion]: 22, [Region.TashkentCity]: 11 };
const SERVICE_OPTIONS_COUNT = { [Region.TashkentRegion]: 2, [Region.TashkentCity]: 1 };
const TASHKENT_CITY_SERVICE = '3014,3013';

function errorsFor(recipientId: RecipientId, key: string, value: string | number | null) {
  const control = new FormControl(
    value,
    buildValidators(fieldOf(recipientId, key), recipientOf(recipientId)),
  );
  return control.errors;
}

describe('validators.factory', () => {
  it('SELECT values ignore lengthMax (an option id can be longer than the limit)', () => {
    const service = fieldOf(RecipientId.Electricity, 'SERVICE_ID');
    expect(TASHKENT_CITY_SERVICE.length).toBeGreaterThan(service.lengthMax!);

    expect(errorsFor(RecipientId.Electricity, 'SERVICE_ID', TASHKENT_CITY_SERVICE)).toBeNull();
    expect(errorsFor(RecipientId.Electricity, 'SERVICE_ID', '')).toHaveProperty('required');
  });

  it('UCell clientid: regex wins, lengthMax is not applied', () => {
    expect(errorsFor(RecipientId.UCell, 'clientid', '931234567')).toBeNull();
    expect(errorsFor(RecipientId.UCell, 'clientid', '901234567')).toHaveProperty('pattern');
    expect(errorsFor(RecipientId.UCell, 'clientid', '93123456')).toHaveProperty('pattern');
    expect(errorsFor(RecipientId.UCell, 'clientid', '')).toHaveProperty('required');
  });
  it('Beeline phone accepts 90 and 91 prefixes', () => {
    expect(errorsFor(RecipientId.Beeline, 'phone_number', '901234567')).toBeNull();
    expect(errorsFor(RecipientId.Beeline, 'phone_number', '911234567')).toBeNull();
    expect(errorsFor(RecipientId.Beeline, 'phone_number', '921234567')).toHaveProperty('pattern');
  });
  it('Al Arabiya client_id needs exactly 9 digits', () => {
    expect(errorsFor(RecipientId.AlArabiya, 'client_id', '123456789')).toBeNull();
    expect(errorsFor(RecipientId.AlArabiya, 'client_id', '12345678')).toHaveProperty('pattern');
    expect(errorsFor(RecipientId.AlArabiya, 'client_id', '1234567890')).toHaveProperty('pattern');
  });
  it('Electricity customer_code accepts 6-8 digits', () => {
    expect(errorsFor(RecipientId.Electricity, 'customer_code', '123456')).toBeNull();
    expect(errorsFor(RecipientId.Electricity, 'customer_code', '12345678')).toBeNull();
    expect(errorsFor(RecipientId.Electricity, 'customer_code', '12345')).toHaveProperty('pattern');
    expect(errorsFor(RecipientId.Electricity, 'customer_code', '123456789')).toHaveProperty(
      'pattern',
    );
  });
  it('AMOUNT limits follow the recipient / AMOUNT_DIVISOR; lengthMax ignored', () => {
    const ucell = recipientOf(RecipientId.UCell);
    const minSum = ucell.minAmount / AMOUNT_DIVISOR;
    const maxSum = ucell.maxAmount / AMOUNT_DIVISOR;
    const electricityMaxSum = recipientOf(RecipientId.Electricity).maxAmount / AMOUNT_DIVISOR;

    expect(errorsFor(RecipientId.UCell, 'amount', minSum - 1)).toHaveProperty('min');
    expect(errorsFor(RecipientId.UCell, 'amount', minSum)).toBeNull();
    expect(errorsFor(RecipientId.UCell, 'amount', maxSum)).toBeNull();
    expect(errorsFor(RecipientId.UCell, 'amount', maxSum + 1)).toHaveProperty('max');
    expect(errorsFor(RecipientId.Electricity, 'summa', electricityMaxSum)).toBeNull();
  });
});

describe('field-visibility', () => {
  const soato = fieldOf(RecipientId.Electricity, 'soato');
  const service = fieldOf(RecipientId.Electricity, 'SERVICE_ID');

  it('hides dependents until REGION is set', () => {
    expect(isVisible(soato, { REGION: '' })).toBe(false);
    expect(isVisible(service, {})).toBe(false);
    expect(isVisible(soato, { REGION: Region.TashkentRegion })).toBe(true);
  });
  it('filters options by region', () => {
    for (const region of [Region.TashkentRegion, Region.TashkentCity]) {
      expect(filterOptions(soato, { REGION: region })).toHaveLength(SOATO_OPTIONS_COUNT[region]);
      expect(filterOptions(service, { REGION: region })).toHaveLength(
        SERVICE_OPTIONS_COUNT[region],
      );
    }
  });
  it('lists each parent key once', () => {
    const electricityFields = fieldsOf(RecipientId.Electricity);

    expect(parentKeysOf(electricityFields)).toEqual(['REGION']);
    expect(parentKeysOf([])).toEqual([]);
  });
  it('finds dependents recursively', () => {
    const chain = [
      { key: 'a' },
      { key: 'b', requireField: 'a' },
      { key: 'c', requireField: 'b' },
    ] as Field[];

    expect(dependentsOf('a', chain).map((field) => field.key)).toEqual(['b', 'c']);
  });
});
