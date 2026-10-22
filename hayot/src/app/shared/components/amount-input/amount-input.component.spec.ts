import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAX_AMOUNT_DIGITS } from '../../../core/config/app.config.constants';
import { formatSum } from '../../../core/utils/amount.util';
import { AmountInputComponent } from './amount-input.component';

@Component({
  imports: [ReactiveFormsModule, AmountInputComponent],
  template: `
    <app-amount-input
      [formControl]="control"
      [label]="label"
      [hint]="hint"
      [suffix]="suffix"
      [error]="error"
    />
  `,
})
class HostComponent {
  readonly label = 'Amount';
  readonly hint = 'from 1 to 9';
  readonly suffix = 'sum';
  readonly error = 'Too small';
  readonly control = new FormControl<number | null>(null, [Validators.min(2)]);
}

describe('AmountInputComponent', () => {
  const AMOUNT_SUM = 50_000;
  const MIN_SUM = 2;
  const BELOW_MIN_SUM = 1;

  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  const inputElement = (): HTMLInputElement => fixture.nativeElement.querySelector('input');
  const type = (text: string): void => {
    const input = inputElement();
    input.value = text;
    input.dispatchEvent(new Event('input'));
  };

  beforeEach(async () => {
    TestBed.configureTestingModule({});
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('groups digits and stores a number', () => {
    type(String(AMOUNT_SUM));

    expect(inputElement().value).toBe(formatSum(AMOUNT_SUM));
    expect(host.control.value).toBe(AMOUNT_SUM);
  });

  it('ignores non-digits and stores null when empty', () => {
    type('abc');

    expect(inputElement().value).toBe('');
    expect(host.control.value).toBeNull();
  });

  it('caps the amount at the maximum number of digits', () => {
    const maxDigits = '9'.repeat(MAX_AMOUNT_DIGITS);

    type(maxDigits + '9');

    expect(host.control.value).toBe(Number(maxDigits));
  });

  it('formats a value written by the form', () => {
    host.control.setValue(AMOUNT_SUM);
    fixture.changeDetectorRef.detectChanges();

    expect(inputElement().value).toBe(formatSum(AMOUNT_SUM));
  });

  it('renders the suffix and the hint', () => {
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('.suffix')?.textContent).toBe(host.suffix);
    expect(element.querySelector('mat-hint')?.textContent?.trim()).toBe(host.hint);
  });

  it('shows the error once the invalid control is touched', () => {
    host.control.setValue(BELOW_MIN_SUM);
    inputElement().dispatchEvent(new Event('blur'));
    fixture.changeDetectorRef.detectChanges();

    expect(host.control.value).toBeLessThan(MIN_SUM);
    expect(fixture.nativeElement.querySelector('mat-error')?.textContent?.trim()).toBe(host.error);
  });
});
