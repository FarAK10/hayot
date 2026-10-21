import { Pipe, PipeTransform, inject } from '@angular/core';
import { Localized } from '../../core/models/catalog.models';
import { LanguageStore } from '../../core/stores/language/language.store';

@Pipe({ name: 'localize', pure: false })
export class LocalizePipe implements PipeTransform {
  private readonly lang = inject(LanguageStore);

  transform(text: Localized | null | undefined): string {
    return this.lang.localize(text);
  }
}
