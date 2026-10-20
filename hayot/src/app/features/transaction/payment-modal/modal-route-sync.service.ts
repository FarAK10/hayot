import { Injectable, effect, inject, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { CatalogStore } from '../../../core/stores/catalog.store';

/**
 * Keeps the payment modal in sync with the `?recipient=<id>` query param:
 * the param opens it, closing removes the param, and browser Back closes it.
 */
@Injectable({ providedIn: 'root' })
export class ModalRouteSync {
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly catalog = inject(CatalogStore);
  private ref: MatDialogRef<unknown> | null = null;
  private opening = false;

  private readonly param = toSignal(
    inject(ActivatedRoute).queryParamMap.pipe(map((p) => p.get('recipient'))),
    { initialValue: null },
  );

  constructor() {
    effect(() => {
      const raw = this.param();
      const loaded = !this.catalog.loading();
      untracked(() => void this.sync(raw, loaded));
    });
  }

  private async sync(raw: string | null, loaded: boolean): Promise<void> {
    if (raw === null) {
      this.ref?.close();
      return;
    }
    if (!loaded || this.ref || this.opening) return;
    const id = Number(raw);
    if (!this.catalog.recipient(id)) {
      this.removeParam();
      return;
    }
    this.opening = true;
    const { PaymentModalComponent } = await import('./payment-modal.component');
    this.ref = this.dialog.open(PaymentModalComponent, {
      data: { recipientId: id },
      width: '480px',
      maxWidth: '100vw',
      panelClass: 'payflow-dialog',
      ariaLabelledBy: 'payment-title',
      autoFocus: 'first-tabbable',
    });
    this.opening = false;
    this.ref.afterClosed().subscribe(() => {
      this.ref = null;
      if (this.param() !== null) this.removeParam();
    });
  }

  private removeParam(): void {
    void this.router.navigate([], {
      queryParams: { recipient: null },
      queryParamsHandling: 'merge',
      replaceUrl: false,
    });
  }
}
