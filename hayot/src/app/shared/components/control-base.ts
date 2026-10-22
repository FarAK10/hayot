import {
  AfterViewInit,
  ChangeDetectorRef,
  DestroyRef,
  Directive,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, ControlValueAccessor, NgControl } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { noop } from '../../core/utils/noop.util';

@Directive()
export abstract class ControlBase<T> implements ControlValueAccessor, OnInit, AfterViewInit {
  protected readonly value = signal<T | null>(null);
  protected readonly disabled = signal(false);
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
    this.value.set(value);
  }

  registerOnChange(onChange: (value: T | null) => void): void {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: () => void): void {
    this.onTouched = onTouched;
  }

  setDisabledState(disabled: boolean): void {
    this.disabled.set(disabled);
  }

  protected emit(value: T | null): void {
    this.value.set(value);
    this.onChange(value);
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
