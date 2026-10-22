import { ChangeDetectionStrategy, Component, computed, input, viewChild } from '@angular/core';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MaskToken, extractRaw, formatWithMask } from '../../../core/utils/mask.util';
import { onlyDigits } from '../../../core/utils/regex.util';
import { InputMode } from '../../models/input-mode.model';
import { ControlBase } from '../control-base';

@Component({
  selector: 'app-text-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatFormField, MatLabel, MatError, MatInput],
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

  protected readonly display = computed(() => this.format(this.value() ?? ''));

  private readonly matInput = viewChild(MatInput);

  protected updateFieldErrorState(): void {
    this.matInput()?.updateErrorState();
  }

  protected onInput(field: HTMLInputElement): void {
    const raw = this.toRaw(field.value);
    field.value = this.format(raw);
    this.emit(raw);
  }

  protected onBlur(): void {
    this.markTouched();
  }

  private toRaw(text: string): string {
    const tokens = this.mask();
    if (tokens) {
      return extractRaw(text, tokens);
    }
    return this.digitsOnly() ? onlyDigits(text) : text;
  }

  private format(raw: string): string {
    const tokens = this.mask();
    return tokens ? formatWithMask(raw, tokens) : raw;
  }
}
