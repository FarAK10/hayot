import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { CATEGORY_ID_PARAM, NO_CATEGORY_ID } from '../../../core/config/app.config.constants';
import { CatalogStore } from '../../../core/stores/catalog/catalog.store';
import { CategorySectionComponent } from '../category-section/category-section.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-category-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, RouterLink, CategorySectionComponent],
  templateUrl: './category-page.component.html',
  styleUrl: './category-page.component.scss',
})
export class CategoryPageComponent {
  private readonly catalogStore = inject(CatalogStore);
  protected readonly loading = this.catalogStore.loading;

  private readonly route = inject(ActivatedRoute);
  private readonly categoryId$ = this.route.paramMap.pipe(
    map((params) => Number(params.get(CATEGORY_ID_PARAM))),
  );
  private readonly id = toSignal(this.categoryId$, { initialValue: NO_CATEGORY_ID });
  protected readonly category = computed(() => this.catalogStore.category(this.id()));
  protected readonly recipients = computed(() => {
    const category = this.category();
    return category ? this.catalogStore.recipientsOf(category.id) : [];
  });
}
