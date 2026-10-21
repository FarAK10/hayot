import { Type } from '@angular/core';
import { FieldType } from '../../../core/models/catalog.models';
import { AmountFieldComponent } from './amount-field/amount-field.component';
import { BaseField } from './base-field';
import { SelectFieldComponent } from './select-field/select-field.component';
import { TextFieldComponent } from './text-field/text-field.component';

export const FIELD_COMPONENTS: Record<FieldType, Type<BaseField>> = {
  [FieldType.Text]: TextFieldComponent,
  [FieldType.PhoneNumber]: TextFieldComponent,
  [FieldType.Amount]: AmountFieldComponent,
  [FieldType.Select]: SelectFieldComponent,
};

export const componentFor = (type: FieldType): Type<BaseField> =>
  FIELD_COMPONENTS[type] ?? TextFieldComponent;
