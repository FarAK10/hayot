import { Pipe, PipeTransform, inject } from '@angular/core';
import { LanguageStore } from '../../core/stores/language/language.store';
import { InterpolationParams } from '../../core/utils/interpolate.util';
import { UiKey } from '../i18n/ui-strings';

@Pipe({ name: 'translate', pure: false })
export class TranslatePipe implements PipeTransform {
  private readonly lang = inject(LanguageStore);

  transform(key: UiKey, params?: InterpolationParams): string {
    return this.lang.t(key, params);
  }
}
