import { Component, computed } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormField, MatHint, MatLabel, MatError, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { AMOUNT_DIVISOR } from '../../../../core/config/app.config.constants';
import { formatSum } from '../../../../core/utils/amount.util';
import { AmountInputDirective } from '../../../../shared/directives/amount-input.directive';
import { BaseField } from '../base-field';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-amount-field',
  imports: [
    TranslatePipe,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatError,
    MatHint,
    MatSuffix,
    MatInput,
    AmountInputDirective,
  ],
  templateUrl: './amount-field.component.html',
  styleUrl: './amount-field.component.scss',
})
export class AmountFieldComponent extends BaseField {
  protected readonly hint = computed(() => {
    const r = this.recipient();
    return this.languageStore.t('amountRange', {
      min: formatSum(r.minAmount / AMOUNT_DIVISOR),
      max: formatSum(r.maxAmount / AMOUNT_DIVISOR),
    });
  });
}
