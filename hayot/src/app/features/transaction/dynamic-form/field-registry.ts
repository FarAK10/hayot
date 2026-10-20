import { Type } from '@angular/core';
import { FieldType } from '../../../core/models/catalog.models';
import { AmountFieldComponent } from '../fields/amount-field.component';
import { BaseField } from '../fields/base-field';
import { SelectFieldComponent } from '../fields/select-field.component';
import { TextFieldComponent } from '../fields/text-field.component';

export const FIELD_COMPONENTS: Record<string, Type<BaseField>> = {
  TEXT: TextFieldComponent,
  PHONE_NUMBER: TextFieldComponent,
  AMOUNT: AmountFieldComponent,
  SELECT: SelectFieldComponent,
};

/** Unknown types fall back to TEXT so new backend types never crash the app. */
export const componentFor = (type: FieldType): Type<BaseField> =>
  FIELD_COMPONENTS[type] ?? TextFieldComponent;
