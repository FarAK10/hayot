import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { FirebaseTransactionApi } from './core/services/firebase-transaction.api';
import { TransactionApi } from './core/services/transaction.api';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    { provide: TransactionApi, useClass: FirebaseTransactionApi },
  ],
};
