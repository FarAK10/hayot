import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-payment-error',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, MatButton],
  templateUrl: './payment-error.component.html',
  styleUrl: './payment-error.component.scss',
})
export class PaymentErrorComponent {
  readonly retry = output<void>();
  readonly dismiss = output<void>();

  protected onRetry(): void {
    this.retry.emit();
  }

  protected onDismiss(): void {
    this.dismiss.emit();
  }
}
