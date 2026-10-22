import { ValidationErrors } from '@angular/forms';
import { UiKey } from '../../shared/i18n/ui-strings';
import { AMOUNT_DIVISOR } from '../config/app.config.constants';
import { Recipient } from '../models/catalog.models';
import { formatSum } from './amount.util';
import { InterpolationParams } from './text.util';

export type TranslateFn = (key: UiKey, params?: InterpolationParams) => string;

export function fieldErrorText(
  errors: ValidationErrors | null,
  recipient: Recipient,
  translate: TranslateFn,
): string | null {
  if (!errors) {
    return null;
  }
  if (errors['required']) {
    return translate('required');
  }
  if (errors['min']) {
    return translate('min', { min: formatSum(recipient.minAmount / AMOUNT_DIVISOR) });
  }
  if (errors['max']) {
    return translate('max', { max: formatSum(recipient.maxAmount / AMOUNT_DIVISOR) });
  }
  if (errors['minlength']) {
    return translate('minLength', { count: errors['minlength'].requiredLength });
  }
  if (errors['maxlength']) {
    return translate('maxLength', { count: errors['maxlength'].requiredLength });
  }
  return translate('format');
}
