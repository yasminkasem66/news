import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { LucideArrowRight, LucideLanguages } from '@lucide/angular';
import { of, tap } from 'rxjs';
import { loadStateSignal } from '../../core/api/load-state-signal';
import { availableLangs } from '../../core/util/cultures';
import { LanguageService } from '../../core/i18n/language.service';
import { PageTitleStrategy } from '../../core/i18n/page-title.strategy';
import { Article, ArticleResult } from '../../models/article';
import { Lang } from '../../models/lang';
import { LoadState } from '../../models/load-state';
import { NewsService } from '../../services/news.service';
import { LocalDatePipe } from '../../shared/local-date.pipe';
import { MediaUrlPipe } from '../../shared/media-url.pipe';
import { RichTextView } from '../../shared/rich-text';
import { ErrorBlock } from '../../shared/state/error-block';
import { LoadingBlock } from '../../shared/state/loading-block';
import { NotFoundBlock } from '../../shared/state/not-found-block';
import { ArticleGallery } from './article-gallery';
import { TagList } from './tag-list';

@Component({
  selector: 'app-article-detail-page',
  imports: [
    RouterLink,
    TranslocoPipe,
    LucideArrowRight,
    LucideLanguages,
    LocalDatePipe,
    MediaUrlPipe,
    RichTextView,
    ErrorBlock,
    LoadingBlock,
    NotFoundBlock,
    ArticleGallery,
    TagList,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let s = view();
    @switch (s.status) {
      @case ('loading') {
        <app-loading-block />
      }
      @case ('notFound') {
        <app-not-found-block />
      }
      @case ('languageGap') {
        @if (s.status === 'languageGap') {
          <section class="flex flex-col items-center gap-4 px-6 py-16 text-center" aria-labelledby="gap-heading">
            <svg lucideLanguages class="size-10 text-brand-600" aria-hidden="true"></svg>
            <h1 id="gap-heading" class="text-2xl font-bold text-slate-900">{{ 'article.languageGapTitle' | transloco }}</h1>
            <p class="max-w-prose text-slate-600">{{ 'article.languageGapBody' | transloco }}</p>
            <div class="flex flex-wrap justify-center gap-3">
              @for (l of s.availableIn; track l) {
                <button
                  type="button"
                  class="rounded-lg bg-brand-600 px-5 py-2.5 font-semibold text-white hover:bg-brand-700"
                  (click)="readIn(l)"
                >
                  {{ 'article.readIn.' + l | transloco }}
                </button>
              }
              <a routerLink="/news" class="rounded-lg px-5 py-2.5 font-semibold text-slate-700 ring-1 ring-slate-300 hover:bg-slate-100">
                {{ 'state.notFoundBack' | transloco }}
              </a>
            </div>
          </section>
        }
      }
      @case ('error') {
        @if (s.status === 'error') {
          <app-error-block (retry)="s.retry()" />
        }
      }
      @case ('ok') {
        @if (s.status === 'ok') {
          @let a = s.data;
          <article class="mx-auto max-w-3xl">
            <a routerLink="/news" class="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline">
              <svg lucideArrowRight class="size-4 rotate-180 rtl:rotate-0" aria-hidden="true"></svg>
              {{ 'news.title' | transloco }}
            </a>
            <header class="mb-6">
              @if (a.properties.category?.name; as category) {
                <p class="mb-2 text-sm font-semibold uppercase tracking-wide text-brand-700">{{ category }}</p>
              }
              <h1 class="text-3xl font-bold leading-tight text-slate-900 md:text-4xl">{{ a.name }}</h1>
              <p class="mt-3 flex flex-wrap gap-x-4 text-sm text-slate-500">
                @if (a.properties.publishedDate | localDate: lang(); as date) {
                  <time [attr.datetime]="a.properties.publishedDate">{{ 'news.publishedOn' | transloco: { date } }}</time>
                }
                @if (a.properties.author; as author) {
                  <span>{{ 'news.by' | transloco: { author } }}</span>
                }
              </p>
            </header>
            @if (a.properties.featuredImage | mediaUrl; as src) {
              <img [src]="src" [alt]="a.name" class="mb-8 aspect-[16/9] w-full rounded-xl bg-slate-100 object-cover" />
            }
            <app-rich-text [value]="a.properties.body" />
            @if (a.properties.tags?.length) {
              <div class="mt-8 border-t border-slate-200 pt-6">
                <app-tag-list [tags]="a.properties.tags" />
              </div>
            }
            <app-article-gallery [images]="a.properties.gallery" />
          </article>
        }
      }
    }
  `,
})
export default class ArticleDetailPage {
  private readonly news = inject(NewsService);
  private readonly language = inject(LanguageService);
  private readonly titles = inject(PageTitleStrategy);

  /** Route param `:id` (bound via withComponentInputBinding). */
  readonly id = input.required<string>();

  protected readonly lang = this.language.lang;

  /** Last article shown, kept so a language switch can use its `cultures` (research §6, layer 1). */
  private lastArticle: Article | null = null;

  private readonly result = loadStateSignal(
    () => ({ id: this.id(), lang: this.lang() }),
    ({ id, lang }) => {
      const known = this.lastArticle?.id === id ? this.lastArticle : null;
      const langs = availableLangs(known);
      if (known && langs.length && !langs.includes(lang)) {
        // Known not to exist in this language: no request needed.
        return of<ArticleResult>({ kind: 'languageGap', availableIn: langs });
      }
      return this.news.getArticle(id).pipe(
        tap((result) => (this.lastArticle = result.kind === 'ok' ? result.article : this.lastArticle)),
      );
    },
    () => false,
  );

  protected readonly view = computed((): LoadState<Article> => {
    const state = this.result.state();
    if (state.status !== 'ok') {
      return state;
    }
    return toView(state.data);
  });

  constructor() {
    effect(() => {
      const state = this.view();
      if (state.status === 'ok') {
        this.titles.setRaw(state.data.name);
      } else if (state.status === 'notFound') {
        this.titles.setKey('state.notFound');
      } else if (state.status === 'languageGap') {
        this.titles.setKey('article.languageGapTitle');
      }
    });
  }

  protected readIn(lang: Lang): void {
    this.language.setLang(lang);
  }
}

function toView(result: ArticleResult): LoadState<Article> {
  switch (result.kind) {
    case 'ok':
      return { status: 'ok', data: result.article };
    case 'notFound':
      return { status: 'notFound' };
    case 'languageGap':
      return { status: 'languageGap', availableIn: result.availableIn };
  }
}
