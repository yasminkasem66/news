import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import articlesSample from '../../../docs/api/samples/E1-articles.json';
import noResultsSample from '../../../docs/api/samples/E5-no-results.json';
import categoriesSample from '../../../docs/api/samples/E2-categories.json';
import byCategorySample from '../../../docs/api/samples/E3-by-category.json';
import { Category } from '../models/category';
import featuredSample from '../../../docs/api/samples/E6-featured.json';
import detailSample from '../../../docs/api/samples/E7-article-detail.json';
import retrySample from '../../../docs/api/samples/E8-language-gap-retry-default.json';
import { environment } from '../../environments/environment';
import { acceptLanguageInterceptor } from '../core/api/accept-language.interceptor';
import { LanguageService } from '../core/i18n/language.service';
import { Article, ArticleResult } from '../models/article';
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

  describe('getCategories and filtered getArticles', () => {
    const technology = '63158b7b-56d6-4fea-a957-262ec4fad8a3';

    it('lists categories in response (editor) order', () => {
      let result: Category[] = [];
      service.getCategories().subscribe((r) => (result = r));
      const req = http.expectOne(`${delivery}?filter=contentType:newsCategory`);
      expect(req.request.headers.get('Accept-Language')).toBe('en-US');
      req.flush(categoriesSample);
      expect(result.map((c) => c.name)).toEqual(['Technology', 'Sports', 'Business']);
    });

    it('adds a category filter', () => {
      service.getArticles({ page: 1, pageSize: 20, categoryId: technology }).subscribe();
      http
        .expectOne(
          `${delivery}?filter=contentType:newsArticle&filter=category:${technology}&sort=publishedDate:desc&skip=0&take=20`,
        )
        .flush(byCategorySample);
      expect().nothing();
    });

    it('adds a tag filter', () => {
      service.getArticles({ page: 1, pageSize: 20, tag: 'demo' }).subscribe();
      http
        .expectOne(`${delivery}?filter=contentType:newsArticle&filter=tags:demo&sort=publishedDate:desc&skip=0&take=20`)
        .flush({ total: 0, items: [] });
      expect().nothing();
    });

    it('combines category and tag filters (ANDed by the backend)', () => {
      service.getArticles({ page: 1, pageSize: 20, categoryId: technology, tag: 'demo' }).subscribe();
      const req = http.expectOne((r) => r.url === delivery);
      expect(req.request.params.getAll('filter')).toEqual([
        'contentType:newsArticle',
        `category:${technology}`,
        'tags:demo',
      ]);
      req.flush({ total: 0, items: [] });
    });

    it('sends the tag exactly as given — matching is case-sensitive, so no lower-casing', () => {
      service.getArticles({ page: 1, pageSize: 20, tag: 'Demo' }).subscribe();
      const req = http.expectOne((r) => r.url === delivery);
      expect(req.request.params.getAll('filter')).toContain('tags:Demo');
      req.flush({ total: 0, items: [] });
    });
  });

  describe('getArticle', () => {
    const translatedId = '5b8e0d5f-b1a4-4518-816d-371f1300bbf9';
    const englishOnlyId = '170e2282-6ae0-4f0d-b6f1-b080d6c10d2f';
    const missingId = '00000000-0000-0000-0000-000000000000';
    const notFound = { status: 404, statusText: 'Not Found' };

    it('returns ok with the article and its cultures', () => {
      let result: ArticleResult | undefined;
      service.getArticle(translatedId).subscribe((r) => (result = r));

      const req = http.expectOne(`${delivery}/item/${translatedId}`);
      expect(req.request.headers.get('Accept-Language')).toBe('en-US');
      req.flush(detailSample);

      expect(result!.kind).toBe('ok');
      if (result!.kind === 'ok') {
        expect(result!.article.name).toBe('City Unveils New Tech Hub');
        expect(Object.keys(result!.article.cultures!)).toContain('ar');
      }
    });

    it('in Arabic, a 404 then English 200 is a language gap (exactly one retry, in en-US)', () => {
      language.setLang('ar');
      let result: ArticleResult | undefined;
      service.getArticle(englishOnlyId).subscribe((r) => (result = r));

      const first = http.expectOne(`${delivery}/item/${englishOnlyId}`);
      expect(first.request.headers.get('Accept-Language')).toBe('ar');
      first.flush(null, notFound);

      const retry = http.expectOne(`${delivery}/item/${englishOnlyId}`);
      expect(retry.request.headers.get('Accept-Language')).toBe('en-US');
      retry.flush(retrySample);

      expect(result).toEqual({ kind: 'languageGap', availableIn: ['en'] });
    });

    it('in Arabic, a 404 then English 404 is not found', () => {
      language.setLang('ar');
      let result: ArticleResult | undefined;
      service.getArticle(missingId).subscribe((r) => (result = r));

      http.expectOne(`${delivery}/item/${missingId}`).flush(null, notFound);
      http.expectOne(`${delivery}/item/${missingId}`).flush(null, notFound);

      expect(result).toEqual({ kind: 'notFound' });
    });

    it('in English, a 404 is not found with no retry', () => {
      let result: ArticleResult | undefined;
      service.getArticle(missingId).subscribe((r) => (result = r));

      http.expectOne(`${delivery}/item/${missingId}`).flush(null, notFound);
      http.expectNone(`${delivery}/item/${missingId}`);

      expect(result).toEqual({ kind: 'notFound' });
    });

    it('propagates other errors', () => {
      let error: unknown;
      service.getArticle(translatedId).subscribe({ error: (e) => (error = e) });
      http.expectOne(`${delivery}/item/${translatedId}`).flush(null, { status: 500, statusText: 'Server Error' });
      expect(error).toBeTruthy();
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
