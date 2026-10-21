import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconButton } from '@angular/material/button';
import { map } from 'rxjs';
import { FieldType } from '../../../core/models/catalog.models';
import { PaymentStatus } from '../../../core/models/transaction.models';
import { CatalogStore } from '../../../core/stores/catalog/catalog.store';
import { LanguageStore } from '../../../core/stores/language/language.store';
import { PaymentStore } from '../../../core/stores/payment/payment.store';
import { LogoComponent } from '../../../shared/components/logo/logo.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { FormBuilderService } from '../../../core/form-engine/form-builder.service';
import { buildPayload } from '../../../core/form-engine/payload.builder';
import { PaymentErrorComponent } from './payment-error/payment-error.component';
import { PaymentFormComponent } from './payment-form/payment-form.component';
import { PaymentSuccessComponent } from './payment-success/payment-success.component';

export interface PaymentModalData {
  recipientId: number;
}

@Component({
  selector: 'app-payment-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslatePipe,
    LogoComponent,
    PaymentFormComponent,
    PaymentSuccessComponent,
    PaymentErrorComponent,
    MatIconButton,
  ],
  templateUrl: './payment-modal.component.html',
  styleUrl: './payment-modal.component.scss',
})
export class PaymentModalComponent {
  protected readonly lang = inject(LanguageStore);
  protected readonly store = inject(PaymentStore);
  protected readonly PaymentStatus = PaymentStatus;
  private readonly dialogRef = inject(MatDialogRef<PaymentModalComponent>);
  private readonly dialogData = inject<PaymentModalData>(MAT_DIALOG_DATA);
  private readonly catalog = inject(CatalogStore);
  private readonly formBuilder = inject(FormBuilderService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly recipient = this.catalog.recipient(this.dialogData.recipientId)!;
  private readonly fields = this.catalog.fieldsFor(this.recipient.id);
  protected readonly hasFields = this.fields.length > 0;
  protected readonly dynamicForm = this.formBuilder.create(
    this.fields,
    this.recipient,
    this.destroyRef,
  );

  private readonly amountKey = this.fields.find((field) => field.type === FieldType.Amount)?.key;
  protected readonly amount = toSignal(
    this.dynamicForm.form.valueChanges.pipe(map(() => this.readAmount())),
    { initialValue: 0 },
  );

  protected readonly name = computed(() => this.lang.localize(this.recipient.name));
  protected readonly fullName = computed(() => this.lang.localize(this.recipient.fullName));
  protected readonly total = computed(() => this.store.payload()?.total ?? 0);

  constructor() {
    this.store.reset();
  }

  protected pay(): void {
    this.store.pay(
      buildPayload(this.recipient, this.fields, this.dynamicForm.form.value, this.lang.lang()),
    );
  }

  private readAmount(): number {
    if (!this.amountKey) {
      return 0;
    }
    return Number(this.dynamicForm.form.value[this.amountKey] ?? 0);
  }

  protected close(): void {
    this.dialogRef.close();
  }
}
