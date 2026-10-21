import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressBar } from '@angular/material/progress-bar';
import { HistoryStore } from '../../../core/stores/history/history.store';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { HistoryItemComponent } from './history-item/history-item.component';

@Component({
  selector: 'app-history-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, MatExpansionModule, MatProgressBar, HistoryItemComponent],
  templateUrl: './history-page.component.html',
  styleUrl: './history-page.component.scss',
})
export class HistoryPageComponent {
  protected readonly history = inject(HistoryStore);

  constructor() {
    this.history.watch();
  }
}
