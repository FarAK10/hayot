import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressBar } from '@angular/material/progress-bar';
import { CatalogStore } from '../../core/stores/catalog.store';
import { HistoryStore } from '../../core/stores/history.store';
import { LanguageStore } from '../../core/stores/language.store';
import { formatSum, fromTiyin } from '../../core/utils/amount.util';
import { LogoComponent } from '../../shared/components/logo.component';

@Component({
  selector: 'app-history-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, MatExpansionModule, MatProgressBar, LogoComponent],
  template: `
    <div class="page">
      <h1>{{ lang.t('historyTitle') }}</h1>
      @if (history.loading()) {
        <mat-progress-bar mode="indeterminate" />
      } @else if (history.failed()) {
        <p class="state" role="alert">{{ lang.t('loadError') }}</p>
      } @else if (history.items().length === 0) {
        <p class="state">{{ lang.t('historyEmpty') }}</p>
      } @else {
        <mat-accordion>
          @for (tx of history.items(); track tx.id) {
            @let r = catalog.recipient(tx.recipientId);
            <mat-expansion-panel>
              <mat-expansion-panel-header>
                <mat-panel-title class="title">
                  @if (r) {
                    <app-logo class="logo" [logo]="r.logo" [name]="lang.localize(r.name)" [seed]="r.id" />
                  }
                  <span>
                    {{ r ? lang.localize(r.name) : '#' + tx.recipientId }}
                    <small>{{ tx.createdAt | date: 'dd.MM.yyyy HH:mm' }}</small>
                  </span>
                </mat-panel-title>
                <mat-panel-description class="total">
                  {{ money(tx.total) }}
                </mat-panel-description>
              </mat-expansion-panel-header>
              <dl>
                @for (kv of tx.keyValue; track kv.key) {
                  <dt>{{ kv.key }}</dt>
                  <dd>{{ kv.value }}</dd>
                }
                <dt>{{ lang.t('commission') }} {{ tx.commissionPercent }}%</dt>
                <dd>{{ money(tx.commissionAmount) }}</dd>
              </dl>
            </mat-expansion-panel>
          }
        </mat-accordion>
      }
    </div>
  `,
  styles: `
    h1 {
      font-size: 28px;
      font-weight: 500;
      margin: 0 0 20px;
    }
    .state {
      text-align: center;
      color: var(--muted);
      padding: 48px 0;
    }
    .title {
      align-items: center;
      gap: 12px;
    }
    .logo {
      --logo-size: 36px;
      flex: none;
    }
    small {
      display: block;
      color: var(--muted);
    }
    .total {
      justify-content: flex-end;
      font-weight: 600;
      color: var(--text);
    }
    dl {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 6px 16px;
      margin: 0;
    }
    dt {
      color: var(--muted);
    }
    dd {
      margin: 0;
      overflow-wrap: anywhere;
    }
  `,
})
export class HistoryPageComponent {
  protected readonly history = inject(HistoryStore);
  protected readonly catalog = inject(CatalogStore);
  protected readonly lang = inject(LanguageStore);
  protected readonly money = (tiyin: number): string => `${formatSum(fromTiyin(tiyin))} ${this.lang.t('sum')}`;

  constructor() {
    this.history.watch();
  }
}
