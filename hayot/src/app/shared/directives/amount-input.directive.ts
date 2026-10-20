import { Directive, ElementRef, HostListener, inject } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { formatSum } from '../../core/utils/amount.util';

/** Shows a sum with thousands separators ("150 000"); the control value is a number (or null). */
@Directive({
  selector: 'input[appAmountInput]',
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: AmountInputDirective, multi: true }],
})
export class AmountInputDirective implements ControlValueAccessor {
  private readonly el = inject<ElementRef<HTMLInputElement>>(ElementRef).nativeElement;
  private onChange: (v: number | null) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: number | null): void {
    this.el.value = value === null || value === undefined ? '' : formatSum(value);
  }
  registerOnChange(fn: (v: number | null) => void): void {
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
    const digits = this.el.value.replace(/\D/g, '').slice(0, 12);
    const value = digits ? Number(digits) : null;
    this.el.value = value === null ? '' : formatSum(value);
    this.onChange(value);
  }

  @HostListener('blur')
  protected onBlur(): void {
    this.onTouched();
  }
}
