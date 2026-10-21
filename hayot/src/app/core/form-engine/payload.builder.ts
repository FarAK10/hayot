import { CURRENCY } from '../config/app.config.constants';
import { Field, FieldValue, Lang, Recipient, isAmountField } from '../models/catalog.models';
import { KeyValue, TransactionPayload } from '../models/transaction.models';
import { calcCommission, toTiyin } from '../utils/amount.util';
import { FormValue, isEmpty } from './field-visibility.util';

const isFilled = (field: Field, formValue: FormValue): boolean =>
  field.key in formValue && !isEmpty(formValue[field.key]);

function toPayloadValue(field: Field, value: FieldValue | undefined): string {
  return isAmountField(field) ? String(toTiyin(Number(value))) : String(value);
}

export function buildPayload(
  recipient: Recipient,
  fields: readonly Field[],
  formValue: FormValue,
  lang: Lang,
): TransactionPayload {
  const filledFields = fields.filter((field) => isFilled(field, formValue));

  const keyValue: KeyValue[] = filledFields.map((field) => ({
    key: field.key,
    value: toPayloadValue(field, formValue[field.key]),
  }));

  const amountField = filledFields.find(isAmountField);
  const amountTiyin = amountField ? toTiyin(Number(formValue[amountField.key])) : 0;
  const { commissionAmount, total } = calcCommission(amountTiyin, recipient.commission);

  return {
    recipientId: recipient.id,
    categoryId: recipient.categoryId,
    amount: amountTiyin,
    commissionPercent: recipient.commission,
    commissionAmount,
    total,
    currency: CURRENCY,
    lang,
    keyValue,
  };
}
