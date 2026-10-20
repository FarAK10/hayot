import { ChangeDetectionStrategy, Component, effect, inject, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { map } from 'rxjs';
import { CatalogStore } from '../../core/stores/catalog.store';
import { LanguageStore } from '../../core/stores/language.store';
import { SearchStore } from '../../core/stores/search.store';
import { CategorySectionComponent } from './category-section.component';

@Component({
  selector: 'app-payment-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CategorySectionComponent, MatButton],
  template: `
    <div class="page">
      <h1>{{ lang.t('title') }}</h1>
      <p class="subtitle">{{ lang.t('subtitle') }}</p>

      @if (catalog.failed()) {
        <div class="state" role="alert">
          <p>{{ lang.t('loadError') }}</p>
          <button mat-flat-button (click)="catalog.load()">{{ lang.t('retry') }}</button>
        </div>
      } @else if (catalog.loading()) {
        <div class="cards" aria-busy="true">
          @for (i of skeleton; track i) {
            <div class="skeleton"></div>
          }
        </div>
      } @else if (search.active()) {
        @for (g of search.groups(); track g.category.id) {
          <app-category-section [category]="g.category" [recipients]="g.recipients" [query]="search.query()" />
        } @empty {
          <p class="state">{{ lang.t('notFound') }}</p>
        }
      } @else {
        @for (c of catalog.categories(); track c.id) {
          <app-category-section [category]="c" [recipients]="catalog.recipientsOf(c.id)" [preview]="true" />
        }
      }
    </div>
  `,
  styles: `
    h1 {
      font-size: 28px;
      font-weight: 500;
      margin: 0;
    }
    .subtitle {
      color: var(--muted);
      margin: 4px 0 24px;
    }
    .state {
      text-align: center;
      color: var(--muted);
      padding: 48px 0;
    }
    .skeleton {
      min-height: 120px;
      border-radius: var(--radius-card);
      background: linear-gradient(90deg, #eceef0 25%, #f6f7f8 50%, #eceef0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.2s infinite;
    }
    @keyframes shimmer {
      to {
        background-position: -200% 0;
      }
    }
  `,
})
export class PaymentPageComponent {
  protected readonly catalog = inject(CatalogStore);
  protected readonly lang = inject(LanguageStore);
  protected readonly search = inject(SearchStore);
  protected readonly skeleton = Array.from({ length: 10 }, (_, i) => i);

  private readonly urlQuery = toSignal(
    inject(ActivatedRoute).queryParamMap.pipe(map((p) => p.get('q') ?? '')),
    { initialValue: '' },
  );

  constructor() {
    // Deep link: ?q= seeds the search when it differs from the active query.
    effect(() => {
      const q = this.urlQuery();
      untracked(() => {
        if (q !== this.search.query()) this.search.setImmediate(q);
      });
    });
  }
}
