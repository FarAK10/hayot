import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressBar } from '@angular/material/progress-bar';
import { TransactionHistoryStore } from '../../../core/stores/transaction-history/transaction-history.store';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { HistoryItemComponent } from './history-item/history-item.component';

@Component({
  selector: 'app-history-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, MatExpansionModule, MatProgressBar, HistoryItemComponent],
  templateUrl: './history-page.component.html',
  styleUrl: './history-page.component.scss',
})
export class HistoryPageComponent implements OnInit {
  private readonly transactionHistoryStore = inject(TransactionHistoryStore);
  protected readonly items = this.transactionHistoryStore.items;
  protected readonly loading = this.transactionHistoryStore.loading;
  protected readonly failed = this.transactionHistoryStore.failed;

  ngOnInit(): void {
    this.transactionHistoryStore.getHistory();
  }
}
