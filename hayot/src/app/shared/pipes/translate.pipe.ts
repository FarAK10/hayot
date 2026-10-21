import { Pipe, PipeTransform, inject } from '@angular/core';
import { LanguageStore } from '../../core/stores/language/language.store';
import { InterpolationParams } from '../../core/utils/text.util';
import { UiKey } from '../i18n/ui-strings';

@Pipe({ name: 'translate', pure: false })
export class TranslatePipe implements PipeTransform {
  private readonly languageStore = inject(LanguageStore);

  transform(key: UiKey, params?: InterpolationParams): string {
    return this.languageStore.t(key, params);
  }
}
