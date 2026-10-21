import { FormControl, FormRecord } from '@angular/forms';
import { Field, FieldValue, Recipient, isAmountField } from '../../models/catalog.models';
import { buildValidators } from '../validators.factory';

export type DynamicControl = FormControl<FieldValue>;
export type DynamicForm = FormRecord<DynamicControl>;

export const emptyValueFor = (field: Field): string | null => (isAmountField(field) ? null : '');

export function buildControls(
  fields: readonly Field[],
  recipient: Recipient,
): Record<string, DynamicControl> {
  const controls: Record<string, DynamicControl> = {};
  for (const field of fields) {
    controls[field.key] = new FormControl(
      { value: emptyValueFor(field), disabled: !!field.requireField },
      { validators: buildValidators(field, recipient), nonNullable: false },
    );
  }
  return controls;
}
