import { DestroyRef, Injectable, Injector, inject } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import {
  EMPTY,
  Observable,
  distinctUntilChanged,
  filter,
  from,
  map,
  switchMap,
  take,
  tap,
} from 'rxjs';
import {
  PAYMENT_DIALOG_MAX_WIDTH,
  PAYMENT_DIALOG_WIDTH,
  RECIPIENT_QUERY_PARAM,
} from '../../../core/config/app.config.constants';
import { CatalogStore } from '../../../core/stores/catalog/catalog.store';

@Injectable({ providedIn: 'root' })
export class ModalRouteSync {
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly catalogStore = inject(CatalogStore);

  private readonly recipientParam$ = this.route.queryParamMap.pipe(
    map((params) => params.get(RECIPIENT_QUERY_PARAM)),
    distinctUntilChanged(),
  );

  init(): void {
    toObservable(this.catalogStore.loading, { injector: this.injector })
      .pipe(
        filter((loading) => !loading),
        take(1),
        switchMap(() => this.recipientParam$),
        switchMap((param) => this.modalFor(param)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  private modalFor(param: string | null): Observable<never> {
    if (param === null) {
      return EMPTY;
    }
    const recipientId = Number(param);
    if (!this.catalogStore.getRecipientById(recipientId)) {
      this.removeParam();
      return EMPTY;
    }
    return this.openDialog(recipientId).pipe(tap({ complete: () => this.removeParam() }));
  }

  private openDialog(recipientId: number): Observable<never> {
    return from(import('../payment-modal/payment-modal.component')).pipe(
      switchMap(
        ({ PaymentModalComponent }) =>
          new Observable<never>((subscriber) => {
            const ref = this.dialog.open(PaymentModalComponent, {
              data: { recipientId },
              width: PAYMENT_DIALOG_WIDTH,
              maxWidth: PAYMENT_DIALOG_MAX_WIDTH,
              panelClass: 'payflow-dialog',
              ariaLabelledBy: 'payment-title',
              autoFocus: 'first-tabbable',
            });
            const closed = ref.afterClosed().subscribe(() => subscriber.complete());
            return () => {
              closed.unsubscribe();
              ref.close();
            };
          }),
      ),
    );
  }

  private removeParam(): void {
    void this.router.navigate([], {
      queryParams: { [RECIPIENT_QUERY_PARAM]: null },
      queryParamsHandling: 'merge',
      replaceUrl: false,
    });
  }
}
