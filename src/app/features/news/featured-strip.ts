import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { LucideStar } from '@lucide/angular';
import { loadStateSignal } from '../../core/api/load-state-signal';
import { availableLangs } from '../../core/util/cultures';
import { LanguageService } from '../../core/i18n/language.service';
import { Article } from '../../models/article';
import { NewsService } from '../../services/news.service';
import { ErrorBlock } from '../../shared/state/error-block';
import { ArticleCard } from './article-card';

/**
 * Featured articles in editor order (E6). Hidden entirely when nothing is featured — never
 * backfilled (FR-010) — and fails independently of the surrounding page (FR-011).
 */
@Component({
  selector: 'app-featured-strip',
  imports: [TranslocoPipe, LucideStar, ArticleCard, ErrorBlock],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let s = featured.state();
    @switch (s.status) {
      @case ('ok') {
        @if (s.status === 'ok') {
          <section aria-labelledby="featured-heading" class="mb-10">
            <h2 id="featured-heading" class="mb-4 flex items-center gap-2 text-xl font-bold text-slate-900">
              <svg lucideStar class="size-5 text-amber-500" aria-hidden="true"></svg>
              {{ 'news.featured' | transloco }}
            </h2>
            <ul class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              @for (article of s.data; track article.id) {
                <li>
                  <app-article-card [article]="article" [showEnglishOnlyBadge]="englishOnly(article)" />
                </li>
              }
            </ul>
          </section>
        }
      }
      @case ('error') {
        @if (s.status === 'error') {
          <div class="mb-10">
            <app-error-block [compact]="true" (retry)="s.retry()" />
          </div>
        }
      }
    }
  `,
})
export class FeaturedStrip {
  private readonly news = inject(NewsService);
  private readonly lang = inject(LanguageService).lang;

  protected readonly featured = loadStateSignal(
    () => this.lang(),
    () => this.news.getFeatured(),
    (items: Article[]) => items.length === 0,
  );

  protected englishOnly(article: Article): boolean {
    return this.lang() === 'en' && !availableLangs(article).includes('ar');
  }
}
