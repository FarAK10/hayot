import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import {
  FULL_CIRCLE_DEGREES,
  LOGO_HUE_STEP,
  LOGO_LIGHTNESS_PERCENT,
  LOGO_SATURATION_PERCENT,
} from '../../../core/config/app.config.constants';
import { getInitials } from '../../../core/utils/initials.util';

@Component({
  selector: 'app-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './logo.component.html',
  styleUrl: './logo.component.scss',
})
export class LogoComponent {
  readonly logo = input.required<string>();
  readonly name = input.required<string>();
  readonly seed = input.required<number>();

  protected readonly failed = signal(false);
  protected readonly initials = computed(() => getInitials(this.name()));
  protected readonly color = computed(() => {
    const hue = (this.seed() * LOGO_HUE_STEP) % FULL_CIRCLE_DEGREES;
    return `hsl(${hue} ${LOGO_SATURATION_PERCENT}% ${LOGO_LIGHTNESS_PERCENT}%)`;
  });

  protected onImageError(): void {
    this.failed.set(true);
  }
}
