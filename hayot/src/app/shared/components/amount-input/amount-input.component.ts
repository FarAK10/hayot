import { ChangeDetectionStrategy, Component, computed, input, viewChild } from '@angular/core';
import { MatError, MatFormField, MatHint, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MAX_AMOUNT_DIGITS } from '../../../core/config/app.config.constants';
import { formatSum } from '../../../core/utils/amount.util';
import { onlyDigits } from '../../../core/utils/regex.util';
import { ControlBase } from '../control-base';

@Component({
  selector: 'app-amount-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatFormField, MatLabel, MatError, MatHint, MatSuffix, MatInput],
  templateUrl: './amount-input.component.html',
  styleUrl: './amount-input.component.scss',
})
export class AmountInputComponent extends ControlBase<number> {
  readonly label = input.required<string>();
  readonly error = input<string | null>(null);
  readonly hint = input('');
  readonly suffix = input('');

  protected readonly display = computed(() => {
    const amount = this.value();
    return amount === null ? '' : formatSum(amount);
  });

  private readonly matInput = viewChild(MatInput);

  protected updateFieldErrorState(): void {
    this.matInput()?.updateErrorState();
  }

  protected onInput(field: HTMLInputElement): void {
    const digits = onlyDigits(field.value).slice(0, MAX_AMOUNT_DIGITS);
    const amount = digits ? Number(digits) : null;
    field.value = amount === null ? '' : formatSum(amount);
    this.emit(amount);
  }

  protected onBlur(): void {
    this.markTouched();
  }
}
