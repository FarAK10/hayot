import { DynamicControl } from '../../../../../core/form-engine/utils/dynamic-control.util';
import {
  Field,
  FieldOption,
  Lang,
  Recipient,
  isAmountField,
  isSelectField,
} from '../../../../../core/models/catalog.models';
import { TranslateFn, fieldErrorText } from '../../../../../core/utils/field-error.util';
import {
  LocalizeFn,
  amountHintOf,
  inputModeOf,
  isDigitsOnly,
  placeholderOf,
} from '../../../../../core/utils/field-view.util';
import { MaskToken, parseMask } from '../../../../../core/utils/mask.util';
import { SelectOption } from '../../../../../shared/models/select-option.model';
import { ControlType, RenderedField } from './dynamic-form.models';

export interface RenderContext {
  controls: Record<string, DynamicControl>;
  recipient: Recipient;
  optionsByKey: Record<string, FieldOption[]>;
  tokensByKey: Map<string, MaskToken[] | null>;
  lang: Lang;
  localize: LocalizeFn;
  t: TranslateFn;
}

export function tokensByKeyOf(fields: readonly Field[]): Map<string, MaskToken[] | null> {
  return new Map(fields.map((field) => [field.key, parseMask(field.mask)]));
}

export function selectOptionsOf(
  options: FieldOption[] | undefined,
  localize: LocalizeFn,
): SelectOption[] {
  return (options ?? []).map((option) => ({
    value: option.value,
    label: localize(option.name),
  }));
}

export function renderField(field: Field, context: RenderContext): RenderedField {
  const { recipient, localize, t } = context;
  const control = context.controls[field.key];
  const base = {
    key: field.key,
    control,
    label: localize(field.name),
    error: fieldErrorText(control.errors, recipient, t),
  };

  if (isAmountField(field)) {
    return {
      ...base,
      controlType: ControlType.Amount,
      hint: amountHintOf(recipient, t),
      suffix: t('sum'),
    };
  }

  if (isSelectField(field)) {
    return {
      ...base,
      controlType: ControlType.Select,
      placeholder: t('choose'),
      options: selectOptionsOf(context.optionsByKey[field.key], localize),
    };
  }

  const tokens = context.tokensByKey.get(field.key) ?? null;
  return {
    ...base,
    controlType: ControlType.Text,
    placeholder: placeholderOf(field, tokens, context.lang, localize),
    tokens,
    digitsOnly: isDigitsOnly(field),
    inputMode: inputModeOf(field, tokens),
  };
}
