import { Directive, ElementRef, HostListener, inject, input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MaskToken, extractRaw, formatWithMask } from '../../core/utils/mask.util';

/**
 * Formats the input as the user types (e.g. `998(93) 123-45-67`) while the form
 * control holds only the raw slot digits (`931234567`).
 */
@Directive({
  selector: 'input[appMask]',
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: MaskDirective, multi: true }],
})
export class MaskDirective implements ControlValueAccessor {
  readonly tokens = input.required<MaskToken[]>({ alias: 'appMask' });

  private readonly el = inject<ElementRef<HTMLInputElement>>(ElementRef).nativeElement;
  private onChange: (v: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(raw: string | null): void {
    this.el.value = formatWithMask(raw ?? '', this.tokens());
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
    const raw = extractRaw(this.el.value, this.tokens());
    this.el.value = formatWithMask(raw, this.tokens());
    this.onChange(raw);
  }

  @HostListener('blur')
  protected onBlur(): void {
    this.onTouched();
  }
}
