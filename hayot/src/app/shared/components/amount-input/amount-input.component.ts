import { ChangeDetectionStrategy, Component, input, viewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatError, MatFormField, MatHint, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { AmountInputDirective } from '../../directives/amount-input.directive';
import { ControlBase } from '../control-base';

@Component({
  selector: 'app-amount-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatError,
    MatHint,
    MatSuffix,
    MatInput,
    AmountInputDirective,
  ],
  templateUrl: './amount-input.component.html',
  styleUrl: './amount-input.component.scss',
})
export class AmountInputComponent extends ControlBase<number> {
  readonly label = input.required<string>();
  readonly error = input<string | null>(null);
  readonly hint = input('');
  readonly suffix = input('');

  private readonly matInput = viewChild(MatInput);

  protected updateFieldErrorState(): void {
    this.matInput()?.updateErrorState();
  }

  protected onBlur(): void {
    this.markTouched();
  }
}
