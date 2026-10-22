import {
  AfterViewInit,
  ChangeDetectorRef,
  DestroyRef,
  Directive,
  OnInit,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, ControlValueAccessor, FormControl, NgControl } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { noop } from '../../core/utils/noop.util';

@Directive()
export abstract class ControlBase<T> implements ControlValueAccessor, OnInit, AfterViewInit {
  protected readonly field = new FormControl<T | null>(null);
  protected readonly errorStateMatcher: ErrorStateMatcher = {
    isErrorState: () => this.invalid,
  };

  private readonly ngControl = inject(NgControl, { self: true, optional: true });
  private readonly errorStateService = inject(ErrorStateMatcher);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private onChange: (value: T | null) => void = noop;
  private onTouched: () => void = noop;
  private invalid = false;

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
    this.field.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => this.onChange(value));
  }

  ngOnInit(): void {
    const control = this.ngControl?.control;
    if (!control) {
      return;
    }
    this.syncErrorState(control);
    control.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.syncErrorState(control));
  }

  ngAfterViewInit(): void {
    this.updateFieldErrorState();
  }

  writeValue(value: T | null): void {
    this.field.setValue(value, { emitEvent: false });
  }

  registerOnChange(onChange: (value: T | null) => void): void {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: () => void): void {
    this.onTouched = onTouched;
  }

  setDisabledState(disabled: boolean): void {
    if (disabled) {
      this.field.disable({ emitEvent: false });
    } else {
      this.field.enable({ emitEvent: false });
    }
  }

  protected markTouched(): void {
    this.onTouched();
  }

  protected abstract updateFieldErrorState(): void;

  private syncErrorState(control: AbstractControl): void {
    this.invalid = this.errorStateService.isErrorState(control, null);
    this.updateFieldErrorState();
    this.changeDetectorRef.markForCheck();
  }
}
