import { provideHttpClient } from '@angular/common/http';
import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { environment } from '../environments/environment';
import { FirebaseTransactionApi } from './core/services/firebase-transaction.api';
import { LocalTransactionApi } from './core/services/local-transaction.api';
import { TransactionApi } from './core/services/transaction.api';
import { CatalogStore } from './core/stores/catalog.store';
import { ModalRouteSync } from './features/transaction/payment-modal/modal-route-sync.service';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    {
      provide: TransactionApi,
      useClass: environment.transactionBackend === 'firebase' ? FirebaseTransactionApi : LocalTransactionApi,
    },
    // Not awaited: pages render skeletons / an error state while the catalog loads.
    provideAppInitializer(() => {
      void inject(CatalogStore).load();
      inject(ModalRouteSync);
    }),
  ],
};
