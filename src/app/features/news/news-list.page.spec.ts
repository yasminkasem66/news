import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import articlesSample from '../../../../docs/api/samples/E1-articles.json';
import noResultsSample from '../../../../docs/api/samples/E5-no-results.json';
import { Article, ArticleQuery } from '../../models/article';
import { PagedResult } from '../../models/delivery-api';
import { NewsService } from '../../services/news.service';
import { provideTranslocoTesting } from '../../testing/transloco-testing';
import NewsListPage from './news-list.page';

describe('NewsListPage', () => {
  const articles = articlesSample as unknown as PagedResult<Article>;
  let getArticles: jasmine.Spy<(q: ArticleQuery) => import('rxjs').Observable<PagedResult<Article>>>;
  let detectChanges: () => void;

  function render(result: () => import('rxjs').Observable<PagedResult<Article>>, page?: string) {
    getArticles = jasmine.createSpy('getArticles').and.callFake(result);
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideTranslocoTesting(),
        { provide: NewsService, useValue: { getArticles, getFeatured: () => of([]) } },
      ],
    });
    const fixture = TestBed.createComponent(NewsListPage);
    detectChanges = () => fixture.detectChanges();
    if (page !== undefined) {
      fixture.componentRef.setInput('page', page);
    }
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('renders one card per article, newest first', () => {
    const el = render(() => of(articles));
    const titles = Array.from(el.querySelectorAll('h3')).map((h) => h.textContent!.trim());
    expect(titles.length).toBe(8);
    expect(titles[0]).toBe('City Unveils New Tech Hub');
    expect(getArticles).toHaveBeenCalledWith({ page: 1, pageSize: 20 });
  });

  it('shows "no articles yet" for an empty result, not an error', () => {
    const el = render(() => of(noResultsSample));
    expect(el.textContent).toContain('No articles have been published yet.');
    expect(el.querySelector('[role="alert"]')).toBeNull();
  });

  it('shows "no results" for a page past the end', () => {
    const el = render(() => of({ total: 8, items: [] }), '2');
    expect(el.textContent).toContain('No articles match your search.');
  });

  it('passes ?page= to the service and treats invalid values as page 1', () => {
    render(() => of(articles), '3');
    expect(getArticles).toHaveBeenCalledWith({ page: 3, pageSize: 20 });
    TestBed.resetTestingModule();
    render(() => of(articles), 'abc');
    expect(getArticles).toHaveBeenCalledWith({ page: 1, pageSize: 20 });
  });

  it('shows an error with retry and re-requests on retry', () => {
    const el = render(() => throwError(() => new Error('network')));
    expect(el.querySelector('[role="alert"]')).not.toBeNull();
    (el.querySelector('[role="alert"] button') as HTMLButtonElement).click();
    detectChanges();
    expect(getArticles).toHaveBeenCalledTimes(2);
  });

  it('marks English-only articles with a badge in English', () => {
    const el = render(() => of(articles));
    expect(el.querySelectorAll('li .bg-amber-100').length).toBe(3);
  });
});
