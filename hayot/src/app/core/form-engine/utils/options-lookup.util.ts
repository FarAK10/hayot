import { Signal, computed } from '@angular/core';
import { Field, FieldOption } from '../../models/catalog.models';
import { FormValue, filterOptions } from '../field-visibility.util';

export function createOptionsLookup(fields: readonly Field[], rawValue: Signal<FormValue>) {
  const fieldByKey = new Map(fields.map((field) => [field.key, field]));
  const optionsByKey = new Map<string, Signal<FieldOption[]>>();

  return (key: string): Signal<FieldOption[]> => {
    let options = optionsByKey.get(key);
    if (!options) {
      const field = fieldByKey.get(key);
      options = computed(() => (field ? filterOptions(field, rawValue()) : []));
      optionsByKey.set(key, options);
    }
    return options;
  };
}
