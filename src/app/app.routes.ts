import { Routes } from '@angular/router';

// Route `title`s are Transloco keys (see PageTitleStrategy). Feature routes go before the wildcard.
export const routes: Routes = [
  {
    path: 'news',
    title: 'news.title',
    loadComponent: () => import('./features/news/news-list.page'),
  },
  {
    path: '**',
    title: 'notFound.title',
    loadComponent: () => import('./features/not-found/not-found.page'),
  },
];
