import { FormRecord } from '@angular/forms';
import { Field, FieldType } from '../../models/catalog.models';
import { directDependents, filterOptions, isVisible } from '../field-visibility.util';
import { DynamicControl, emptyValueFor } from './dynamic-control.util';

export interface FormContext {
  form: FormRecord<DynamicControl>;
  controls: Record<string, DynamicControl>;
  fields: readonly Field[];
}

function refreshDependent(dependent: Field, { form, controls }: FormContext): void {
  const control = controls[dependent.key];
  const isNowVisible = isVisible(dependent, form.getRawValue());

  control.reset(emptyValueFor(dependent), { emitEvent: false });
  if (isNowVisible) {
    control.enable({ emitEvent: false });
  } else {
    control.disable({ emitEvent: false });
  }

  if (isNowVisible && dependent.type === FieldType.Select) {
    const options = filterOptions(dependent, form.getRawValue());
    if (options.length === 1) {
      control.setValue(options[0].value, { emitEvent: false });
    }
  }
}

export function refreshDependents(key: string, context: FormContext): void {
  for (const dependent of directDependents(key, context.fields)) {
    refreshDependent(dependent, context);
    refreshDependents(dependent.key, context);
  }
}
