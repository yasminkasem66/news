import { Routes } from '@angular/router';

// Route `title`s are Transloco keys (see PageTitleStrategy). Feature routes go before the wildcard.
export const routes: Routes = [
  {
    path: '**',
    title: 'notFound.title',
    loadComponent: () => import('./features/not-found/not-found.page'),
  },
];
