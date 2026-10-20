import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PREVIEW_COUNT } from '../../core/config/app.config.constants';
import { Category, Recipient } from '../../core/models/catalog.models';
import { LanguageStore } from '../../core/stores/language.store';
import { RecipientCardComponent } from './recipient-card.component';

@Component({
  selector: 'app-category-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RecipientCardComponent],
  template: `
    <section>
      <h2>
        {{ lang.localize(category().name) }}
        <span class="count">{{ recipients().length }}</span>
        @if (preview() && recipients().length > previewCount) {
          <a class="more" [routerLink]="['/category', category().id]">{{ lang.t('more') }}</a>
        }
      </h2>
      <div class="cards">
        @for (r of shown(); track r.id) {
          <app-recipient-card [recipient]="r" [query]="query()" />
        }
      </div>
    </section>
  `,
  styles: `
    section {
      margin-bottom: 28px;
    }
    h2 {
      font-size: 18px;
      font-weight: 600;
      margin: 0 0 12px;
      display: flex;
      align-items: baseline;
      gap: 8px;
    }
    .count {
      color: var(--muted);
      font-size: 14px;
      font-weight: 400;
    }
    .more {
      color: var(--accent-text);
      font-size: 14px;
      font-weight: 500;
    }
  `,
})
export class CategorySectionComponent {
  readonly category = input.required<Category>();
  readonly recipients = input.required<readonly Recipient[]>();
  /** When true only the first PREVIEW_COUNT recipients are shown, with a "more" link. */
  readonly preview = input(false);
  readonly query = input('');

  protected readonly lang = inject(LanguageStore);
  protected readonly previewCount = PREVIEW_COUNT;
  protected readonly shown = computed(() =>
    this.preview() ? this.recipients().slice(0, PREVIEW_COUNT) : this.recipients(),
  );
}
