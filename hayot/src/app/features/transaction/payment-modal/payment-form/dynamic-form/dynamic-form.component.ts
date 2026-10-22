import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  FormValue,
  optionsByKeyOf,
  visibleFieldsOf,
} from '../../../../../core/form-engine/field-visibility.util';
import { DynamicForm } from '../../../../../core/form-engine/utils/dynamic-control.util';
import { Field, Recipient } from '../../../../../core/models/catalog.models';
import { LanguageStore } from '../../../../../core/stores/language/language.store';
import { AmountInputComponent } from '../../../../../shared/components/amount-input/amount-input.component';
import { SelectInputComponent } from '../../../../../shared/components/select-input/select-input.component';
import { TextInputComponent } from '../../../../../shared/components/text-input/text-input.component';
import { ControlType, RenderedField } from './dynamic-form.models';
import { RenderContext, renderField, tokensByKeyOf } from './dynamic-form.util';

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
  private readonly tokensByKey = computed(() => tokensByKeyOf(this.fields()));

  protected readonly renderedFields = computed<RenderedField[]>(() => {
    const context: RenderContext = {
      controls: this.dynamicForm().controls,
      recipient: this.recipient(),
      optionsByKey: this.optionsByKey(),
      tokensByKey: this.tokensByKey(),
      lang: this.languageStore.lang(),
      localize: this.languageStore.localize,
      t: this.languageStore.t,
    };
    return this.visibleFields().map((field) => renderField(field, context));
  });
}
