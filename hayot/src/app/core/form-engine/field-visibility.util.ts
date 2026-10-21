import { Field, FieldOption } from '../models/catalog.models';

export type FormValue = Record<string, unknown>;

export const isEmpty = (value: unknown): boolean =>
  value === null || value === undefined || value === '';

export function parentValue(field: Field, value: FormValue): unknown {
  return field.requireField ? value[field.requireField] : undefined;
}

export function isVisible(field: Field, value: FormValue): boolean {
  if (!field.requireField) {
    return true;
  }
  const parent = parentValue(field, value);
  if (isEmpty(parent)) {
    return false;
  }
  const hasNoFilter = field.filterBy === null || field.filterBy === undefined;
  const matchesFilter = String(parent) === field.filterBy;
  return hasNoFilter || matchesFilter;
}

export function filterOptions(field: Field, value: FormValue): FieldOption[] {
  const options = field.values ?? [];
  const dependsOnParent = !!field.requireField;
  const parentText = String(parentValue(field, value) ?? '');

  const isShown = (option: FieldOption): boolean => {
    const isUnfiltered = option.filterBy === null;
    const matchesParent = parentText === option.filterBy;
    return isUnfiltered || !dependsOnParent || matchesParent;
  };

  return options.filter(isShown).sort((first, second) => first.ord - second.ord);
}

export const directDependents = (key: string, fields: readonly Field[]): Field[] =>
  fields.filter((field) => field.requireField === key);

export function dependentsOf(key: string, fields: readonly Field[]): Field[] {
  const result: Field[] = [];
  const seen = new Set<string>([key]);
  const walk = (current: string) => {
    for (const dependent of directDependents(current, fields)) {
      if (seen.has(dependent.key)) {
        continue;
      }
      seen.add(dependent.key);
      result.push(dependent);
      walk(dependent.key);
    }
  };
  walk(key);
  return result;
}
