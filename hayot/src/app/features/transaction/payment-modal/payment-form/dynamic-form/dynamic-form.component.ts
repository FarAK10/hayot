import { NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  FormValue,
  optionsByKeyOf,
  visibleFieldsOf,
} from '../../../../../core/form-engine/field-visibility.util';
import { DynamicForm } from '../../../../../core/form-engine/utils/dynamic-control.util';
import { Field, Recipient } from '../../../../../core/models/catalog.models';
import { componentFor } from '../../../fields/field-registry';
import { RenderedField } from './dynamic-form.models';

@Component({
  selector: 'app-dynamic-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgComponentOutlet],
  templateUrl: './dynamic-form.component.html',
  styleUrl: './dynamic-form.component.scss',
})
export class DynamicFormComponent {
  readonly dynamicForm = input.required<DynamicForm>();
  readonly fields = input.required<readonly Field[]>();
  readonly recipient = input.required<Recipient>();

  readonly rawValue = input.required<FormValue>();

  private readonly visibleFields = computed(() => visibleFieldsOf(this.fields(), this.rawValue()));
  private readonly optionsByKey = computed(() => optionsByKeyOf(this.fields(), this.rawValue()));

  protected readonly renderedFields = computed<RenderedField[]>(() => {
    const { controls } = this.dynamicForm();
    const recipient = this.recipient();
    const optionsByKey = this.optionsByKey();
    return this.visibleFields().map((field) => ({
      key: field.key,
      component: componentFor(field.type),
      inputs: {
        field,
        control: controls[field.key],
        recipient,
        options: optionsByKey[field.key],
      },
    }));
  });
}
