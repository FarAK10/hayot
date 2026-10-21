import { DestroyRef, Injectable, Signal, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormRecord } from '@angular/forms';
import { Field, FieldOption, Recipient } from '../models/catalog.models';
import { FormValue, isVisible } from './field-visibility.util';
import { FormContext, refreshDependents } from './utils/dependents.util';
import { DynamicControl, buildControls } from './utils/dynamic-control.util';
import { createOptionsLookup } from './utils/options-lookup.util';

export interface DynamicForm {
  form: FormRecord<DynamicControl>;
  visibleFields: Signal<Field[]>;
  optionsFor(key: string): Signal<FieldOption[]>;
  valid: Signal<boolean>;
}

@Injectable({ providedIn: 'root' })
export class FormBuilderService {
  create(
    fields: readonly Field[],
    recipient: Recipient,
    destroyRef = inject(DestroyRef),
  ): DynamicForm {
    const controls = buildControls(fields, recipient);
    const form = new FormRecord<DynamicControl>(controls);
    const { rawValue, valid } = this.trackState(form, destroyRef);
    this.linkDependents({ form, controls, fields }, destroyRef);

    return {
      form,
      valid,
      visibleFields: computed(() => fields.filter((field) => isVisible(field, rawValue()))),
      optionsFor: createOptionsLookup(fields, rawValue),
    };
  }

  private trackState(form: FormRecord<DynamicControl>, destroyRef: DestroyRef) {
    const rawValue = signal<FormValue>(form.getRawValue());
    const valid = signal(form.valid);

    form.valueChanges
      .pipe(takeUntilDestroyed(destroyRef))
      .subscribe(() => rawValue.set(form.getRawValue()));
    form.statusChanges.pipe(takeUntilDestroyed(destroyRef)).subscribe(() => valid.set(form.valid));

    return { rawValue, valid };
  }

  private linkDependents(context: FormContext, destroyRef: DestroyRef): void {
    const parentKeys = new Set(
      context.fields.map((field) => field.requireField).filter((key): key is string => !!key),
    );

    for (const parentKey of parentKeys) {
      context.controls[parentKey]?.valueChanges
        .pipe(takeUntilDestroyed(destroyRef))
        .subscribe(() => {
          refreshDependents(parentKey, context);
          context.form.updateValueAndValidity();
        });
    }
  }
}
