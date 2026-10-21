import { provideHttpClient } from '@angular/common/http';
import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { FirebaseTransactionApi } from './core/services/firebase-transaction.api';
import { TransactionApi } from './core/services/transaction.api';
import { CatalogStore } from './core/stores/catalog/catalog.store';
import { ModalRouteSync } from './features/transaction/services/modal-route-sync.service';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    { provide: TransactionApi, useClass: FirebaseTransactionApi },
    provideAppInitializer(() => {
      inject(CatalogStore).load();
      inject(ModalRouteSync);
    }),
  ],
};
