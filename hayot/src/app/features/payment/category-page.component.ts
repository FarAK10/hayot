import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { CatalogStore } from '../../core/stores/catalog.store';
import { LanguageStore } from '../../core/stores/language.store';
import { CategorySectionComponent } from './category-section.component';

@Component({
  selector: 'app-category-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CategorySectionComponent],
  template: `
    <div class="page">
      <a class="back" routerLink="/">← {{ lang.t('back') }}</a>
      @if (category(); as c) {
        <app-category-section [category]="c" [recipients]="catalog.recipientsOf(c.id)" />
      } @else if (!catalog.loading()) {
        <p class="empty">{{ lang.t('notFound') }}</p>
      }
    </div>
  `,
  styles: `
    .back {
      display: inline-block;
      color: var(--accent-text);
      font-weight: 500;
      margin-bottom: 16px;
    }
    .empty {
      color: var(--muted);
    }
  `,
})
export class CategoryPageComponent {
  protected readonly catalog = inject(CatalogStore);
  protected readonly lang = inject(LanguageStore);

  private readonly id = toSignal(
    inject(ActivatedRoute).paramMap.pipe(map((p) => Number(p.get('id')))),
    { initialValue: NaN },
  );
  protected readonly category = computed(() => this.catalog.category(this.id()));
}
