import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { Transaction } from '../../../../core/models/transaction.models';
import { CatalogStore } from '../../../../core/stores/catalog/catalog.store';
import { LanguageStore } from '../../../../core/stores/language/language.store';
import { formatTiyin } from '../../../../core/utils/amount.util';
import { toDetailRow } from '../../../../core/utils/detail-row.util';
import { LogoComponent } from '../../../../shared/components/logo/logo.component';
import { SyncPipe } from '../../../../shared/pipes/sync.pipe';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-history-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, SyncPipe, DatePipe, MatExpansionModule, LogoComponent],
  templateUrl: './history-item.component.html',
  styleUrl: './history-item.component.scss',
})
export class HistoryItemComponent {
  readonly transaction = input.required<Transaction>();

  private readonly catalogStore = inject(CatalogStore);
  protected readonly languageStore = inject(LanguageStore);
  protected readonly formatTiyin = formatTiyin;

  protected readonly recipient = computed(() =>
    this.catalogStore.recipient(this.transaction().recipientId),
  );
  protected readonly title = computed(() => {
    const recipient = this.recipient();
    return recipient
      ? this.languageStore.localize(recipient.name)
      : `#${this.transaction().recipientId}`;
  });
  protected readonly rows = computed(() => {
    const { recipientId, keyValue } = this.transaction();
    const fields = this.catalogStore.fieldsFor(recipientId);
    const lang = this.languageStore.lang();
    const sumLabel = this.languageStore.t('sum');

    return keyValue.map((pair) =>
      toDetailRow(
        pair,
        fields.find((field) => field.key === pair.key),
        lang,
        sumLabel,
      ),
    );
  });
}
