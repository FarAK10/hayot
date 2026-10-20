import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { map } from 'rxjs';
import { CatalogStore } from '../../../core/stores/catalog.store';
import { LanguageStore } from '../../../core/stores/language.store';
import { PaymentStore } from '../../../core/stores/payment.store';
import { formatSum, fromTiyin } from '../../../core/utils/amount.util';
import { LogoComponent } from '../../../shared/components/logo.component';
import { CommissionSummaryComponent } from '../commission-summary.component';
import { DynamicFormComponent } from '../dynamic-form/dynamic-form.component';
import { FormBuilderService } from '../dynamic-form/form-builder.service';
import { buildPayload } from '../payload.builder';

export interface PaymentModalData {
  recipientId: number;
}

@Component({
  selector: 'app-payment-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LogoComponent, DynamicFormComponent, CommissionSummaryComponent, MatButton, MatIconButton, MatProgressSpinner],
  templateUrl: './payment-modal.component.html',
  styleUrl: './payment-modal.component.scss',
})
export class PaymentModalComponent {
  protected readonly lang = inject(LanguageStore);
  protected readonly store = inject(PaymentStore);
  private readonly dialogRef = inject(MatDialogRef<PaymentModalComponent>);
  private readonly catalog = inject(CatalogStore);

  protected readonly recipient = this.catalog.recipient(inject<PaymentModalData>(MAT_DIALOG_DATA).recipientId)!;
  private readonly fields = this.catalog.fieldsFor(this.recipient.id);
  protected readonly hasFields = this.fields.length > 0;
  protected readonly dyn = inject(FormBuilderService).create(this.fields, this.recipient, inject(DestroyRef));

  private readonly amountKey = this.fields.find((f) => f.type === 'AMOUNT')?.key;
  protected readonly amount = toSignal(
    this.dyn.form.valueChanges.pipe(map(() => (this.amountKey ? Number(this.dyn.form.value[this.amountKey] ?? 0) : 0))),
    { initialValue: 0 },
  );

  protected readonly name = computed(() => this.lang.localize(this.recipient.name));
  protected readonly fullName = computed(() => this.lang.localize(this.recipient.fullName));
  protected readonly totalText = computed(
    () => `${formatSum(fromTiyin(this.store.payload()?.total ?? 0))} ${this.lang.t('sum')}`,
  );

  constructor() {
    this.store.reset();
  }

  protected pay(): void {
    if (this.dyn.form.invalid) {
      this.dyn.form.markAllAsTouched();
      return;
    }
    void this.store.pay(buildPayload(this.recipient, this.fields, this.dyn.form.value, this.lang.lang()));
  }

  protected close(): void {
    this.dialogRef.close();
  }
}
