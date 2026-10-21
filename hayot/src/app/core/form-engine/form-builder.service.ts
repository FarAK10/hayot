import { DestroyRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormRecord } from '@angular/forms';
import { Field, Recipient } from '../models/catalog.models';
import { parentKeysOf } from './field-visibility.util';
import { FormContext, refreshDependents } from './utils/dependents.util';
import { DynamicControl, DynamicForm, buildControls } from './utils/dynamic-control.util';

@Injectable({ providedIn: 'root' })
export class FormBuilderService {
  create(
    fields: readonly Field[],
    recipient: Recipient,
    destroyRef = inject(DestroyRef),
  ): DynamicForm {
    const controls = buildControls(fields, recipient);
    const dynamicForm = new FormRecord<DynamicControl>(controls);
    this.linkDependents({ form: dynamicForm, controls, fields }, destroyRef);
    return dynamicForm;
  }

  private linkDependents(context: FormContext, destroyRef: DestroyRef): void {
    for (const parentKey of parentKeysOf(context.fields)) {
      context.controls[parentKey]?.valueChanges
        .pipe(takeUntilDestroyed(destroyRef))
        .subscribe(() => {
          refreshDependents(parentKey, context);
          context.form.updateValueAndValidity();
        });
    }
  }
}
