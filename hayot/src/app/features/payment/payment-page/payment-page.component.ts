import { ChangeDetectionStrategy, Component, effect, inject, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { map } from 'rxjs';
import { SEARCH_QUERY_PARAM, SKELETON_COUNT } from '../../../core/config/app.config.constants';
import { CatalogStore } from '../../../core/stores/catalog/catalog.store';
import { LanguageStore } from '../../../core/stores/language/language.store';
import { CategorySectionComponent } from '../category-section/category-section.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-payment-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, CategorySectionComponent, MatButton],
  templateUrl: './payment-page.component.html',
  styleUrl: './payment-page.component.scss',
})
export class PaymentPageComponent {
  protected readonly catalog = inject(CatalogStore);
  protected readonly lang = inject(LanguageStore);
  protected readonly skeleton = Array.from({ length: SKELETON_COUNT }, (_, index) => index);

  private readonly route = inject(ActivatedRoute);
  private readonly urlQuery$ = this.route.queryParamMap.pipe(
    map((params) => params.get(SEARCH_QUERY_PARAM) ?? ''),
  );
  private readonly urlQuery = toSignal(this.urlQuery$, { initialValue: '' });

  constructor() {
    effect(() => {
      const urlQuery = this.urlQuery();
      untracked(() => {
        if (urlQuery !== this.catalog.query()) {
          this.catalog.setSearchImmediate(urlQuery);
        }
      });
    });
  }
}
