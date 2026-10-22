import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MaskToken, formatWithMask, parseMask } from '../../core/utils/mask.util';
import { RecipientId, fieldOf } from '../../testing/catalog.fixture';
import { MaskDirective } from './mask.directive';

@Component({
  imports: [ReactiveFormsModule, MaskDirective],
  template: `<input [formControl]="control" [appMask]="tokens" />`,
})
class HostComponent {
  readonly control = new FormControl('', { nonNullable: true });
  readonly tokens = parseMask(fieldOf(RecipientId.Beeline, 'phone_number').mask) as MaskToken[];
}

describe('MaskDirective', () => {
  const PHONE_DIGITS = '901234567';

  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  const inputElement = (): HTMLInputElement => fixture.nativeElement.querySelector('input');

  beforeEach(async () => {
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('formats typed digits and emits the raw digits', () => {
    const input = inputElement();
    input.value = PHONE_DIGITS;
    input.dispatchEvent(new Event('input'));

    expect(input.value).toBe(formatWithMask(PHONE_DIGITS, host.tokens));
    expect(host.control.value).toBe(PHONE_DIGITS);
  });

  it('formats a value written by the form', () => {
    host.control.setValue(PHONE_DIGITS);

    expect(inputElement().value).toBe(formatWithMask(PHONE_DIGITS, host.tokens));
  });

  it('clears the input when the form resets', () => {
    host.control.setValue(PHONE_DIGITS);
    host.control.reset('');

    expect(inputElement().value).toBe('');
  });
});
