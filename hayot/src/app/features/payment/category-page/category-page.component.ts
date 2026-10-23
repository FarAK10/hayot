import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { CATEGORY_ID_PARAM, NO_CATEGORY_ID } from '../../../core/config/app.config.constants';
import { CatalogStore } from '../../../core/stores/catalog/catalog.store';
import { ModalRouteSync } from '../../transaction/services/modal-route-sync.service';
import { CategorySectionComponent } from '../category-section/category-section.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-category-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, RouterLink, CategorySectionComponent],
  templateUrl: './category-page.component.html',
  styleUrl: './category-page.component.scss',
})
export class CategoryPageComponent implements OnInit {
  private readonly catalogStore = inject(CatalogStore);
  private readonly modalRouteSync = inject(ModalRouteSync);
  protected readonly loading = this.catalogStore.loading;

  private readonly route = inject(ActivatedRoute);
  private readonly categoryId$ = this.route.paramMap.pipe(
    map((params) => Number(params.get(CATEGORY_ID_PARAM))),
  );
  private readonly id = toSignal(this.categoryId$, { initialValue: NO_CATEGORY_ID });
  protected readonly category = computed(() => this.catalogStore.getCategoryById(this.id()));
  protected readonly recipients = computed(() => {
    const category = this.category();
    return category ? this.catalogStore.recipientsOf(category.id) : [];
  });

  ngOnInit(): void {
    this.catalogStore.loadOnce();
    this.modalRouteSync.init();
  }
}
