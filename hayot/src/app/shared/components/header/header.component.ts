import { UpperCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatIconButton } from '@angular/material/button';
import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';
import { MatToolbar } from '@angular/material/toolbar';
import { Router, RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs';
import { SEARCH_DEBOUNCE, SEARCH_QUERY_PARAM } from '../../../core/config/app.config.constants';
import { LANGS, Lang } from '../../../core/models/catalog.models';
import { LanguageStore } from '../../../core/stores/language/language.store';
import { CatalogStore } from '../../../core/stores/catalog/catalog.store';
import { TranslatePipe } from '../../pipes/translate.pipe';

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
  protected readonly lang = inject(LanguageStore);
  protected readonly catalog = inject(CatalogStore);
  private readonly router = inject(Router);
  protected readonly langs: readonly Lang[] = LANGS;
  protected readonly searchControl = new FormControl('', { nonNullable: true });

  constructor() {
    this.listenToTyping();
    this.mirrorStoreInput();
    this.syncUrlOnClear();
  }

  private syncUrlOnClear(): void {
    effect(() => {
      if (!this.catalog.query()) {
        untracked(() => this.syncUrl(''));
      }
    });
  }

  private listenToTyping(): void {
    this.searchControl.valueChanges
      .pipe(
        tap((value) => this.catalog.setSearchInput(value)),
        debounceTime(SEARCH_DEBOUNCE),
        distinctUntilChanged(),
        takeUntilDestroyed(),
      )
      .subscribe((value) => {
        this.catalog.setSearchQuery(value);
        this.syncUrl(value.trim());
      });
  }

  private mirrorStoreInput(): void {
    effect(() => {
      const input = this.catalog.input();
      if (input !== this.searchControl.value) {
        this.searchControl.setValue(input, { emitEvent: false });
      }
    });
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
