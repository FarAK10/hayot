import { Component, computed } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { DigitsOnlyDirective } from '../../../shared/directives/digits-only.directive';
import { MaskDirective } from '../../../shared/directives/mask.directive';
import { maskTemplate, parseMask } from '../../../core/utils/mask.util';
import { BaseField } from './base-field';

/** `\d{9}`, `\d{6,8}`: validation patterns made only of digit quantifiers. */
const DIGITS_ONLY = /^(?:\\d(?:\{\d+(?:,\d*)?\})?)+$/;

@Component({
  selector: 'app-text-field',
  imports: [ReactiveFormsModule, MatFormField, MatLabel, MatError, MatInput, MaskDirective, DigitsOnlyDirective],
  template: `
    <mat-form-field appearance="outline" subscriptSizing="dynamic">
      <mat-label>{{ label() }}</mat-label>
      @if (tokens(); as t) {
        <input matInput [formControl]="control()" [appMask]="t" [attr.inputmode]="inputMode()" [placeholder]="placeholder()" />
      } @else if (digitsOnly()) {
        <input matInput [formControl]="control()" appDigitsOnly inputmode="numeric" [placeholder]="placeholder()" />
      } @else {
        <input matInput [formControl]="control()" [attr.inputmode]="inputMode()" [placeholder]="placeholder()" />
      }
      @if (errorText(); as e) {
        <mat-error>{{ e }}</mat-error>
      }
    </mat-form-field>
  `,
  styles: `
    mat-form-field {
      width: 100%;
    }
  `,
})
export class TextFieldComponent extends BaseField {
  /** Mask applies to any field that has one, whatever its type. */
  protected readonly tokens = computed(() => parseMask(this.field().mask));
  protected readonly digitsOnly = computed(() => DIGITS_ONLY.test(this.field().validation ?? ''));
  protected readonly inputMode = computed(() =>
    this.field().type === 'PHONE_NUMBER' || this.tokens() || this.digitsOnly() ? 'tel' : 'text',
  );
  protected readonly placeholder = computed(() => {
    const f = this.field();
    const t = this.tokens();
    if (f.placeholder && this.lang.lang() === 'ru') return f.placeholder;
    return t ? maskTemplate(t) : this.lang.localize(f.description);
  });
}
