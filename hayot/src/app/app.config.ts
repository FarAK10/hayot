import { provideHttpClient } from '@angular/common/http';
import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { CatalogStore } from './core/stores/catalog.store';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    // Not awaited: pages render skeletons / an error state while the catalog loads.
    provideAppInitializer(() => {
      void inject(CatalogStore).load();
    }),
  ],
};
