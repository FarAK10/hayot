import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaskToken, formatWithMask, parseMask } from '../../../core/utils/mask.util';
import { RecipientId, fieldOf } from '../../../testing/catalog.fixture';
import { TextInputComponent } from './text-input.component';

@Component({
  imports: [ReactiveFormsModule, TextInputComponent],
  template: `
    <app-text-input
      [formControl]="control"
      [label]="label"
      [mask]="tokens()"
      [digitsOnly]="digitsOnly()"
      [error]="error()"
    />
  `,
})
class HostComponent {
  readonly label = 'Phone';
  readonly control = new FormControl('', { nonNullable: true, validators: [Validators.required] });
  readonly tokens = signal<MaskToken[] | null>(null);
  readonly digitsOnly = signal(false);
  readonly error = signal<string | null>(null);
}

describe('TextInputComponent', () => {
  const PHONE_DIGITS = '901234567';
  const MIXED_TEXT = 'a1b2c3';
  const MIXED_DIGITS = '123';
  const ERROR_TEXT = 'Required field';
  const phoneTokens = parseMask(fieldOf(RecipientId.Beeline, 'phone_number').mask) as MaskToken[];

  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  const inputElement = (): HTMLInputElement => fixture.nativeElement.querySelector('input');
  const errorText = (): string | undefined =>
    fixture.nativeElement.querySelector('mat-error')?.textContent?.trim();
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

  it('passes typed text through when no mask applies', () => {
    type(MIXED_TEXT);

    expect(host.control.value).toBe(MIXED_TEXT);
    expect(inputElement().value).toBe(MIXED_TEXT);
  });

  it('keeps raw digits in the control and shows the masked text', () => {
    host.tokens.set(phoneTokens);
    fixture.detectChanges();

    type(PHONE_DIGITS);

    expect(host.control.value).toBe(PHONE_DIGITS);
    expect(inputElement().value).toBe(formatWithMask(PHONE_DIGITS, phoneTokens));
  });

  it('formats a value written by the form into the mask', () => {
    host.tokens.set(phoneTokens);
    host.control.setValue(PHONE_DIGITS);
    fixture.detectChanges();

    expect(inputElement().value).toBe(formatWithMask(PHONE_DIGITS, phoneTokens));
  });

  it('drops non-digits when digitsOnly is set', () => {
    host.digitsOnly.set(true);
    fixture.detectChanges();

    type(MIXED_TEXT);

    expect(host.control.value).toBe(MIXED_DIGITS);
    expect(inputElement().value).toBe(MIXED_DIGITS);
  });

  it('disables the input when the control is disabled', () => {
    host.control.disable();
    fixture.detectChanges();

    expect(inputElement().disabled).toBe(true);
  });

  it('shows the error only after the control is touched', () => {
    host.error.set(ERROR_TEXT);
    fixture.detectChanges();

    expect(errorText()).toBeUndefined();

    host.control.markAllAsTouched();
    fixture.detectChanges();

    expect(errorText()).toBe(ERROR_TEXT);
  });

  it('marks the control touched on blur', () => {
    inputElement().dispatchEvent(new Event('blur'));

    expect(host.control.touched).toBe(true);
  });
});
