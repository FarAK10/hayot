import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Recipient } from '../../../../core/models/catalog.models';
import { LanguageStore } from '../../../../core/stores/language/language.store';
import { highlight } from '../../../../core/utils/search.util';
import { LogoComponent } from '../../../../shared/components/logo/logo.component';

@Component({
  selector: 'app-recipient-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LogoComponent],
  templateUrl: './recipient-card.component.html',
  styleUrl: './recipient-card.component.scss',
})
export class RecipientCardComponent {
  readonly recipient = input.required<Recipient>();
  readonly query = input('');

  private readonly lang = inject(LanguageStore);
  protected readonly name = computed(() => this.lang.localize(this.recipient().name));
  protected readonly parts = computed(() => highlight(this.name(), this.query()));
}
