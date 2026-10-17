import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiService } from '../core/api/api.service';
import { Article, ArticleQuery } from '../models/article';
import { PagedResult } from '../models/delivery-api';

/** News Articles and Categories (endpoints E1–E9 in contracts/data-services.md). */
@Injectable({ providedIn: 'root' })
export class NewsService {
  private readonly api = inject(ApiService);

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
}
