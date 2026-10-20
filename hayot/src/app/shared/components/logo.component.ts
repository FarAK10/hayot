import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';

@Component({
  selector: 'app-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (!failed()) {
      <img [src]="'logos/' + logo()" [alt]="name()" (error)="failed.set(true)" />
    } @else {
      <span class="tile" [style.background]="color()" aria-hidden="true">{{ initials() }}</span>
    }
  `,
  styles: `
    :host {
      display: inline-flex;
      width: var(--logo-size, 64px);
      height: var(--logo-size, 64px);
      align-items: center;
      justify-content: center;
    }
    img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
    .tile {
      width: 100%;
      height: 100%;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-weight: 600;
      font-size: calc(var(--logo-size, 64px) * 0.36);
    }
  `,
})
export class LogoComponent {
  readonly logo = input.required<string>();
  readonly name = input.required<string>();
  readonly seed = input.required<number>();

  protected readonly failed = signal(false);
  protected readonly initials = computed(() =>
    this.name()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join(''),
  );
  protected readonly color = computed(() => `hsl(${(this.seed() * 47) % 360} 55% 38%)`);
}
