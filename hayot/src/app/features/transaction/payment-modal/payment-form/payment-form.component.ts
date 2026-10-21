import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { DynamicForm } from '../../../../core/form-engine/utils/dynamic-control.util';
import { FormValue } from '../../../../core/form-engine/field-visibility.util';
import { Field, Recipient } from '../../../../core/models/catalog.models';
import { SPINNER_DIAMETER } from '../../../../core/config/app.config.constants';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { CommissionSummaryComponent } from './commission-summary/commission-summary.component';
import { DynamicFormComponent } from './dynamic-form/dynamic-form.component';

@Component({
  selector: 'app-payment-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslatePipe,
    DynamicFormComponent,
    CommissionSummaryComponent,
    MatButton,
    MatProgressSpinner,
  ],
  templateUrl: './payment-form.component.html',
  styleUrl: './payment-form.component.scss',
})
export class PaymentFormComponent {
  readonly dynamicForm = input.required<DynamicForm>();
  readonly fields = input.required<readonly Field[]>();
  readonly rawValue = input.required<FormValue>();
  readonly valid = input.required<boolean>();
  readonly recipient = input.required<Recipient>();
  readonly amount = input(0);
  readonly pending = input(false);
  readonly submitted = output<void>();

  protected readonly spinnerDiameter = SPINNER_DIAMETER;

  protected submit(): void {
    const dynamicForm = this.dynamicForm();
    if (dynamicForm.invalid) {
      dynamicForm.markAllAsTouched();
      return;
    }
    this.submitted.emit();
  }
}
