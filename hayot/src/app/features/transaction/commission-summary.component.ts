import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Recipient } from '../../core/models/catalog.models';
import { LanguageStore } from '../../core/stores/language.store';
import { calcCommission, formatSum, fromTiyin, toTiyin } from '../../core/utils/amount.util';

@Component({
  selector: 'app-commission-summary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dl>
      <div>
        <dt>{{ lang.t('amount') }}</dt>
        <dd>{{ sum(calc().amount) }}</dd>
      </div>
      <div>
        <dt>{{ lang.t('commission') }} {{ recipient().commission }}%</dt>
        <dd>{{ sum(calc().commissionAmount) }}</dd>
      </div>
      <div class="total">
        <dt>{{ lang.t('total') }}</dt>
        <dd>{{ sum(calc().total) }}</dd>
      </div>
    </dl>
  `,
  styles: `
    dl {
      margin: 0;
      padding: 12px 16px;
      background: var(--bg);
      border-radius: var(--radius-input);
    }
    div {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
    }
    dt {
      color: var(--muted);
    }
    dd {
      margin: 0;
      font-weight: 500;
    }
    .total {
      border-top: 1px solid var(--border);
      margin-top: 4px;
      padding-top: 8px;
    }
    .total dt,
    .total dd {
      color: var(--text);
      font-weight: 600;
    }
  `,
})
export class CommissionSummaryComponent {
  /** Amount typed by the user, in sum. */
  readonly amountSum = input<number | null>(null);
  readonly recipient = input.required<Recipient>();

  protected readonly lang = inject(LanguageStore);
  protected readonly calc = computed(() => calcCommission(toTiyin(this.amountSum() ?? 0), this.recipient().commission));
  protected readonly sum = (tiyin: number): string => `${formatSum(fromTiyin(tiyin))} ${this.lang.t('sum')}`;
}
