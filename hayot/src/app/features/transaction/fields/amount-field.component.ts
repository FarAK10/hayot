import { Component, computed } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormField, MatHint, MatLabel, MatError, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { AMOUNT_DIVISOR } from '../../../core/config/app.config.constants';
import { formatSum } from '../../../core/utils/amount.util';
import { AmountInputDirective } from '../../../shared/directives/amount-input.directive';
import { BaseField } from './base-field';

@Component({
  selector: 'app-amount-field',
  imports: [ReactiveFormsModule, MatFormField, MatLabel, MatError, MatHint, MatSuffix, MatInput, AmountInputDirective],
  template: `
    <mat-form-field appearance="outline" subscriptSizing="dynamic">
      <mat-label>{{ label() }}</mat-label>
      <input matInput [formControl]="control()" appAmountInput inputmode="numeric" autocomplete="off" />
      <span matSuffix class="suffix">{{ lang.t('sum') }}</span>
      @if (errorText(); as e) {
        <mat-error>{{ e }}</mat-error>
      } @else {
        <mat-hint>{{ hint() }}</mat-hint>
      }
    </mat-form-field>
  `,
  styles: `
    mat-form-field {
      width: 100%;
    }
    .suffix {
      padding-right: 16px;
      color: var(--muted);
    }
  `,
})
export class AmountFieldComponent extends BaseField {
  protected readonly hint = computed(() => {
    const r = this.recipient();
    return this.lang.t('amountRange', {
      min: formatSum(r.minAmount / AMOUNT_DIVISOR),
      max: formatSum(r.maxAmount / AMOUNT_DIVISOR),
    });
  });
}
