import { NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Recipient } from '../../../core/models/catalog.models';
import { componentFor } from './field-registry';
import { DynamicForm } from './form-builder.service';

@Component({
  selector: 'app-dynamic-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgComponentOutlet],
  template: `
    @for (f of dyn().visibleFields(); track f.key) {
      <div class="row">
        <ng-container
          *ngComponentOutlet="
            componentFor(f.type);
            inputs: {
              field: f,
              control: dyn().form.controls[f.key],
              recipient: recipient(),
              options: dyn().optionsFor(f.key),
            }
          "
        />
      </div>
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .row {
      animation: appear 150ms ease-out;
    }
    @keyframes appear {
      from {
        opacity: 0;
        transform: translateY(-6px);
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .row {
        animation: none;
      }
    }
  `,
})
export class DynamicFormComponent {
  readonly dyn = input.required<DynamicForm>();
  readonly recipient = input.required<Recipient>();
  protected readonly componentFor = componentFor;
}
