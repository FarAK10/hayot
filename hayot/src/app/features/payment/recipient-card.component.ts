import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Recipient } from '../../core/models/catalog.models';
import { LanguageStore } from '../../core/stores/language.store';
import { highlight } from '../../core/utils/search.util';
import { LogoComponent } from '../../shared/components/logo.component';

@Component({
  selector: 'app-recipient-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LogoComponent],
  template: `
    <a
      class="card"
      [routerLink]="[]"
      [queryParams]="{ recipient: recipient().id }"
      queryParamsHandling="merge"
      [attr.aria-label]="name()"
    >
      <app-logo [logo]="recipient().logo" [name]="name()" [seed]="recipient().id" />
      <span class="name">
        @for (p of parts(); track $index) {
          @if (p.match) {
            <mark>{{ p.text }}</mark>
          } @else {
            {{ p.text }}
          }
        }
      </span>
    </a>
  `,
  styles: `
    .card {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      min-height: 120px;
      padding: 12px;
      background: var(--surface);
      border-radius: var(--radius-card);
      transition:
        transform 0.15s,
        box-shadow 0.15s;
      text-align: center;
    }
    .card:hover,
    .card:focus-visible {
      transform: translateY(-2px);
      box-shadow: var(--shadow-hover);
    }
    .name {
      font-weight: 500;
      overflow-wrap: anywhere;
    }
    mark {
      background: #bff3f6;
      color: inherit;
      border-radius: 3px;
    }
  `,
})
export class RecipientCardComponent {
  readonly recipient = input.required<Recipient>();
  readonly query = input('');

  private readonly lang = inject(LanguageStore);
  protected readonly name = computed(() => this.lang.localize(this.recipient().name));
  protected readonly parts = computed(() => highlight(this.name(), this.query()));
}
