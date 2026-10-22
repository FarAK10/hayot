import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconButton } from '@angular/material/button';
import { PaymentStatus } from '../../../core/models/transaction.models';
import { LanguageStore } from '../../../core/stores/language/language.store';
import { PaymentStore } from '../../../core/stores/payment/payment.store';
import { LogoComponent } from '../../../shared/components/logo/logo.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { PaymentErrorComponent } from './payment-error/payment-error.component';
import { PaymentFormComponent } from './payment-form/payment-form.component';
import { PaymentFormService } from './payment-form-service/payment-form.service';
import { PaymentSuccessComponent } from './payment-success/payment-success.component';

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
  providers: [PaymentFormService],
  templateUrl: './payment-modal.component.html',
  styleUrl: './payment-modal.component.scss',
})
export class PaymentModalComponent implements OnInit {
  private readonly languageStore = inject(LanguageStore);
  private readonly paymentStore = inject(PaymentStore);
  private readonly dialogRef = inject(MatDialogRef<PaymentModalComponent>);
  private readonly formService = inject(PaymentFormService);

  protected readonly status = this.paymentStore.status;
  protected readonly transactionId = this.paymentStore.transactionId;
  protected readonly PaymentStatus = PaymentStatus;

  protected readonly recipient = this.formService.recipient;
  protected readonly fields = this.formService.fields;
  protected readonly hasFields = this.fields.length > 0;
  protected readonly dynamicForm = this.formService.dynamicForm;
  protected readonly rawValue = this.formService.rawValue;
  protected readonly valid = this.formService.valid;
  protected readonly amount = this.formService.amount;

  protected readonly name = computed(() => this.languageStore.localize(this.recipient.name));
  protected readonly fullName = computed(() =>
    this.languageStore.localize(this.recipient.fullName),
  );
  protected readonly total = computed(() => this.paymentStore.payload()?.total ?? 0);

  ngOnInit(): void {
    this.paymentStore.reset();
  }

  protected pay(): void {
    this.paymentStore.pay(this.formService.buildPayload());
  }

  protected retry(): void {
    this.paymentStore.retry();
  }

  protected close(): void {
    this.dialogRef.close();
  }
}
