import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
} from '@angular/core';
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
export class PaymentModalComponent implements OnInit {
  private readonly languageStore = inject(LanguageStore);
  private readonly paymentStore = inject(PaymentStore);
  protected readonly status = this.paymentStore.status;
  protected readonly transactionId = this.paymentStore.transactionId;
  protected readonly PaymentStatus = PaymentStatus;
  private readonly dialogRef = inject(MatDialogRef<PaymentModalComponent>);
  private readonly dialogData = inject<PaymentModalData>(MAT_DIALOG_DATA);
  private readonly catalogStore = inject(CatalogStore);
  private readonly formBuilder = inject(FormBuilderService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly recipient = this.catalogStore.getRecipientById(this.dialogData.recipientId)!;
  protected readonly fields = this.catalogStore.getFieldsFor(this.recipient.id);
  protected readonly hasFields = this.fields.length > 0;
  protected readonly dynamicForm = this.formBuilder.create(
    this.fields,
    this.recipient,
    this.destroyRef,
  );

  protected readonly rawValue = toSignal(
    this.dynamicForm.valueChanges.pipe(map(() => this.dynamicForm.getRawValue())),
    { initialValue: this.dynamicForm.getRawValue() },
  );
  protected readonly valid = toSignal(
    this.dynamicForm.statusChanges.pipe(map(() => this.dynamicForm.valid)),
    { initialValue: this.dynamicForm.valid },
  );

  private readonly amountKey = this.fields.find((field) => field.type === FieldType.Amount)?.key;
  protected readonly amount = computed(() =>
    this.amountKey ? Number(this.rawValue()[this.amountKey] ?? 0) : 0,
  );

  protected readonly name = computed(() => this.languageStore.localize(this.recipient.name));
  protected readonly fullName = computed(() =>
    this.languageStore.localize(this.recipient.fullName),
  );
  protected readonly total = computed(() => this.paymentStore.payload()?.total ?? 0);

  ngOnInit(): void {
    this.paymentStore.reset();
  }

  protected pay(): void {
    this.paymentStore.pay(
      buildPayload(this.recipient, this.fields, this.dynamicForm.value, this.languageStore.lang()),
    );
  }

  protected retry(): void {
    this.paymentStore.retry();
  }

  protected close(): void {
    this.dialogRef.close();
  }
}
