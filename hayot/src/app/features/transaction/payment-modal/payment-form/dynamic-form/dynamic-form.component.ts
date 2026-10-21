import { NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Recipient } from '../../../../../core/models/catalog.models';
import { SyncPipe } from '../../../../../shared/pipes/sync.pipe';
import { componentFor } from '../../../fields/field-registry';
import { DynamicForm } from '../../../../../core/form-engine/form-builder.service';

@Component({
  selector: 'app-dynamic-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgComponentOutlet, SyncPipe],
  templateUrl: './dynamic-form.component.html',
  styleUrl: './dynamic-form.component.scss',
})
export class DynamicFormComponent {
  readonly dynamicForm = input.required<DynamicForm>();
  readonly recipient = input.required<Recipient>();
  protected readonly componentFor = componentFor;
}
