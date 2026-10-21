import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { Subject } from 'rxjs';
import {
  CATALOG_URL,
  PAYMENT_DIALOG_WIDTH,
  RECIPIENT_QUERY_PARAM,
} from '../../../core/config/app.config.constants';
import { CatalogStore } from '../../../core/stores/catalog/catalog.store';
import { RAW_CATALOG, RecipientId } from '../../../testing/catalog.fixture';
import { ModalRouteSync } from './modal-route-sync.service';

interface FakeDialogRef {
  afterClosed: () => Subject<void>;
  close: ReturnType<typeof vi.fn>;
}

describe('ModalRouteSync', () => {
  const UNKNOWN_RECIPIENT_ID = 1;
  let router: Router;
  let dialogRefs: FakeDialogRef[];
  let open: ReturnType<typeof vi.fn>;

  const currentParam = () =>
    TestBed.inject(ActivatedRoute).snapshot.queryParamMap.get(RECIPIENT_QUERY_PARAM);

  const navigateTo = (recipient: number | null) =>
    router.navigate([], { queryParams: { [RECIPIENT_QUERY_PARAM]: recipient } });

  beforeEach(async () => {
    dialogRefs = [];
    open = vi.fn(() => {
      const closed = new Subject<void>();
      const ref: FakeDialogRef = {
        afterClosed: () => closed,
        close: vi.fn(() => closed.next()),
      };
      dialogRefs.push(ref);
      return ref;
    });
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MatDialog, useValue: { open } },
      ],
    });
    router = TestBed.inject(Router);
    TestBed.inject(CatalogStore).load();
    TestBed.inject(HttpTestingController).expectOne(CATALOG_URL).flush(RAW_CATALOG);
    TestBed.inject(ModalRouteSync).init();
    await TestBed.inject(ApplicationRef).whenStable();
  });

  it('opens the dialog for a known recipient', async () => {
    await navigateTo(RecipientId.Beeline);

    await vi.waitFor(() => expect(open).toHaveBeenCalledTimes(1));
    const [, config] = open.mock.calls[0];
    expect(config).toMatchObject({
      data: { recipientId: RecipientId.Beeline },
      width: PAYMENT_DIALOG_WIDTH,
    });
  });

  it('drops the param when the dialog is closed', async () => {
    await navigateTo(RecipientId.Beeline);
    await vi.waitFor(() => expect(open).toHaveBeenCalled());

    dialogRefs[0].afterClosed().next();

    await vi.waitFor(() => expect(currentParam()).toBeNull());
  });

  it('closes the dialog when the param disappears', async () => {
    await navigateTo(RecipientId.Beeline);
    await vi.waitFor(() => expect(open).toHaveBeenCalled());

    await navigateTo(null);

    await vi.waitFor(() => expect(dialogRefs[0].close).toHaveBeenCalled());
  });

  it('removes a param that points at an unknown recipient without opening', async () => {
    await navigateTo(UNKNOWN_RECIPIENT_ID);

    await vi.waitFor(() => expect(currentParam()).toBeNull());
    expect(open).not.toHaveBeenCalled();
  });
});
