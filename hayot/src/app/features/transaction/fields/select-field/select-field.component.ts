import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import { BaseField } from '../base-field';
import { LocalizePipe } from '../../../../shared/pipes/localize.pipe';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-select-field',
  imports: [
    LocalizePipe,
    TranslatePipe,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatError,
    MatSelect,
    MatOption,
  ],
  templateUrl: './select-field.component.html',
  styleUrl: './select-field.component.scss',
})
export class SelectFieldComponent extends BaseField {}
