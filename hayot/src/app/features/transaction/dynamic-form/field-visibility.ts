import { Field, FieldOption } from '../../../core/models/catalog.models';

export type FormValue = Record<string, unknown>;

export const isEmpty = (v: unknown): boolean => v === null || v === undefined || v === '';

/** Value of the field this one depends on (`requireField`), if any. */
export function parentValue(field: Field, value: FormValue): unknown {
  return field.requireField ? value[field.requireField] : undefined;
}

/**
 * A field with `requireField` is visible only when the parent has a value.
 * A field-level `filterBy` additionally requires the parent to equal it.
 */
export function isVisible(field: Field, value: FormValue): boolean {
  if (!field.requireField) return true;
  const parent = parentValue(field, value);
  if (isEmpty(parent)) return false;
  return field.filterBy === null || field.filterBy === undefined || String(parent) === field.filterBy;
}

/** Options of a SELECT, narrowed by the parent value and sorted by `ord`. */
export function filterOptions(field: Field, value: FormValue): FieldOption[] {
  const options = field.values ?? [];
  const parent = parentValue(field, value);
  const hasParent = !!field.requireField;
  return options
    .filter((o) => o.filterBy === null || !hasParent || String(parent ?? '') === o.filterBy)
    .sort((a, b) => a.ord - b.ord);
}

/** Direct dependents of `key`. */
export const directDependents = (key: string, fields: readonly Field[]): Field[] =>
  fields.filter((f) => f.requireField === key);

/** All fields depending on `key`, directly or through a chain. */
export function dependentsOf(key: string, fields: readonly Field[]): Field[] {
  const result: Field[] = [];
  const seen = new Set<string>([key]);
  const walk = (k: string) => {
    for (const f of directDependents(k, fields)) {
      if (seen.has(f.key)) continue;
      seen.add(f.key);
      result.push(f);
      walk(f.key);
    }
  };
  walk(key);
  return result;
}
