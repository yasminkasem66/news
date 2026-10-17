import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { LucideArrowRight } from '@lucide/angular';
import { loadStateSignal } from '../../core/api/load-state-signal';
import { availableLangs } from '../../core/util/cultures';
import { LanguageService } from '../../core/i18n/language.service';
import { Article } from '../../models/article';
import { PagedResult } from '../../models/delivery-api';
import { NewsService } from '../../services/news.service';
import { EmptyBlock } from '../../shared/state/empty-block';
import { ErrorBlock } from '../../shared/state/error-block';
import { LoadingBlock } from '../../shared/state/loading-block';
import { ArticleCard } from '../news/article-card';
import { FeaturedStrip } from '../news/featured-strip';

export const HOME_LATEST_COUNT = 6;

/** Featured articles (E6) and the latest few (E1), each failing independently (FR-027). */
@Component({
  selector: 'app-home-page',
  imports: [RouterLink, TranslocoPipe, LucideArrowRight, ArticleCard, FeaturedStrip, EmptyBlock, ErrorBlock, LoadingBlock],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1 class="sr-only">{{ 'site.name' | transloco }}</h1>

    <app-featured-strip />

    <section aria-labelledby="latest-heading">
      <div class="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="latest-heading" class="text-xl font-bold text-slate-900">{{ 'news.latest' | transloco }}</h2>
        <a routerLink="/news" class="inline-flex items-center gap-1 font-semibold text-brand-700 hover:underline">
          {{ 'news.viewAll' | transloco }}
          <svg lucideArrowRight class="size-4 rtl:rotate-180" aria-hidden="true"></svg>
        </a>
      </div>
      @let s = latest.state();
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
            <ul class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              @for (article of s.data.items; track article.id) {
                <li>
                  <app-article-card [article]="article" [showEnglishOnlyBadge]="englishOnly(article)" />
                </li>
              }
            </ul>
          }
        }
      }
    </section>
  `,
})
export default class HomePage {
  private readonly news = inject(NewsService);
  private readonly lang = inject(LanguageService).lang;

  protected readonly latest = loadStateSignal(
    () => this.lang(),
    () => this.news.getArticles({ page: 1, pageSize: HOME_LATEST_COUNT }),
    (result: PagedResult<Article>) => result.total === 0,
  );

  protected englishOnly(article: Article): boolean {
    return this.lang() === 'en' && !availableLangs(article).includes('ar');
  }
}
