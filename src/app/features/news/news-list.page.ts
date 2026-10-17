import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { loadStateSignal } from '../../core/api/load-state-signal';
import { availableLangs } from '../../core/util/cultures';
import { LanguageService } from '../../core/i18n/language.service';
import { Article } from '../../models/article';
import { PagedResult } from '../../models/delivery-api';
import { NewsService } from '../../services/news.service';
import { Pagination } from '../../shared/pagination';
import { EmptyBlock } from '../../shared/state/empty-block';
import { ErrorBlock } from '../../shared/state/error-block';
import { LoadingBlock } from '../../shared/state/loading-block';
import { ArticleCard } from './article-card';
import { FeaturedStrip } from './featured-strip';

export const NEWS_PAGE_SIZE = 20;

@Component({
  selector: 'app-news-list-page',
  imports: [TranslocoPipe, ArticleCard, FeaturedStrip, Pagination, EmptyBlock, ErrorBlock, LoadingBlock],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1 class="mb-8 text-3xl font-bold text-slate-900">{{ 'news.title' | transloco }}</h1>

    <app-featured-strip />

    <h2 class="sr-only">{{ 'news.latest' | transloco }}</h2>
    @let s = list.state();
    @switch (s.status) {
      @case ('loading') {
        <app-loading-block />
      }
      @case ('empty') {
        <app-empty-block message="news.noArticlesYet" />
      }
      @case ('error') {
        @if (s.status === 'error') {
          <app-error-block (retry)="s.retry()" />
        }
      }
      @case ('ok') {
        @if (s.status === 'ok') {
          @if (s.data.items.length === 0) {
            <!-- Page past the end of the results. -->
            <app-empty-block message="news.noResults" />
          } @else {
            <ul class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              @for (article of s.data.items; track article.id) {
                <li>
                  <app-article-card [article]="article" [showEnglishOnlyBadge]="englishOnly(article)" />
                </li>
              }
            </ul>
          }
          <app-pagination
            [page]="pageNumber()"
            [pageSize]="pageSize"
            [total]="s.data.total"
            (pageChange)="goToPage($event)"
          />
        }
      }
    }
  `,
})
export default class NewsListPage {
  private readonly news = inject(NewsService);
  private readonly router = inject(Router);
  private readonly lang = inject(LanguageService).lang;

  /** `?page=` query param (bound via withComponentInputBinding). */
  readonly page = input<string | undefined>();

  protected readonly pageSize = NEWS_PAGE_SIZE;
  protected readonly pageNumber = computed(() => {
    const n = Number(this.page());
    return Number.isInteger(n) && n >= 1 ? n : 1;
  });

  protected readonly list = loadStateSignal(
    () => ({ lang: this.lang(), page: this.pageNumber() }),
    ({ page }) => this.news.getArticles({ page, pageSize: NEWS_PAGE_SIZE }),
    (result: PagedResult<Article>) => result.total === 0,
  );

  protected englishOnly(article: Article): boolean {
    return this.lang() === 'en' && !availableLangs(article).includes('ar');
  }

  protected goToPage(page: number): void {
    void this.router.navigate([], {
      queryParams: { page: page > 1 ? page : null },
      queryParamsHandling: 'merge',
    });
  }
}
