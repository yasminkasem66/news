import { computed, inject, Injectable, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, Observable, shareReplay, switchMap, throwError } from 'rxjs';
import { ApiService } from '../core/api/api.service';
import { toLoadState } from '../core/api/to-load-state';
import { LanguageService } from '../core/i18n/language.service';
import { PagedResult } from '../models/delivery-api';
import { Lang } from '../models/lang';
import { LoadState } from '../models/load-state';
import { SiteSettings } from '../models/site-settings';

/**
 * Site Settings (E10), loaded once per language and shared app-wide (FR-024).
 * Switching language fetches that language once; switching back reuses the cached copy.
 */
@Injectable({ providedIn: 'root' })
export class SiteSettingsService {
  private readonly api = inject(ApiService);
  private readonly lang = inject(LanguageService).lang;
  private readonly cache = new Map<Lang, Observable<SiteSettings | null>>();
  private readonly attempt = signal(0);

  readonly settings = toSignal(
    toObservable(computed(() => ({ lang: this.lang(), attempt: this.attempt() }))).pipe(
      switchMap(({ lang }) =>
        this.load(lang).pipe(
          toLoadState(
            (value) => value === null,
            () => this.reload(),
          ),
        ),
      ),
      map((state) => state as LoadState<SiteSettings>),
    ),
    { initialValue: { status: 'loading' } as LoadState<SiteSettings> },
  );

  reload(): void {
    this.cache.delete(this.lang());
    this.attempt.update((n) => n + 1);
  }

  private load(lang: Lang): Observable<SiteSettings | null> {
    let request = this.cache.get(lang);
    if (!request) {
      request = this.api.getContent<PagedResult<SiteSettings>>({ filters: ['contentType:siteSettings'] }).pipe(
        map(({ items }) => items[0] ?? null),
        // Never cache a failure: the next attempt must hit the network again.
        catchError((error: unknown) => {
          this.cache.delete(lang);
          return throwError(() => error);
        }),
        shareReplay(1),
      );
      this.cache.set(lang, request);
    }
    return request;
  }
}
