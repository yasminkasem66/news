import { Routes } from '@angular/router';

// Route `title`s are Transloco keys (see PageTitleStrategy). Feature routes go before the wildcard.
export const routes: Routes = [
  {
    path: 'news',
    title: 'news.title',
    loadComponent: () => import('./features/news/news-list.page'),
  },
  {
    // Title is set by the page from the article name (PageTitleStrategy.setRaw).
    path: 'news/:id',
    loadComponent: () => import('./features/news/article-detail.page'),
  },
  {
    path: '**',
    title: 'notFound.title',
    loadComponent: () => import('./features/not-found/not-found.page'),
  },
];
