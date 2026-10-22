import { Field, Lang, isAmountField, isSelectField } from '../models/catalog.models';
import { KeyValue } from '../models/transaction.models';
import { formatTiyin } from './amount.util';
import { localize } from './text.util';
import { formatWithMask, parseMask } from './mask.util';

export interface DetailRow {
  key: string;
  label: string;
  value: string;
}

function displayValue(value: string, field: Field, lang: Lang, sumLabel: string): string {
  if (isAmountField(field)) {
    return `${formatTiyin(Number(value))} ${sumLabel}`;
  }
  if (isSelectField(field)) {
    const option = field.options.find((candidate) => candidate.value === value);
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
