import { CURRENCY } from '../../core/config/app.config.constants';
import { Field, Lang, Recipient } from '../../core/models/catalog.models';
import { KeyValue, TransactionPayload } from '../../core/models/transaction.models';
import { calcCommission, toTiyin } from '../../core/utils/amount.util';
import { isEmpty } from './dynamic-form/field-visibility';

/**
 * (recipient, fields, enabled form value, lang) -> payload (pure).
 * `formValue` must be `form.value`, which already excludes disabled (hidden) controls.
 * Fields are emitted in `ord` order; the amount field is converted from sum to tiyin.
 */
export function buildPayload(
  recipient: Recipient,
  fields: readonly Field[],
  formValue: Record<string, unknown>,
  lang: Lang,
): TransactionPayload {
  let amountTiyin = 0;
  const keyValue: KeyValue[] = [];

  for (const field of [...fields].sort((a, b) => a.ord - b.ord)) {
    const value = formValue[field.key];
    if (!(field.key in formValue) || isEmpty(value)) continue;
    if (field.type === 'AMOUNT') {
      amountTiyin = toTiyin(Number(value));
      keyValue.push({ key: field.key, value: String(amountTiyin) });
    } else {
      keyValue.push({ key: field.key, value: String(value) });
    }
  }

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
