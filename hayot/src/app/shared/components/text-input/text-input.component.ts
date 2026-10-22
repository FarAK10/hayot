import { ChangeDetectionStrategy, Component, input, viewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MaskToken } from '../../../core/utils/mask.util';
import { DigitsOnlyDirective } from '../../directives/digits-only.directive';
import { MaskDirective } from '../../directives/mask.directive';
import { InputMode } from '../../models/input-mode.model';
import { ControlBase } from '../control-base';

@Component({
  selector: 'app-text-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatError,
    MatInput,
    MaskDirective,
    DigitsOnlyDirective,
  ],
  templateUrl: './text-input.component.html',
  styleUrl: './text-input.component.scss',
})
export class TextInputComponent extends ControlBase<string> {
  readonly label = input.required<string>();
  readonly placeholder = input('');
  readonly error = input<string | null>(null);
  readonly inputMode = input<InputMode>(InputMode.Text);
  readonly mask = input<MaskToken[] | null>(null);
  readonly digitsOnly = input(false);

  private readonly matInput = viewChild(MatInput);

  protected updateFieldErrorState(): void {
    this.matInput()?.updateErrorState();
  }

  protected onBlur(): void {
    this.markTouched();
  }
}
