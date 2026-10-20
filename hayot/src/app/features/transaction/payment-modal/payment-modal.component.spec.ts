import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import data from '../../../../../public/data/response.json';
import { CatalogResponse } from '../../../core/models/catalog.models';
import { LocalTransactionApi } from '../../../core/services/local-transaction.api';
import { TransactionApi } from '../../../core/services/transaction.api';
import { CATALOG_URL, CatalogStore } from '../../../core/stores/catalog.store';
import { PaymentStore } from '../../../core/stores/payment.store';
import { PaymentModalComponent } from './payment-modal.component';

async function open(recipientId: number): Promise<ComponentFixture<PaymentModalComponent>> {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: TransactionApi, useClass: LocalTransactionApi },
      { provide: MAT_DIALOG_DATA, useValue: { recipientId } },
      { provide: MatDialogRef, useValue: { close: () => {} } },
    ],
  });
  const p = TestBed.inject(CatalogStore).load();
  TestBed.inject(HttpTestingController).expectOne(CATALOG_URL).flush(data as unknown as CatalogResponse);
  await p;
  const fixture = TestBed.createComponent(PaymentModalComponent);
  await fixture.whenStable();
  return fixture;
}

const type = (el: HTMLInputElement, text: string) => {
  el.value = text;
  el.dispatchEvent(new Event('input'));
};

describe('PaymentModalComponent', () => {
  beforeEach(() => localStorage.clear());

  it('pays Beeline end-to-end with a masked phone and an amount', async () => {
    const fixture = await open(23303);
    const el = fixture.nativeElement as HTMLElement;
    const inputs = el.querySelectorAll<HTMLInputElement>('input');
    expect(inputs).toHaveLength(2);

    type(inputs[0], '901234567');
    expect(inputs[0].value).toBe('998(90) 123-45-67');
    type(inputs[1], '50000');
    expect(inputs[1].value).toBe('50 000');
    await fixture.whenStable();
    fixture.detectChanges();

    const pay = el.querySelector<HTMLButtonElement>('button.pay')!;
    expect(pay.disabled).toBe(false);
    pay.click();
    await fixture.whenStable();

    const store = TestBed.inject(PaymentStore);
    expect(store.status()).toBe('success');
    expect(store.payload()).toMatchObject({
      recipientId: 23303,
      amount: 5000000,
      commissionAmount: 75000,
      total: 5075000,
      keyValue: [
        { key: 'phone_number', value: '901234567' },
        { key: 'summa', value: '5000000' },
      ],
    });
  });

  it('keeps Pay disabled while the form is invalid', async () => {
    const fixture = await open(23303);
    const el = fixture.nativeElement as HTMLElement;
    type(el.querySelectorAll<HTMLInputElement>('input')[0], '921234567');
    fixture.detectChanges();
    expect(el.querySelector<HTMLButtonElement>('button.pay')!.disabled).toBe(true);
  });

  it('shows dependent Electricity fields only after a region is chosen', async () => {
    const fixture = await open(4012);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('app-select-field')).toHaveLength(1);
  });
});
