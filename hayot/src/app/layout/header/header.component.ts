import { UpperCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatIconButton } from '@angular/material/button';
import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';
import { MatToolbar } from '@angular/material/toolbar';
import { Router, RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { SEARCH_DEBOUNCE, SEARCH_QUERY_PARAM } from '../../core/config/app.config.constants';
import { LANGS, Lang } from '../../core/models/catalog.models';
import { LanguageStore } from '../../core/stores/language/language.store';
import { CatalogStore } from '../../core/stores/catalog/catalog.store';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    UpperCasePipe,
    TranslatePipe,
    ReactiveFormsModule,
    RouterLink,
    MatToolbar,
    MatButtonToggleGroup,
    MatButtonToggle,
    MatIconButton,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  private readonly languageStore = inject(LanguageStore);
  private readonly catalogStore = inject(CatalogStore);
  protected readonly currentLang = this.languageStore.lang;
  private readonly router = inject(Router);
  protected readonly langs: readonly Lang[] = LANGS;
  protected readonly searchControl = new FormControl('', { nonNullable: true });
  protected readonly searchText = toSignal(this.searchControl.valueChanges, { initialValue: '' });
  private appliedQuery = '';

  constructor() {
    this.listenToTyping();
    this.mirrorExternalQuery();
  }

  private listenToTyping(): void {
    this.searchControl.valueChanges
      .pipe(debounceTime(SEARCH_DEBOUNCE), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((text) => this.applyQuery(text));
  }

  private mirrorExternalQuery(): void {
    effect(() => {
      const query = this.catalogStore.query();
      if (query !== this.appliedQuery) {
        this.appliedQuery = query;
        this.searchControl.setValue(query);
      }
    });
  }

  private applyQuery(query: string): void {
    this.appliedQuery = query;
    this.catalogStore.setSearchQuery(query);
    this.syncUrl(query.trim());
  }

  protected clearSearch(): void {
    this.searchControl.setValue('');
    this.applyQuery('');
  }

  protected setLang(lang: Lang): void {
    this.languageStore.setLang(lang);
  }

  private syncUrl(query: string): void {
    const urlQuery = this.router.parseUrl(this.router.url).queryParams[SEARCH_QUERY_PARAM] ?? '';
    if (urlQuery === query) {
      return;
    }

    const commands = query ? ['/'] : [];
    void this.router.navigate(commands, {
      queryParams: { [SEARCH_QUERY_PARAM]: query || null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
