import { Directive, Signal, computed, inject, input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Field, FieldOption, Recipient } from '../../../core/models/catalog.models';
import { LanguageStore } from '../../../core/stores/language.store';
import { formatSum } from '../../../core/utils/amount.util';
import { AMOUNT_DIVISOR } from '../../../core/config/app.config.constants';

/** Inputs shared by every dynamic field component, so any of them can be rendered via the registry. */
@Directive()
export abstract class BaseField {
  readonly field = input.required<Field>();
  readonly control = input.required<FormControl<string | number | null>>();
  readonly recipient = input.required<Recipient>();
  readonly options = input.required<Signal<FieldOption[]>>();

  protected readonly lang = inject(LanguageStore);
  protected readonly label = computed(() => this.lang.localize(this.field().name));

  /** Localized message for the control's first error, or null. Call from the template. */
  protected errorText(): string | null {
    const errors = this.control().errors;
    if (!errors) return null;
    const r = this.recipient();
    if (errors['required']) return this.lang.t('required');
    if (errors['min']) return this.lang.t('min', { min: formatSum(r.minAmount / AMOUNT_DIVISOR) });
    if (errors['max']) return this.lang.t('max', { max: formatSum(r.maxAmount / AMOUNT_DIVISOR) });
    return this.lang.t('format');
  }
}
