import { ValidatorFn, Validators } from '@angular/forms';
import { AMOUNT_DIVISOR } from '../config/app.config.constants';
import { Field, FieldType, Recipient } from '../models/catalog.models';
import { fullMatch } from '../utils/regex.util';

export type AmountLimits = Pick<Recipient, 'minAmount' | 'maxAmount'>;

export function buildValidators(field: Field, limits: AmountLimits): ValidatorFn[] {
  const validators: ValidatorFn[] = [];
  const isAmount = field.type === FieldType.Amount;
  const isSelect = field.type === FieldType.Select;
  const hasTypedLengthLimits = !isAmount && !isSelect && !field.mask;

  if (field.required) {
    validators.push(Validators.required);
  }

  if (field.validation) {
    try {
      validators.push(Validators.pattern(fullMatch(field.validation)));
    } catch {
      console.warn(`Field "${field.key}": invalid validation regex, skipped`, field.validation);
    }
  }

  if (isAmount) {
    validators.push(Validators.min(limits.minAmount / AMOUNT_DIVISOR));
    validators.push(Validators.max(limits.maxAmount / AMOUNT_DIVISOR));
  }

  if (hasTypedLengthLimits) {
    if (field.lengthMin) {
      validators.push(Validators.minLength(field.lengthMin));
    }
    if (field.lengthMax) {
      validators.push(Validators.maxLength(field.lengthMax));
    }
  }

  return validators;
}
