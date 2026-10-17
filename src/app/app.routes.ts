import { Routes } from '@angular/router';

// Route `title`s are Transloco keys (see PageTitleStrategy). Feature routes go before the wildcard.
export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'nav.home',
    loadComponent: () => import('./features/home/home.page'),
  },
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
    path: 'about',
    title: 'about.title',
    loadComponent: () => import('./features/about/about.page'),
  },
  // CMS navigation uses this path (research §10, M4).
  { path: 'about-us', redirectTo: 'about', pathMatch: 'full' },
  {
    path: 'contact',
    title: 'contact.title',
    loadComponent: () => import('./features/contact/contact.page'),
  },
  // CMS navigation uses this path (research §10, M4).
  { path: 'contact-us', redirectTo: 'contact', pathMatch: 'full' },
  {
    path: '**',
    title: 'notFound.title',
    loadComponent: () => import('./features/not-found/not-found.page'),
  },
];
