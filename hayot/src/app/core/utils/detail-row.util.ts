import { Field, FieldType, Lang } from '../models/catalog.models';
import { KeyValue } from '../models/transaction.models';
import { formatTiyin } from './amount.util';
import { localize } from './localize.util';
import { formatWithMask, parseMask } from './mask.util';

export interface DetailRow {
  key: string;
  label: string;
  value: string;
}

function displayValue(value: string, field: Field, lang: Lang, sumLabel: string): string {
  if (field.type === FieldType.Amount) {
    return `${formatTiyin(Number(value))} ${sumLabel}`;
  }
  if (field.type === FieldType.Select) {
    const option = field.values?.find((candidate) => candidate.value === value);
    return option ? localize(option.name, lang) : value;
  }
  const maskTokens = parseMask(field.mask);
  return maskTokens ? formatWithMask(value, maskTokens) : value;
}

export function toDetailRow(
  pair: KeyValue,
  field: Field | undefined,
  lang: Lang,
  sumLabel: string,
): DetailRow {
  if (!field) {
    return { key: pair.key, label: pair.key, value: pair.value };
  }
  return {
    key: pair.key,
    label: localize(field.name, lang) || pair.key,
    value: displayValue(pair.value, field, lang, sumLabel),
  };
}
