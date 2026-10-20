import { ValidatorFn, Validators } from '@angular/forms';
import { AMOUNT_DIVISOR } from '../../../core/config/app.config.constants';
import { Field, Recipient } from '../../../core/models/catalog.models';

export type AmountLimits = Pick<Recipient, 'minAmount' | 'maxAmount'>;

/**
 * Field -> validators (pure).
 *
 * Lengths are ignored for AMOUNT and masked fields: the data is inconsistent there
 * (see README "Data inconsistencies handled"); limits / regex + mask win.
 */
export function buildValidators(field: Field, limits: AmountLimits): ValidatorFn[] {
  const validators: ValidatorFn[] = [];
  const isAmount = field.type === 'AMOUNT';

  if (field.required) validators.push(Validators.required);

  if (field.validation) {
    try {
      validators.push(Validators.pattern(new RegExp('^(?:' + field.validation + ')$')));
    } catch {
      console.warn(`Field "${field.key}": invalid validation regex, skipped`, field.validation);
    }
  }

  if (isAmount) {
    validators.push(Validators.min(limits.minAmount / AMOUNT_DIVISOR));
    validators.push(Validators.max(limits.maxAmount / AMOUNT_DIVISOR));
  } else if (!field.mask) {
    if (field.lengthMin) validators.push(Validators.minLength(field.lengthMin));
    if (field.lengthMax) validators.push(Validators.maxLength(field.lengthMax));
  }

  return validators;
}
