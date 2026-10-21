import { Directive, ElementRef, HostListener, inject } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MAX_AMOUNT_DIGITS } from '../../core/config/app.config.constants';
import { formatSum } from '../../core/utils/amount.util';
import { onlyDigits } from '../../core/utils/regex.util';
import { noop } from '../../core/utils/noop.util';

@Directive({
  selector: 'input[appAmountInput]',
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: AmountInputDirective, multi: true }],
})
export class AmountInputDirective implements ControlValueAccessor {
  private readonly el = inject<ElementRef<HTMLInputElement>>(ElementRef).nativeElement;
  private onChange: (v: number | null) => void = noop;
  private onTouched: () => void = noop;

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
    const digits = onlyDigits(this.el.value).slice(0, MAX_AMOUNT_DIGITS);
    const value = digits ? Number(digits) : null;
    this.el.value = value === null ? '' : formatSum(value);
    this.onChange(value);
  }

  @HostListener('blur')
  protected onBlur(): void {
    this.onTouched();
  }
}
