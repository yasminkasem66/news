import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { LucideX } from '@lucide/angular';
import { loadStateSignal } from '../../core/api/load-state-signal';
import { availableLangs } from '../../core/util/cultures';
import { LanguageService } from '../../core/i18n/language.service';
import { Article } from '../../models/article';
import { Category } from '../../models/category';
import { PagedResult } from '../../models/delivery-api';
import { NewsService } from '../../services/news.service';
import { Pagination } from '../../shared/pagination';
import { EmptyBlock } from '../../shared/state/empty-block';
import { ErrorBlock } from '../../shared/state/error-block';
import { LoadingBlock } from '../../shared/state/loading-block';
import { ArticleCard } from './article-card';
import { CategoryFilter } from './category-filter';
import { FeaturedStrip } from './featured-strip';
import { TagSearch } from './tag-search';

export const NEWS_PAGE_SIZE = 20;

@Component({
  selector: 'app-news-list-page',
  imports: [
    TranslocoPipe,
    LucideX,
    ArticleCard,
    CategoryFilter,
    FeaturedStrip,
    Pagination,
    TagSearch,
    EmptyBlock,
    ErrorBlock,
    LoadingBlock,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1 class="mb-8 text-3xl font-bold text-slate-900">{{ 'news.title' | transloco }}</h1>

    <section class="mb-8 flex flex-col gap-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <app-tag-search [value]="tagFilter()" (search)="searchTag($event)" />
      @let c = categories.state();
      @if (c.status === 'ok') {
        <app-category-filter [categories]="c.data" [selectedId]="categoryFilter()" (selectedChange)="selectCategory($event)" />
      }
      @if (filtersActive()) {
        <div class="flex flex-wrap items-center gap-2">
          @if (tagFilter(); as tag) {
            <button
              type="button"
              class="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700 hover:bg-brand-100"
              [attr.aria-label]="'news.removeTag' | transloco: { tag }"
              (click)="removeTag()"
            >
              #{{ tag }}
              <svg lucideX class="size-3.5" aria-hidden="true"></svg>
            </button>
          }
          <button type="button" class="text-sm font-semibold text-slate-600 underline underline-offset-2 hover:text-slate-900" (click)="clearFilters()">
            {{ 'news.clear' | transloco }}
          </button>
        </div>
      }
    </section>

    @if (!filtersActive()) {
      <app-featured-strip />
    }

    <h2 class="sr-only">{{ 'news.latest' | transloco }}</h2>
    @let s = list.state();
    @switch (s.status) {
      @case ('loading') {
        <app-loading-block />
      }
      @case ('empty') {
        <app-empty-block [message]="filtersActive() ? 'news.noResults' : 'news.noArticlesYet'" />
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
  private readonly route = inject(ActivatedRoute);
  private readonly lang = inject(LanguageService).lang;

  // Query params, bound via withComponentInputBinding. The URL is the source of truth (FR-008).
  readonly page = input<string | undefined>();
  readonly category = input<string | undefined>();
  readonly tag = input<string | undefined>();

  protected readonly pageSize = NEWS_PAGE_SIZE;
  protected readonly pageNumber = computed(() => {
    const n = Number(this.page());
    return Number.isInteger(n) && n >= 1 ? n : 1;
  });
  protected readonly categoryFilter = computed(() => this.category()?.trim() || null);
  protected readonly tagFilter = computed(() => this.tag()?.trim() || null);
  protected readonly filtersActive = computed(() => !!this.categoryFilter() || !!this.tagFilter());

  protected readonly list = loadStateSignal(
    () => ({
      lang: this.lang(),
      page: this.pageNumber(),
      categoryId: this.categoryFilter() ?? undefined,
      tag: this.tagFilter() ?? undefined,
    }),
    ({ page, categoryId, tag }) => this.news.getArticles({ page, pageSize: NEWS_PAGE_SIZE, categoryId, tag }),
    (result: PagedResult<Article>) => result.total === 0,
  );

  /** If categories fail, the filter is simply hidden; the list keeps working (FR-011). */
  protected readonly categories = loadStateSignal(
    () => this.lang(),
    () => this.news.getCategories(),
    (items: Category[]) => items.length === 0,
  );

  protected englishOnly(article: Article): boolean {
    return this.lang() === 'en' && !availableLangs(article).includes('ar');
  }

  protected goToPage(page: number): void {
    this.navigate({ page: page > 1 ? page : null });
  }

  protected selectCategory(id: string | null): void {
    this.navigate({ category: id, page: null });
  }

  protected searchTag(tag: string): void {
    this.navigate({ tag, page: null });
  }

  protected removeTag(): void {
    this.navigate({ tag: null, page: null });
  }

  protected clearFilters(): void {
    void this.router.navigate(['/news']);
  }

  private navigate(queryParams: Record<string, string | number | null>): void {
    void this.router.navigate([], { relativeTo: this.route, queryParams, queryParamsHandling: 'merge' });
  }
}
