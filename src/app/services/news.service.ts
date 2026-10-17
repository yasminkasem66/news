import { HttpContext, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, defer, map, Observable, of, throwError } from 'rxjs';
import { LANGUAGE_OVERRIDE } from '../core/api/accept-language.interceptor';
import { ApiService } from '../core/api/api.service';
import { LanguageService } from '../core/i18n/language.service';
import { availableLangs } from '../core/util/cultures';
import { Article, ArticleQuery, ArticleResult } from '../models/article';
import { PagedResult } from '../models/delivery-api';
import { DEFAULT_LANG } from '../models/lang';

/** News Articles and Categories (endpoints E1–E9 in contracts/data-services.md). */
@Injectable({ providedIn: 'root' })
export class NewsService {
  private readonly api = inject(ApiService);
  private readonly language = inject(LanguageService);

  /** E1/E3/E4/E5: newest published first, paged by the server. */
  getArticles(query: ArticleQuery): Observable<PagedResult<Article>> {
    const filters = ['contentType:newsArticle'];
    if (query.categoryId) {
      filters.push(`category:${query.categoryId}`);
    }
    if (query.tag) {
      filters.push(`tags:${query.tag}`);
    }
    return this.api.getContent<PagedResult<Article>>({
      filters,
      sort: 'publishedDate:desc',
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    });
  }

  /** E6: the curated featured set in editor order. `isFeatured:true` is ignored by the backend (M2). */
  getFeatured(): Observable<Article[]> {
    return this.api
      .getContent<PagedResult<Article>>({
        filters: ['contentType:newsArticle', 'isFeatured:1'],
        sort: 'featuredOrder:asc',
      })
      .pipe(
        map(({ items }) =>
          [...items].sort(
            (a, b) =>
              a.properties.featuredOrder - b.properties.featuredOrder ||
              a.createDate.localeCompare(b.createDate),
          ),
        ),
      );
  }

  /**
   * E7/E8/E9. A 404 is ambiguous: missing, or not translated into the active language. Outside the
   * default language, one retry in the default culture tells them apart (docs/api/05-api-reference.md).
   */
  getArticle(id: string): Observable<ArticleResult> {
    return defer(() => {
      const requestedLang = this.language.lang();
      return this.api.getItem<Article>(id).pipe(
        map((article): ArticleResult => ({ kind: 'ok', article })),
        catchError((error: unknown) => {
          if (!isNotFound(error)) {
            return throwError(() => error);
          }
          if (requestedLang === DEFAULT_LANG) {
            return of<ArticleResult>({ kind: 'notFound' });
          }
          const context = new HttpContext().set(LANGUAGE_OVERRIDE, DEFAULT_LANG);
          return this.api.getItem<Article>(id, context).pipe(
            map((article): ArticleResult => {
              const langs = availableLangs(article);
              return { kind: 'languageGap', availableIn: langs.length ? langs : [DEFAULT_LANG] };
            }),
            catchError((retryError: unknown) =>
              isNotFound(retryError) ? of<ArticleResult>({ kind: 'notFound' }) : throwError(() => retryError),
            ),
          );
        }),
      );
    });
  }
}

function isNotFound(error: unknown): boolean {
  return error instanceof HttpErrorResponse && error.status === 404;
}
