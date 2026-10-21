import { NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  FormValue,
  filterOptions,
  isVisible,
} from '../../../../../core/form-engine/field-visibility.util';
import { DynamicForm } from '../../../../../core/form-engine/utils/dynamic-control.util';
import { Field, Recipient } from '../../../../../core/models/catalog.models';
import { SyncPipe } from '../../../../../shared/pipes/sync.pipe';
import { componentFor } from '../../../fields/field-registry';

@Component({
  selector: 'app-dynamic-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgComponentOutlet, SyncPipe],
  templateUrl: './dynamic-form.component.html',
  styleUrl: './dynamic-form.component.scss',
})
export class DynamicFormComponent {
  readonly dynamicForm = input.required<DynamicForm>();
  readonly fields = input.required<readonly Field[]>();
  readonly recipient = input.required<Recipient>();

  readonly rawValue = input.required<FormValue>();

  protected readonly componentFor = componentFor;
  protected readonly visibleFields = computed(() =>
    this.fields().filter((field) => isVisible(field, this.rawValue())),
  );
  protected readonly optionsByKey = computed(() =>
    Object.fromEntries(
      this.fields().map((field) => [field.key, filterOptions(field, this.rawValue())]),
    ),
  );
}
