import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  AMOUNT_DIVISOR,
  CATALOG_URL,
  PERCENT_BASE,
} from '../../../core/config/app.config.constants';
import { PaymentStatus } from '../../../core/models/transaction.models';
import { TransactionApi } from '../../../core/services/transaction.api';
import { LanguageStore } from '../../../core/stores/language/language.store';
import { CatalogStore } from '../../../core/stores/catalog/catalog.store';
import { PaymentStore } from '../../../core/stores/payment/payment.store';
import { formatSum } from '../../../core/utils/amount.util';
import { InMemoryTransactionApi } from '../../../testing/in-memory-transaction.api';
import { RAW_CATALOG, RecipientId, fieldsOf, recipientOf } from '../../../testing/catalog.fixture';
import { noop } from '../../../core/utils/noop.util';
import { PaymentModalComponent } from './payment-modal.component';

async function open(recipientId: RecipientId): Promise<ComponentFixture<PaymentModalComponent>> {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: TransactionApi, useClass: InMemoryTransactionApi },
      { provide: MAT_DIALOG_DATA, useValue: { recipientId } },
      { provide: MatDialogRef, useValue: { close: noop } },
    ],
  });
  TestBed.inject(CatalogStore).load();
  TestBed.inject(HttpTestingController).expectOne(CATALOG_URL).flush(RAW_CATALOG);
  const fixture = TestBed.createComponent(PaymentModalComponent);
  await fixture.whenStable();
  return fixture;
}

const type = (input: HTMLInputElement, text: string) => {
  input.value = text;
  input.dispatchEvent(new Event('input'));
};

describe('PaymentModalComponent', () => {
  const PHONE_DIGITS = '901234567';
  const MASKED_PHONE = '998(90) 123-45-67';
  const INVALID_PHONE_DIGITS = '921234567';
  const PAY_AMOUNT_SUM = 50_000;

  it('pays Beeline end-to-end with a masked phone and an amount', async () => {
    const beeline = recipientOf(RecipientId.Beeline);
    const amountTiyin = PAY_AMOUNT_SUM * AMOUNT_DIVISOR;
    const commissionTiyin = (amountTiyin * beeline.commission) / PERCENT_BASE;
    const expectedPayload = {
      recipientId: beeline.id,
      amount: amountTiyin,
      commissionAmount: commissionTiyin,
      total: amountTiyin + commissionTiyin,
      keyValue: [
        { key: 'phone_number', value: PHONE_DIGITS },
        { key: 'summa', value: String(amountTiyin) },
      ],
    };
    const fixture = await open(RecipientId.Beeline);
    const element = fixture.nativeElement as HTMLElement;
    const inputs = element.querySelectorAll<HTMLInputElement>('input');
    const [phoneInput, amountInput] = Array.from(inputs);
    expect(inputs).toHaveLength(fieldsOf(RecipientId.Beeline).length);

    type(phoneInput, PHONE_DIGITS);
    expect(phoneInput.value).toBe(MASKED_PHONE);
    type(amountInput, String(PAY_AMOUNT_SUM));
    expect(amountInput.value).toBe(formatSum(PAY_AMOUNT_SUM));
    await fixture.whenStable();
    fixture.detectChanges();

    const payButton = element.querySelector<HTMLButtonElement>('button.pay')!;
    expect(payButton.disabled).toBe(false);
    payButton.click();
    await fixture.whenStable();

    const paymentStore = TestBed.inject(PaymentStore);
    expect(paymentStore.status()).toBe(PaymentStatus.Success);
    expect(paymentStore.payload()).toMatchObject(expectedPayload);
  });

  it('keeps Pay disabled while the form is invalid', async () => {
    const fixture = await open(RecipientId.Beeline);
    const element = fixture.nativeElement as HTMLElement;

    type(element.querySelector<HTMLInputElement>('input')!, INVALID_PHONE_DIGITS);
    fixture.detectChanges();

    expect(element.querySelector<HTMLButtonElement>('button.pay')!.disabled).toBe(true);
  });

  it('shows the min-amount message once an amount below the minimum is touched', async () => {
    const BELOW_MIN_SUM = 1;
    const beeline = recipientOf(RecipientId.Beeline);
    const fixture = await open(RecipientId.Beeline);
    const expected = TestBed.inject(LanguageStore).t('min', {
      min: formatSum(beeline.minAmount / AMOUNT_DIVISOR),
    });
    const element = fixture.nativeElement as HTMLElement;
    const [, amountInput] = Array.from(element.querySelectorAll<HTMLInputElement>('input'));

    type(amountInput, String(BELOW_MIN_SUM));
    amountInput.dispatchEvent(new Event('blur'));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(element.querySelector('mat-error')?.textContent?.trim()).toBe(expected);
  });

  it('shows dependent Electricity fields only after a region is chosen', async () => {
    const initialSelectFields = 1;
    const fixture = await open(RecipientId.Electricity);
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelectorAll('app-select-field')).toHaveLength(initialSelectFields);
  });
});
