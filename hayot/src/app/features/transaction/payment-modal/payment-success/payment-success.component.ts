import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { formatTiyin } from '../../../../core/utils/amount.util';
import { SyncPipe } from '../../../../shared/pipes/sync.pipe';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-payment-success',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, SyncPipe, MatButton],
  templateUrl: './payment-success.component.html',
  styleUrl: './payment-success.component.scss',
})
export class PaymentSuccessComponent {
  readonly recipientName = input.required<string>();
  readonly total = input.required<number>();
  readonly transactionId = input<string | null>(null);
  readonly done = output<void>();

  protected onDone(): void {
    this.done.emit();
  }

  protected readonly formatTiyin = formatTiyin;
}
