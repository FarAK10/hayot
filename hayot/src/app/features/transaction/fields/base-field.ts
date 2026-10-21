import { Directive, computed, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ValidationErrors } from '@angular/forms';
import { map, startWith, switchMap } from 'rxjs';
import { AMOUNT_DIVISOR } from '../../../core/config/app.config.constants';
import { DynamicControl } from '../../../core/form-engine/utils/dynamic-control.util';
import { Field, FieldOption, Recipient } from '../../../core/models/catalog.models';
import { LanguageStore } from '../../../core/stores/language/language.store';
import { formatSum } from '../../../core/utils/amount.util';

@Directive()
export abstract class BaseField {
  readonly field = input.required<Field>();
  readonly control = input.required<DynamicControl>();
  readonly recipient = input.required<Recipient>();
  readonly options = input.required<FieldOption[]>();

  protected readonly languageStore = inject(LanguageStore);
  protected readonly label = computed(() => this.languageStore.localize(this.field().name));

  private readonly errors = toSignal(
    toObservable(this.control).pipe(
      switchMap((control) =>
        control.statusChanges.pipe(
          startWith(control.status),
          map((): ValidationErrors | null => control.errors),
        ),
      ),
    ),
    { initialValue: null },
  );

  protected readonly errorText = computed<string | null>(() => {
    const errors = this.errors();
    if (!errors) {
      return null;
    }
    const recipient = this.recipient();
    if (errors['required']) {
      return this.languageStore.t('required');
    }
    if (errors['min']) {
      return this.languageStore.t('min', { min: formatSum(recipient.minAmount / AMOUNT_DIVISOR) });
    }
    if (errors['max']) {
      return this.languageStore.t('max', { max: formatSum(recipient.maxAmount / AMOUNT_DIVISOR) });
    }
    if (errors['minlength']) {
      return this.languageStore.t('minLength', { count: errors['minlength'].requiredLength });
    }
    if (errors['maxlength']) {
      return this.languageStore.t('maxLength', { count: errors['maxlength'].requiredLength });
    }
    return this.languageStore.t('format');
  });
}
