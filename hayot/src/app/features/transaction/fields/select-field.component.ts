import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import { BaseField } from './base-field';

@Component({
  selector: 'app-select-field',
  imports: [ReactiveFormsModule, MatFormField, MatLabel, MatError, MatSelect, MatOption],
  template: `
    <mat-form-field appearance="outline" subscriptSizing="dynamic">
      <mat-label>{{ label() }}</mat-label>
      <mat-select [formControl]="control()" [placeholder]="lang.t('choose')">
        @for (o of options()(); track o.value) {
          <mat-option [value]="o.value">{{ lang.localize(o.name) }}</mat-option>
        }
      </mat-select>
      @if (errorText(); as e) {
        <mat-error>{{ e }}</mat-error>
      }
    </mat-form-field>
  `,
  styles: `
    mat-form-field {
      width: 100%;
    }
  `,
})
export class SelectFieldComponent extends BaseField {}
