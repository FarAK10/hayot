import { ChangeDetectionStrategy, Component, input, viewChild } from '@angular/core';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatOption, MatSelect, MatSelectChange } from '@angular/material/select';
import { SelectOption } from '../../models/select-option.model';
import { ControlBase } from '../control-base';

@Component({
  selector: 'app-select-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatFormField, MatLabel, MatError, MatSelect, MatOption],
  templateUrl: './select-input.component.html',
  styleUrl: './select-input.component.scss',
})
export class SelectInputComponent extends ControlBase<string> {
  readonly label = input.required<string>();
  readonly options = input.required<SelectOption[]>();
  readonly placeholder = input('');
  readonly error = input<string | null>(null);

  private readonly matSelect = viewChild(MatSelect);

  protected updateFieldErrorState(): void {
    this.matSelect()?.updateErrorState();
  }

  protected onSelectionChange(change: MatSelectChange<string>): void {
    this.emit(change.value);
  }

  protected onOpenedChange(opened: boolean): void {
    if (!opened) {
      this.markTouched();
    }
  }
}
