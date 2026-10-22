import { InputMode } from '../../shared/models/input-mode.model';
import { AMOUNT_DIVISOR } from '../config/app.config.constants';
import { Field, FieldType, Lang, Localized, Recipient } from '../models/catalog.models';
import { formatSum } from './amount.util';
import { TranslateFn } from './field-error.util';
import { MaskToken, maskTemplate } from './mask.util';
import { DIGITS_ONLY_VALIDATION } from './regex.util';

export type LocalizeFn = (text: Localized | null | undefined) => string;

export const isDigitsOnly = (field: Field): boolean =>
  DIGITS_ONLY_VALIDATION.test(field.validation ?? '');

export function inputModeOf(field: Field, tokens: MaskToken[] | null): InputMode {
  if (tokens) {
    return InputMode.Tel;
  }
  if (isDigitsOnly(field)) {
    return InputMode.Numeric;
  }
  return field.type === FieldType.PhoneNumber ? InputMode.Tel : InputMode.Text;
}

export function placeholderOf(
  field: Field,
  tokens: MaskToken[] | null,
  lang: Lang,
  localizeText: LocalizeFn,
): string {
  if (field.placeholder && lang === 'ru') {
    return field.placeholder;
  }
  if (tokens) {
    return maskTemplate(tokens);
  }
  return localizeText(field.description);
}

export const amountHintOf = (recipient: Recipient, translate: TranslateFn): string =>
  translate('amountRange', {
    min: formatSum(recipient.minAmount / AMOUNT_DIVISOR),
    max: formatSum(recipient.maxAmount / AMOUNT_DIVISOR),
  });
