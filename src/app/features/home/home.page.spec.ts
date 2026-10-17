import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import articlesSample from '../../../../docs/api/samples/E1-articles.json';
import featuredSample from '../../../../docs/api/samples/E6-featured.json';
import { Article } from '../../models/article';
import { PagedResult } from '../../models/delivery-api';
import { NewsService } from '../../services/news.service';
import { provideTranslocoTesting } from '../../testing/transloco-testing';
import HomePage from './home.page';

describe('HomePage', () => {
  const latest: PagedResult<Article> = {
    total: 8,
    items: (articlesSample.items as unknown as Article[]).slice(0, 6),
  };
  const featured = featuredSample.items as unknown as Article[];

  function render(getFeatured: () => Observable<Article[]>, getArticles: () => Observable<PagedResult<Article>>) {
    const articlesSpy = jasmine.createSpy('getArticles').and.callFake(getArticles);
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideTranslocoTesting(),
        { provide: NewsService, useValue: { getFeatured, getArticles: articlesSpy } },
      ],
    });
    const fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();
    return { el: fixture.nativeElement as HTMLElement, articlesSpy };
  }

  it('shows featured articles and the 6 latest, with a link to all news', () => {
    const { el, articlesSpy } = render(() => of(featured), () => of(latest));
    expect(articlesSpy).toHaveBeenCalledWith({ page: 1, pageSize: 6 });
    expect(el.querySelectorAll('section[aria-labelledby="latest-heading"] h3').length).toBe(6);
    expect(el.querySelector('#featured-heading')).not.toBeNull();
    const viewAll = Array.from(el.querySelectorAll('a')).find((a) => a.textContent!.includes('View all news'))!;
    expect(viewAll.getAttribute('href')).toBe('/news');
  });

  it('keeps the latest section when featured fails', () => {
    const { el } = render(() => throwError(() => new Error('network')), () => of(latest));
    expect(el.querySelectorAll('section[aria-labelledby="latest-heading"] h3').length).toBe(6);
  });

  it('shows "no articles yet" when nothing is published', () => {
    const { el } = render(() => of([]), () => of({ total: 0, items: [] }));
    expect(el.textContent).toContain('No articles have been published yet.');
  });
});
