import { Directive, computed, inject, input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Field, FieldOption, Recipient } from '../../../core/models/catalog.models';
import { LanguageStore } from '../../../core/stores/language/language.store';
import { formatSum } from '../../../core/utils/amount.util';
import { AMOUNT_DIVISOR } from '../../../core/config/app.config.constants';

@Directive()
export abstract class BaseField {
  readonly field = input.required<Field>();
  readonly control = input.required<FormControl<string | number | null>>();
  readonly recipient = input.required<Recipient>();
  readonly options = input.required<FieldOption[]>();

  protected readonly languageStore = inject(LanguageStore);
  protected readonly label = computed(() => this.languageStore.localize(this.field().name));

  protected errorText(): string | null {
    const errors = this.control().errors;
    if (!errors) {
      return null;
    }
    const r = this.recipient();
    if (errors['required']) {
      return this.languageStore.t('required');
    }
    if (errors['min']) {
      return this.languageStore.t('min', { min: formatSum(r.minAmount / AMOUNT_DIVISOR) });
    }
    if (errors['max']) {
      return this.languageStore.t('max', { max: formatSum(r.maxAmount / AMOUNT_DIVISOR) });
    }
    return this.languageStore.t('format');
  }
}
