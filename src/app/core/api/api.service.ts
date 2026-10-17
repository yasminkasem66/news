import { HttpClient, HttpContext, HttpParams, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export const DELIVERY_API_PATH = '/umbraco/delivery/api/v2/content';

export interface ContentQuery {
  /** Each entry becomes its own `filter=` parameter, e.g. `contentType:newsArticle`. */
  filters?: string[];
  sort?: string;
  skip?: number;
  take?: number;
}

/**
 * The only place that knows backend URLs. Language is never put in the URL:
 * the backend ignores `?culture=` (research M5), so `acceptLanguageInterceptor` sends the header.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly deliveryUrl = `${environment.apiBaseUrl}${DELIVERY_API_PATH}`;

  getContent<T>(query: ContentQuery, context?: HttpContext): Observable<T> {
    let params = new HttpParams();
    for (const filter of query.filters ?? []) {
      params = params.append('filter', filter);
    }
    if (query.sort) {
      params = params.append('sort', query.sort);
    }
    if (query.skip !== undefined) {
      params = params.append('skip', query.skip);
    }
    if (query.take !== undefined) {
      params = params.append('take', query.take);
    }
    return this.http.get<T>(this.deliveryUrl, { params, context });
  }

  getItem<T>(id: string, context?: HttpContext): Observable<T> {
    return this.http.get<T>(`${this.deliveryUrl}/item/${encodeURIComponent(id)}`, { context });
  }

  post<TResponse>(path: string, body: unknown): Observable<HttpResponse<TResponse>> {
    return this.http.post<TResponse>(`${environment.apiBaseUrl}${path}`, body, { observe: 'response' });
  }
}
