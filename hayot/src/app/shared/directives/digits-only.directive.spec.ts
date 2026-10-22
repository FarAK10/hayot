import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DigitsOnlyDirective } from './digits-only.directive';

@Component({
  imports: [ReactiveFormsModule, DigitsOnlyDirective],
  template: `<input [formControl]="control" appDigitsOnly />`,
})
class HostComponent {
  readonly control = new FormControl('', { nonNullable: true });
}

describe('DigitsOnlyDirective', () => {
  const MIXED_TEXT = 'a1b2c3';
  const MIXED_DIGITS = '123';

  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  const inputElement = (): HTMLInputElement => fixture.nativeElement.querySelector('input');

  beforeEach(async () => {
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('strips non-digits from typed text', () => {
    const input = inputElement();
    input.value = MIXED_TEXT;
    input.dispatchEvent(new Event('input'));

    expect(input.value).toBe(MIXED_DIGITS);
    expect(host.control.value).toBe(MIXED_DIGITS);
  });

  it('shows a value written by the form', () => {
    host.control.setValue(MIXED_DIGITS);

    expect(inputElement().value).toBe(MIXED_DIGITS);
  });
});
