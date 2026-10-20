import { Directive, ElementRef, HostListener, inject } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/** Strips non-digit characters as the user types; the control value is a digit string. */
@Directive({
  selector: 'input[appDigitsOnly]',
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: DigitsOnlyDirective, multi: true }],
})
export class DigitsOnlyDirective implements ControlValueAccessor {
  private readonly el = inject<ElementRef<HTMLInputElement>>(ElementRef).nativeElement;
  private onChange: (v: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string | null): void {
    this.el.value = value ?? '';
  }
  registerOnChange(fn: (v: string) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(disabled: boolean): void {
    this.el.disabled = disabled;
  }

  @HostListener('input')
  protected onInput(): void {
    const digits = this.el.value.replace(/\D/g, '');
    this.el.value = digits;
    this.onChange(digits);
  }

  @HostListener('blur')
  protected onBlur(): void {
    this.onTouched();
  }
}
