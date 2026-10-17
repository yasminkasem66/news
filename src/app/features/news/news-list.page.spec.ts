import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import articlesSample from '../../../../docs/api/samples/E1-articles.json';
import categoriesSample from '../../../../docs/api/samples/E2-categories.json';
import noResultsSample from '../../../../docs/api/samples/E5-no-results.json';
import { Article, ArticleQuery } from '../../models/article';
import { Category } from '../../models/category';
import { PagedResult } from '../../models/delivery-api';
import { NewsService } from '../../services/news.service';
import { provideTranslocoTesting } from '../../testing/transloco-testing';
import NewsListPage from './news-list.page';

describe('NewsListPage', () => {
  const articles = articlesSample as unknown as PagedResult<Article>;
  const categories = categoriesSample.items as unknown as Category[];
  const technology = categories[0].id;
  let getArticles: jasmine.Spy<(q: ArticleQuery) => Observable<PagedResult<Article>>>;
  let getFeatured: jasmine.Spy;
  let detectChanges: () => void;

  function render(
    result: () => Observable<PagedResult<Article>>,
    inputs: { page?: string; category?: string; tag?: string } = {},
    getCategories: () => Observable<Category[]> = () => of(categories),
  ) {
    getArticles = jasmine.createSpy('getArticles').and.callFake(result);
    getFeatured = jasmine.createSpy('getFeatured').and.returnValue(of([]));
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideTranslocoTesting(),
        { provide: NewsService, useValue: { getArticles, getFeatured, getCategories } },
      ],
    });
    const fixture = TestBed.createComponent(NewsListPage);
    detectChanges = () => fixture.detectChanges();
    for (const [key, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(key, value);
    }
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('renders one card per article, newest first', () => {
    const el = render(() => of(articles));
    const titles = Array.from(el.querySelectorAll('h3')).map((h) => h.textContent!.trim());
    expect(titles.length).toBe(8);
    expect(titles[0]).toBe('City Unveils New Tech Hub');
    expect(getArticles).toHaveBeenCalledWith({ page: 1, pageSize: 20, categoryId: undefined, tag: undefined });
  });

  it('shows "no articles yet" for an empty result without filters, not an error', () => {
    const el = render(() => of(noResultsSample));
    expect(el.textContent).toContain('No articles have been published yet.');
    expect(el.querySelector('[role="alert"]')).toBeNull();
  });

  it('shows "no results" for a page past the end', () => {
    const el = render(() => of({ total: 8, items: [] }), { page: '2' });
    expect(el.textContent).toContain('No articles match your search.');
  });

  it('passes ?page= to the service and treats invalid values as page 1', () => {
    render(() => of(articles), { page: '3' });
    expect(getArticles.calls.mostRecent().args[0].page).toBe(3);
    TestBed.resetTestingModule();
    render(() => of(articles), { page: 'abc' });
    expect(getArticles.calls.mostRecent().args[0].page).toBe(1);
  });

  it('shows an error with retry and re-requests on retry', () => {
    const el = render(() => throwError(() => new Error('network')));
    (el.querySelector('[role="alert"] button') as HTMLButtonElement).click();
    detectChanges();
    expect(getArticles).toHaveBeenCalledTimes(2);
  });

  it('marks English-only articles with a badge in English', () => {
    const el = render(() => of(articles));
    expect(el.querySelectorAll('li .bg-amber-100').length).toBe(3);
  });

  it('feeds ?category= to the service and the filter, and hides featured while filtering', () => {
    const el = render(() => of(articles), { category: technology });
    expect(getArticles.calls.mostRecent().args[0].categoryId).toBe(technology);
    const pressed = el.querySelector('app-category-filter button[aria-pressed="true"]')!;
    expect(pressed.textContent!.trim()).toContain('Technology');
    expect(el.querySelector('app-featured-strip')).toBeNull();
    expect(getFeatured).not.toHaveBeenCalled();
  });

  it('shows "no results" — not "no articles yet" — for a filtered empty result', () => {
    const el = render(() => of(noResultsSample), { tag: 'doesnotexist' });
    expect(getArticles.calls.mostRecent().args[0].tag).toBe('doesnotexist');
    expect(el.textContent).toContain('No articles match your search.');
    expect(el.textContent).not.toContain('No articles have been published yet.');
    expect(el.textContent).toContain('#doesnotexist');
  });

  it('selecting a category sets ?category= and resets the page', () => {
    const el = render(() => of(articles), { page: '2' });
    const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    (el.querySelectorAll('app-category-filter button')[1] as HTMLButtonElement).click();
    const [, extras] = navigate.calls.mostRecent().args;
    expect(extras!.queryParams).toEqual({ category: technology, page: null });
    expect(extras!.queryParamsHandling).toBe('merge');
  });

  it('Clear filters navigates to /news with no params', () => {
    const el = render(() => of(articles), { category: technology, tag: 'demo' });
    const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    const clear = Array.from(el.querySelectorAll('button')).find((b) => b.textContent!.includes('Clear filters'))!;
    clear.click();
    expect(navigate).toHaveBeenCalledWith(['/news']);
  });

  it('keeps the list working when categories fail to load', () => {
    const el = render(() => of(articles), {}, () => throwError(() => new Error('network')));
    expect(el.querySelector('app-category-filter')).toBeNull();
    expect(el.querySelectorAll('h3').length).toBe(8);
  });
});
