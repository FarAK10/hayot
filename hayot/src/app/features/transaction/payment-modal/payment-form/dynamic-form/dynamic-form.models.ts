import { DynamicControl } from '../../../../../core/form-engine/utils/dynamic-control.util';
import { MaskToken } from '../../../../../core/utils/mask.util';
import { InputMode } from '../../../../../shared/models/input-mode.model';
import { SelectOption } from '../../../../../shared/models/select-option.model';

export enum ControlType {
  Text = 'text',
  Amount = 'amount',
  Select = 'select',
}

interface RenderedBase {
  key: string;
  control: DynamicControl;
  label: string;
  error: string | null;
}

export interface RenderedText extends RenderedBase {
  controlType: ControlType.Text;
  placeholder: string;
  tokens: MaskToken[] | null;
  digitsOnly: boolean;
  inputMode: InputMode;
}

export interface RenderedAmount extends RenderedBase {
  controlType: ControlType.Amount;
  hint: string;
  suffix: string;
}

export interface RenderedSelect extends RenderedBase {
  controlType: ControlType.Select;
  placeholder: string;
  options: SelectOption[];
}

export type RenderedField = RenderedText | RenderedAmount | RenderedSelect;
