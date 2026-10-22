import { AMOUNT_DIVISOR } from '../config/app.config.constants';
import { RecipientId, recipientOf } from '../../testing/catalog.fixture';
import { UI_STRINGS } from '../../shared/i18n/ui-strings';
import { formatSum } from './amount.util';
import { TranslateFn, fieldErrorText } from './field-error.util';
import { interpolate } from './text.util';

describe('fieldErrorText', () => {
  const REQUIRED_LENGTH = 9;
  const beeline = recipientOf(RecipientId.Beeline);
  const translate: TranslateFn = (key, params) => interpolate(UI_STRINGS.ru[key], params);

  it('returns null when there are no errors', () => {
    expect(fieldErrorText(null, beeline, translate)).toBeNull();
  });

  it('reports a required field', () => {
    const expected = translate('required');

    expect(fieldErrorText({ required: true }, beeline, translate)).toBe(expected);
  });

  it('reports the recipient minimum in sums', () => {
    const expected = translate('min', { min: formatSum(beeline.minAmount / AMOUNT_DIVISOR) });

    expect(fieldErrorText({ min: true }, beeline, translate)).toBe(expected);
  });

  it('reports the recipient maximum in sums', () => {
    const expected = translate('max', { max: formatSum(beeline.maxAmount / AMOUNT_DIVISOR) });

    expect(fieldErrorText({ max: true }, beeline, translate)).toBe(expected);
  });

  it('reports the required minimum length', () => {
    const expected = translate('minLength', { count: REQUIRED_LENGTH });
    const errors = { minlength: { requiredLength: REQUIRED_LENGTH } };

    expect(fieldErrorText(errors, beeline, translate)).toBe(expected);
  });

  it('reports the allowed maximum length', () => {
    const expected = translate('maxLength', { count: REQUIRED_LENGTH });
    const errors = { maxlength: { requiredLength: REQUIRED_LENGTH } };

    expect(fieldErrorText(errors, beeline, translate)).toBe(expected);
  });

  it('falls back to the format message for a pattern error', () => {
    const expected = translate('format');

    expect(fieldErrorText({ pattern: {} }, beeline, translate)).toBe(expected);
  });
});
