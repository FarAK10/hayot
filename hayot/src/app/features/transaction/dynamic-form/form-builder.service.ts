import { DestroyRef, Injectable, Signal, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup } from '@angular/forms';
import { Field, FieldOption, Recipient } from '../../../core/models/catalog.models';
import { directDependents, filterOptions, isVisible } from './field-visibility';
import { buildValidators } from './validators.factory';

export type DynamicFormGroup = FormGroup<Record<string, FormControl<string | number | null>>>;

export interface DynamicForm {
  form: DynamicFormGroup;
  visibleFields: Signal<Field[]>;
  optionsFor(key: string): Signal<FieldOption[]>;
  /** Mirrors `form.valid` as a signal. */
  valid: Signal<boolean>;
}

@Injectable({ providedIn: 'root' })
export class FormBuilderService {
  /** Must be called in an injection context (or pass a DestroyRef). */
  create(fields: readonly Field[], recipient: Recipient, destroyRef = inject(DestroyRef)): DynamicForm {
    const controls: Record<string, FormControl<string | number | null>> = {};
    for (const f of fields) {
      controls[f.key] = new FormControl<string | number | null>(
        { value: f.type === 'AMOUNT' ? null : '', disabled: !!f.requireField },
        { validators: buildValidators(f, recipient), nonNullable: false },
      );
    }
    const form: DynamicFormGroup = new FormGroup(controls);
    const raw = signal(form.getRawValue());
    const valid = signal(form.valid);

    form.valueChanges.pipe(takeUntilDestroyed(destroyRef)).subscribe(() => raw.set(form.getRawValue()));
    form.statusChanges.pipe(takeUntilDestroyed(destroyRef)).subscribe(() => valid.set(form.valid));

    /** Re-evaluates dependents of `key` after its value changed: reset, show/hide, auto-select. */
    const refresh = (key: string) => {
      for (const dep of directDependents(key, fields)) {
        const control = controls[dep.key];
        const visible = isVisible(dep, form.getRawValue());
        control.reset(dep.type === 'AMOUNT' ? null : '', { emitEvent: false });
        if (visible) control.enable({ emitEvent: false });
        else control.disable({ emitEvent: false });
        if (visible && dep.type === 'SELECT') {
          const options = filterOptions(dep, form.getRawValue());
          if (options.length === 1) control.setValue(options[0].value, { emitEvent: false });
        }
        refresh(dep.key);
      }
    };

    const parents = new Set(fields.map((f) => f.requireField).filter((k): k is string => !!k));
    for (const key of parents) {
      controls[key]?.valueChanges.pipe(takeUntilDestroyed(destroyRef)).subscribe(() => {
        refresh(key);
        form.updateValueAndValidity();
      });
    }

    const optionSignals = new Map<string, Signal<FieldOption[]>>();
    const fieldByKey = new Map(fields.map((f) => [f.key, f]));
    return {
      form,
      valid,
      visibleFields: computed(() => fields.filter((f) => isVisible(f, raw()))),
      optionsFor(key) {
        let s = optionSignals.get(key);
        if (!s) {
          const field = fieldByKey.get(key);
          s = computed(() => (field ? filterOptions(field, raw()) : []));
          optionSignals.set(key, s);
        }
        return s;
      },
    };
  }
}
