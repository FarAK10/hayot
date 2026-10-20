import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./features/payment/payment-page.component').then((m) => m.PaymentPageComponent),
  },
  {
    path: 'category/:id',
    loadComponent: () =>
      import('./features/payment/category-page.component').then((m) => m.CategoryPageComponent),
  },
  {
    path: 'history',
    loadComponent: () =>
      import('./features/history/history-page.component').then((m) => m.HistoryPageComponent),
  },
  { path: '**', redirectTo: '' },
];
