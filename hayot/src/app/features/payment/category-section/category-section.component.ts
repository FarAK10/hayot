import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PREVIEW_COUNT } from '../../../core/config/app.config.constants';
import { Category, Recipient } from '../../../core/models/catalog.models';
import { RecipientCardComponent } from './recipient-card/recipient-card.component';
import { LocalizePipe } from '../../../shared/pipes/localize.pipe';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-category-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LocalizePipe, TranslatePipe, RouterLink, RecipientCardComponent],
  templateUrl: './category-section.component.html',
  styleUrl: './category-section.component.scss',
})
export class CategorySectionComponent {
  readonly category = input.required<Category>();
  readonly recipients = input.required<readonly Recipient[]>();
  readonly preview = input(false);
  readonly query = input('');

  protected readonly previewCount = PREVIEW_COUNT;
  protected readonly shown = computed(() =>
    this.preview() ? this.recipients().slice(0, PREVIEW_COUNT) : this.recipients(),
  );
}
