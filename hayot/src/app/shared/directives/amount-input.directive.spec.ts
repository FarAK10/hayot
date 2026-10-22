import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MAX_AMOUNT_DIGITS } from '../../core/config/app.config.constants';
import { formatSum } from '../../core/utils/amount.util';
import { AmountInputDirective } from './amount-input.directive';

@Component({
  imports: [ReactiveFormsModule, AmountInputDirective],
  template: `<input [formControl]="control" appAmountInput />`,
})
class HostComponent {
  readonly control = new FormControl<number | null>(null);
}

describe('AmountInputDirective', () => {
  const AMOUNT_SUM = 50_000;

  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  const inputElement = (): HTMLInputElement => fixture.nativeElement.querySelector('input');
  const type = (text: string): void => {
    const input = inputElement();
    input.value = text;
    input.dispatchEvent(new Event('input'));
  };

  beforeEach(async () => {
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('groups digits and emits a number', () => {
    type(String(AMOUNT_SUM));

    expect(inputElement().value).toBe(formatSum(AMOUNT_SUM));
    expect(host.control.value).toBe(AMOUNT_SUM);
  });

  it('emits null when the text has no digits', () => {
    type('abc');

    expect(inputElement().value).toBe('');
    expect(host.control.value).toBeNull();
  });

  it('caps the amount at the maximum number of digits', () => {
    const maxDigits = '9'.repeat(MAX_AMOUNT_DIGITS);

    type(maxDigits + '9');

    expect(host.control.value).toBe(Number(maxDigits));
  });

  it('shows a value written by the form and clears on null', () => {
    host.control.setValue(AMOUNT_SUM);
    expect(inputElement().value).toBe(formatSum(AMOUNT_SUM));

    host.control.setValue(null);
    expect(inputElement().value).toBe('');
  });
});
