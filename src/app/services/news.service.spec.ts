import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import articlesSample from '../../../docs/api/samples/E1-articles.json';
import noResultsSample from '../../../docs/api/samples/E5-no-results.json';
import featuredSample from '../../../docs/api/samples/E6-featured.json';
import { environment } from '../../environments/environment';
import { acceptLanguageInterceptor } from '../core/api/accept-language.interceptor';
import { LanguageService } from '../core/i18n/language.service';
import { Article } from '../models/article';
import { PagedResult } from '../models/delivery-api';
import { provideTranslocoTesting } from '../testing/transloco-testing';
import { NewsService } from './news.service';

const delivery = `${environment.apiBaseUrl}/umbraco/delivery/api/v2/content`;
const articles = articlesSample as unknown as PagedResult<Article>;
const featured = featuredSample as unknown as PagedResult<Article>;

describe('NewsService', () => {
  let service: NewsService;
  let http: HttpTestingController;
  let language: LanguageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([acceptLanguageInterceptor])),
        provideHttpClientTesting(),
        provideTranslocoTesting(),
      ],
    });
    service = TestBed.inject(NewsService);
    http = TestBed.inject(HttpTestingController);
    language = TestBed.inject(LanguageService);
    language.setLang('en');
  });

  afterEach(() => {
    http.verify();
    language.setLang('en');
  });

  describe('getArticles', () => {
    it('requests page 1 newest-first with the active language', () => {
      let result: PagedResult<Article> | undefined;
      service.getArticles({ page: 1, pageSize: 20 }).subscribe((r) => (result = r));

      const req = http.expectOne(
        `${delivery}?filter=contentType:newsArticle&sort=publishedDate:desc&skip=0&take=20`,
      );
      expect(req.request.headers.get('Accept-Language')).toBe('en-US');
      req.flush(articles);

      expect(result!.total).toBe(8);
      expect(result!.items[0].name).toBe('City Unveils New Tech Hub');
    });

    it('converts the page number to skip', () => {
      service.getArticles({ page: 2, pageSize: 20 }).subscribe();
      http
        .expectOne(`${delivery}?filter=contentType:newsArticle&sort=publishedDate:desc&skip=20&take=20`)
        .flush({ total: 8, items: [] });
      expect().nothing();
    });

    it('passes an empty result through as total 0', () => {
      let result: PagedResult<Article> | undefined;
      service.getArticles({ page: 1, pageSize: 20 }).subscribe((r) => (result = r));
      http.expectOne((r) => r.url === delivery).flush(noResultsSample);
      expect(result).toEqual({ total: 0, items: [] });
    });

    it('sends Accept-Language ar after switching language', () => {
      language.setLang('ar');
      service.getArticles({ page: 1, pageSize: 20 }).subscribe();
      const req = http.expectOne((r) => r.url === delivery);
      expect(req.request.headers.get('Accept-Language')).toBe('ar');
      req.flush({ total: 0, items: [] });
    });
  });

  describe('getFeatured', () => {
    it('uses isFeatured:1 sorted by featuredOrder and keeps that order', () => {
      let result: Article[] = [];
      service.getFeatured().subscribe((r) => (result = r));

      const req = http.expectOne(
        `${delivery}?filter=contentType:newsArticle&filter=isFeatured:1&sort=featuredOrder:asc`,
      );
      expect(req.request.urlWithParams).not.toContain('isFeatured:true');
      req.flush(featured);

      expect(result.map((a) => a.properties.featuredOrder)).toEqual([1, 2, 3]);
    });

    it('breaks featuredOrder ties by createDate ascending', () => {
      const [a, b] = featured.items;
      const tiedLater = { ...a, createDate: '2026-10-17T10:00:00Z', properties: { ...a.properties, featuredOrder: 1 } };
      const tiedEarlier = { ...b, createDate: '2026-10-17T09:00:00Z', properties: { ...b.properties, featuredOrder: 1 } };

      let result: Article[] = [];
      service.getFeatured().subscribe((r) => (result = r));
      http.expectOne((r) => r.url === delivery).flush({ total: 2, items: [tiedLater, tiedEarlier] });

      expect(result.map((x) => x.id)).toEqual([tiedEarlier.id, tiedLater.id]);
    });
  });
});
