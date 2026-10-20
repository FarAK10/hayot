import { ChangeDetectionStrategy, Component, effect, inject, untracked } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';
import { MatIconButton } from '@angular/material/button';
import { MatToolbar } from '@angular/material/toolbar';
import { LANGS, Lang } from '../../core/models/catalog.models';
import { LanguageStore } from '../../core/stores/language.store';
import { SearchStore } from '../../core/stores/search.store';

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatToolbar, MatButtonToggleGroup, MatButtonToggle, MatIconButton],
  template: `
    <mat-toolbar class="bar">
      <a class="brand" routerLink="/" (click)="search.clear()">Pay<b>Flow</b></a>

      <div class="search">
        <label class="visually-hidden" for="search">{{ lang.t('search') }}</label>
        <input
          id="search"
          type="search"
          autocomplete="off"
          [placeholder]="lang.t('search')"
          [value]="search.input()"
          (input)="onInput($event)"
          (keydown.escape)="search.clear()"
        />
        @if (search.input()) {
          <button mat-icon-button type="button" [attr.aria-label]="lang.t('clear')" (click)="search.clear()">
            <span class="material-symbols-outlined">close</span>
          </button>
        }
      </div>

      <a class="link" routerLink="/history">{{ lang.t('history') }}</a>

      <mat-button-toggle-group
        hideSingleSelectionIndicator
        [value]="lang.lang()"
        [attr.aria-label]="lang.t('language')"
        (change)="lang.setLang($event.value)"
      >
        @for (l of langs; track l) {
          <mat-button-toggle [value]="l">{{ l.toUpperCase() }}</mat-button-toggle>
        }
      </mat-button-toggle-group>
    </mat-toolbar>
  `,
  styles: `
    .bar {
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      gap: 16px;
      flex-wrap: wrap;
      height: auto;
      min-height: 64px;
      padding: 8px max(16px, calc((100% - var(--page-width)) / 2 + 16px));
    }
    .brand {
      font-size: 22px;
      font-weight: 500;
      color: var(--text);
    }
    .brand b {
      color: var(--accent-text);
      font-weight: 700;
    }
    .search {
      flex: 1 1 220px;
      display: flex;
      align-items: center;
      background: var(--bg);
      border-radius: var(--radius-input);
      padding-left: 12px;
      min-width: 0;
    }
    input {
      flex: 1;
      border: 0;
      background: transparent;
      font: inherit;
      padding: 10px 0;
      min-width: 0;
    }
    input:focus-visible {
      outline: none;
    }
    .search:focus-within {
      outline: 2px solid var(--accent-text);
    }
    .link {
      color: var(--text);
      font-weight: 500;
    }
    .visually-hidden {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0 0 0 0);
    }
    mat-button-toggle-group {
      --mat-button-toggle-height: 36px;
    }
  `,
})
export class HeaderComponent {
  protected readonly lang = inject(LanguageStore);
  protected readonly search = inject(SearchStore);
  private readonly router = inject(Router);
  protected readonly langs: readonly Lang[] = LANGS;

  constructor() {
    // Keep ?q= in sync with the (debounced) query; searching from another page goes home.
    effect(() => {
      const q = this.search.query().trim();
      untracked(() => {
        const tree = this.router.parseUrl(this.router.url);
        if ((tree.queryParams['q'] ?? '') === q) return;
        const segments = tree.root.children['primary']?.segments.length ?? 0;
        void this.router.navigate(q && segments > 0 ? ['/'] : [], {
          queryParams: { q: q || null },
          queryParamsHandling: 'merge',
          replaceUrl: true,
        });
      });
    });
  }

  protected onInput(e: Event): void {
    this.search.setInput((e.target as HTMLInputElement).value);
  }
}
