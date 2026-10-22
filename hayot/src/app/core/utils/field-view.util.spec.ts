import { InputMode } from '../../shared/models/input-mode.model';
import { RecipientId, fieldOf, recipientOf } from '../../testing/catalog.fixture';
import { UI_STRINGS } from '../../shared/i18n/ui-strings';
import { AMOUNT_DIVISOR } from '../config/app.config.constants';
import { FieldType, Localized, TextField } from '../models/catalog.models';
import { formatSum } from './amount.util';
import { TranslateFn } from './field-error.util';
import { amountHintOf, inputModeOf, isDigitsOnly, placeholderOf } from './field-view.util';
import { MaskToken, maskTemplate, parseMask } from './mask.util';
import { interpolate } from './text.util';

describe('field view helpers', () => {
  const DIGITS_ONLY_PATTERN = String.raw`\d{9}`;
  const CUSTOM_PLACEHOLDER = 'Custom placeholder';
  const DESCRIPTION: Localized = { ru: 'Описание', en: 'Description' };
  const phoneField = fieldOf(RecipientId.Beeline, 'phone_number') as TextField;
  const phoneTokens = parseMask(phoneField.mask) as MaskToken[];
  const localizeEnglish = (text: Localized | null | undefined): string => text?.en ?? '';
  const translate: TranslateFn = (key, params) => interpolate(UI_STRINGS.ru[key], params);

  const textField = (overrides: Partial<TextField>): TextField => ({
    ...phoneField,
    type: FieldType.Text,
    mask: null,
    validation: null,
    placeholder: null,
    description: DESCRIPTION,
    ...overrides,
  });

  describe('inputModeOf', () => {
    it('uses the phone keypad for a masked field', () => {
      expect(inputModeOf(phoneField, phoneTokens)).toBe(InputMode.Tel);
    });

    it('uses the numeric keypad for a digits-only pattern', () => {
      const field = textField({ validation: DIGITS_ONLY_PATTERN });

      expect(isDigitsOnly(field)).toBe(true);
      expect(inputModeOf(field, null)).toBe(InputMode.Numeric);
    });

    it('uses the phone keypad for a phone field without a mask', () => {
      const field = textField({ type: FieldType.PhoneNumber });

      expect(inputModeOf(field, null)).toBe(InputMode.Tel);
    });

    it('uses plain text otherwise', () => {
      expect(inputModeOf(textField({}), null)).toBe(InputMode.Text);
    });
  });

  describe('placeholderOf', () => {
    it('prefers the field placeholder', () => {
      const field = textField({ placeholder: CUSTOM_PLACEHOLDER });

      expect(placeholderOf(field, phoneTokens, localizeEnglish)).toBe(CUSTOM_PLACEHOLDER);
    });

    it('shows the mask template when there is no placeholder', () => {
      const expected = maskTemplate(phoneTokens);

      expect(placeholderOf(textField({}), phoneTokens, localizeEnglish)).toBe(expected);
    });

    it('falls back to the localized description', () => {
      expect(placeholderOf(textField({}), null, localizeEnglish)).toBe(DESCRIPTION.en);
    });
  });

  it('describes the allowed amount range in sums', () => {
    const beeline = recipientOf(RecipientId.Beeline);
    const expected = translate('amountRange', {
      min: formatSum(beeline.minAmount / AMOUNT_DIVISOR),
      max: formatSum(beeline.maxAmount / AMOUNT_DIVISOR),
    });

    expect(amountHintOf(beeline, translate)).toBe(expected);
  });
});
