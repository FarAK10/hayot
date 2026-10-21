import { Component, computed } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { DigitsOnlyDirective } from '../../../../shared/directives/digits-only.directive';
import { MaskDirective } from '../../../../shared/directives/mask.directive';
import { FieldType } from '../../../../core/models/catalog.models';
import { maskTemplate, parseMask } from '../../../../core/utils/mask.util';
import { DIGITS_ONLY_VALIDATION } from '../../../../core/utils/regex.util';
import { BaseField } from '../base-field';

@Component({
  selector: 'app-text-field',
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatError,
    MatInput,
    MaskDirective,
    DigitsOnlyDirective,
  ],
  templateUrl: './text-field.component.html',
  styleUrl: './text-field.component.scss',
})
export class TextFieldComponent extends BaseField {
  protected readonly tokens = computed(() => parseMask(this.field().mask));
  protected readonly digitsOnly = computed(() =>
    DIGITS_ONLY_VALIDATION.test(this.field().validation ?? ''),
  );
  protected readonly inputMode = computed(() =>
    this.field().type === FieldType.PhoneNumber || this.tokens() || this.digitsOnly()
      ? 'tel'
      : 'text',
  );
  protected readonly placeholder = computed(() => {
    const f = this.field();
    const t = this.tokens();
    if (f.placeholder && this.lang.lang() === 'ru') {
      return f.placeholder;
    }
    return t ? maskTemplate(t) : this.lang.localize(f.description);
  });
}
