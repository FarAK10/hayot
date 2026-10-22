import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  FormValue,
  optionsByKeyOf,
  visibleFieldsOf,
} from '../../../../../core/form-engine/field-visibility.util';
import {
  DynamicControl,
  DynamicForm,
} from '../../../../../core/form-engine/utils/dynamic-control.util';
import {
  Field,
  FieldOption,
  Recipient,
  isAmountField,
  isSelectField,
} from '../../../../../core/models/catalog.models';
import { LanguageStore } from '../../../../../core/stores/language/language.store';
import { fieldErrorText } from '../../../../../core/utils/field-error.util';
import {
  amountHintOf,
  inputModeOf,
  isDigitsOnly,
  placeholderOf,
} from '../../../../../core/utils/field-view.util';
import { MaskToken, parseMask } from '../../../../../core/utils/mask.util';
import { AmountInputComponent } from '../../../../../shared/components/amount-input/amount-input.component';
import { SelectInputComponent } from '../../../../../shared/components/select-input/select-input.component';
import { TextInputComponent } from '../../../../../shared/components/text-input/text-input.component';
import { SelectOption } from '../../../../../shared/models/select-option.model';
import { RenderedField, ControlType } from './dynamic-form.models';

interface RenderContext {
  controls: Record<string, DynamicControl>;
  recipient: Recipient;
  optionsByKey: Record<string, FieldOption[]>;
  tokensByKey: Map<string, MaskToken[] | null>;
}

@Component({
  selector: 'app-dynamic-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, TextInputComponent, AmountInputComponent, SelectInputComponent],
  templateUrl: './dynamic-form.component.html',
  styleUrl: './dynamic-form.component.scss',
})
export class DynamicFormComponent {
  readonly dynamicForm = input.required<DynamicForm>();
  readonly fields = input.required<readonly Field[]>();
  readonly recipient = input.required<Recipient>();

  readonly rawValue = input.required<FormValue>();

  protected readonly ControlType = ControlType;

  private readonly languageStore = inject(LanguageStore);

  private readonly visibleFields = computed(() => visibleFieldsOf(this.fields(), this.rawValue()));
  private readonly optionsByKey = computed(() => optionsByKeyOf(this.fields(), this.rawValue()));
  private readonly tokensByKey = computed(() => {
    const tokensByKey = new Map<string, MaskToken[] | null>();
    for (const field of this.fields()) {
      tokensByKey.set(field.key, parseMask(field.mask));
    }
    return tokensByKey;
  });

  protected readonly renderedFields = computed<RenderedField[]>(() => {
    const context: RenderContext = {
      controls: this.dynamicForm().controls,
      recipient: this.recipient(),
      optionsByKey: this.optionsByKey(),
      tokensByKey: this.tokensByKey(),
    };
    return this.visibleFields().map((field) => this.renderField(field, context));
  });

  private renderField(field: Field, context: RenderContext): RenderedField {
    const control = context.controls[field.key];
    const base = {
      key: field.key,
      control,
      label: this.languageStore.localize(field.name),
      error: fieldErrorText(control.errors, context.recipient, this.languageStore.t),
    };

    if (isAmountField(field)) {
      return {
        ...base,
        controlType: ControlType.Amount,
        hint: amountHintOf(context.recipient, this.languageStore.t),
        suffix: this.languageStore.t('sum'),
      };
    }

    if (isSelectField(field)) {
      return {
        ...base,
        controlType: ControlType.Select,
        placeholder: this.languageStore.t('choose'),
        options: this.selectOptionsOf(context.optionsByKey[field.key]),
      };
    }

    const tokens = context.tokensByKey.get(field.key) ?? null;
    return {
      ...base,
      controlType: ControlType.Text,
      placeholder: placeholderOf(
        field,
        tokens,
        this.languageStore.lang(),
        this.languageStore.localize,
      ),
      tokens,
      digitsOnly: isDigitsOnly(field),
      inputMode: inputModeOf(field, tokens),
    };
  }

  private selectOptionsOf(options: FieldOption[] | undefined): SelectOption[] {
    return (options ?? []).map((option) => ({
      value: option.value,
      label: this.languageStore.localize(option.name),
    }));
  }
}
