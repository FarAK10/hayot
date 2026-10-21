import { Directive, ElementRef, HostListener, inject } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { onlyDigits } from '../../core/utils/regex.util';
import { noop } from '../../core/utils/noop.util';

@Directive({
  selector: 'input[appDigitsOnly]',
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: DigitsOnlyDirective, multi: true }],
})
export class DigitsOnlyDirective implements ControlValueAccessor {
  private readonly el = inject<ElementRef<HTMLInputElement>>(ElementRef).nativeElement;
  private onChange: (v: string) => void = noop;
  private onTouched: () => void = noop;

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
    const digits = onlyDigits(this.el.value);
    this.el.value = digits;
    this.onChange(digits);
  }

  @HostListener('blur')
  protected onBlur(): void {
    this.onTouched();
  }
}
