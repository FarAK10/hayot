import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Recipient } from '../../../../../core/models/catalog.models';
import { calcCommission, formatTiyin, toTiyin } from '../../../../../core/utils/amount.util';
import { SyncPipe } from '../../../../../shared/pipes/sync.pipe';
import { TranslatePipe } from '../../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-commission-summary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, SyncPipe],
  templateUrl: './commission-summary.component.html',
  styleUrl: './commission-summary.component.scss',
})
export class CommissionSummaryComponent {
  readonly amountSum = input<number | null>(null);
  readonly recipient = input.required<Recipient>();

  protected readonly calc = computed(() =>
    calcCommission(toTiyin(this.amountSum() ?? 0), this.recipient().commission),
  );
  protected readonly formatTiyin = formatTiyin;
}
