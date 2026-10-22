import { DestroyRef, Injectable, computed, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormRecord } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { map } from 'rxjs';
import { parentKeysOf } from '../../../core/form-engine/field-visibility.util';
import { buildPayload } from '../../../core/form-engine/payload.builder';
import { FormContext, refreshDependents } from '../../../core/form-engine/utils/dependents.util';
import {
  DynamicControl,
  DynamicForm,
  buildControls,
} from '../../../core/form-engine/utils/dynamic-control.util';
import { FieldType } from '../../../core/models/catalog.models';
import { TransactionPayload } from '../../../core/models/transaction.models';
import { CatalogStore } from '../../../core/stores/catalog/catalog.store';
import { LanguageStore } from '../../../core/stores/language/language.store';
import { PaymentModalData } from './payment-modal.models';

@Injectable()
export class PaymentFormService {
  private readonly catalogStore = inject(CatalogStore);
  private readonly languageStore = inject(LanguageStore);
  private readonly dialogData = inject<PaymentModalData>(MAT_DIALOG_DATA);

  readonly recipient = this.catalogStore.getRecipientById(this.dialogData.recipientId)!;
  readonly fields = this.catalogStore.getFieldsFor(this.recipient.id);
  private readonly destroyRef = inject(DestroyRef);
  private readonly controls = buildControls(this.fields, this.recipient);
  readonly dynamicForm: DynamicForm = new FormRecord<DynamicControl>(this.controls);

  readonly rawValue = toSignal(
    this.dynamicForm.valueChanges.pipe(map(() => this.dynamicForm.getRawValue())),
    { initialValue: this.dynamicForm.getRawValue() },
  );
  readonly valid = toSignal(
    this.dynamicForm.statusChanges.pipe(map(() => this.dynamicForm.valid)),
    {
      initialValue: this.dynamicForm.valid,
    },
  );

  private readonly amountKey = this.fields.find((field) => field.type === FieldType.Amount)?.key;
  readonly amount = computed(() =>
    this.amountKey ? Number(this.rawValue()[this.amountKey] ?? 0) : 0,
  );

  constructor() {
    this.linkDependents();
  }

  private linkDependents(): void {
    const context: FormContext = {
      form: this.dynamicForm,
      controls: this.controls,
      fields: this.fields,
    };
    for (const parentKey of parentKeysOf(this.fields)) {
      this.controls[parentKey]?.valueChanges
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          refreshDependents(parentKey, context);
          this.dynamicForm.updateValueAndValidity();
        });
    }
  }

  buildPayload(): TransactionPayload {
    return buildPayload(
      this.recipient,
      this.fields,
      this.dynamicForm.value,
      this.languageStore.lang(),
    );
  }
}
