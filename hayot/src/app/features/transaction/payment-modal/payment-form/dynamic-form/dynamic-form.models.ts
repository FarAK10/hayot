import { Type } from '@angular/core';
import { BaseField } from '../../../fields/base-field';

export interface RenderedField {
  key: string;
  component: Type<BaseField>;
  inputs: Record<string, unknown>;
}
