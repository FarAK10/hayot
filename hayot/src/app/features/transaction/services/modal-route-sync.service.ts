import { Injectable, effect, inject, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { from, map, switchMap, take } from 'rxjs';
import { RECIPIENT_QUERY_PARAM } from '../../../core/config/app.config.constants';
import { CatalogStore } from '../../../core/stores/catalog/catalog.store';

const DIALOG_WIDTH = '480px';
const DIALOG_MAX_WIDTH = '100vw';

@Injectable({ providedIn: 'root' })
export class ModalRouteSync {
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly catalogStore = inject(CatalogStore);
  private ref: MatDialogRef<unknown> | null = null;
  private opening = false;

  private readonly route = inject(ActivatedRoute);
  private readonly recipientParam$ = this.route.queryParamMap.pipe(
    map((params) => params.get(RECIPIENT_QUERY_PARAM)),
  );
  private readonly param = toSignal(this.recipientParam$, { initialValue: null });

  constructor() {
    effect(() => {
      const raw = this.param();
      const loaded = !this.catalogStore.loading();
      untracked(() => this.sync(raw, loaded));
    });
  }

  private sync(raw: string | null, loaded: boolean): void {
    if (raw === null) {
      this.ref?.close();
      return;
    }
    if (!loaded || this.ref || this.opening) {
      return;
    }
    const recipientId = Number(raw);
    if (!this.catalogStore.getRecipientById(recipientId)) {
      this.removeParam();
      return;
    }
    this.openModal(recipientId);
  }

  private openModal(recipientId: number): void {
    this.opening = true;
    from(import('../payment-modal/payment-modal.component'))
      .pipe(
        map((module) => module.PaymentModalComponent),
        switchMap((PaymentModalComponent) => {
          this.ref = this.dialog.open(PaymentModalComponent, {
            data: { recipientId },
            width: DIALOG_WIDTH,
            maxWidth: DIALOG_MAX_WIDTH,
            panelClass: 'payflow-dialog',
            ariaLabelledBy: 'payment-title',
            autoFocus: 'first-tabbable',
          });
          this.opening = false;
          return this.ref.afterClosed();
        }),
        take(1),
      )
      .subscribe(() => {
        this.ref = null;
        if (this.param() !== null) {
          this.removeParam();
        }
      });
  }

  private removeParam(): void {
    void this.router.navigate([], {
      queryParams: { [RECIPIENT_QUERY_PARAM]: null },
      queryParamsHandling: 'merge',
      replaceUrl: false,
    });
  }
}
