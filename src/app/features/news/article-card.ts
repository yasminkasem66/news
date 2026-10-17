import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { LucideImage } from '@lucide/angular';
import { LanguageService } from '../../core/i18n/language.service';
import { Article } from '../../models/article';
import { LocalDatePipe } from '../../shared/local-date.pipe';
import { MediaUrlPipe } from '../../shared/media-url.pipe';

@Component({
  selector: 'app-article-card',
  imports: [RouterLink, TranslocoPipe, LucideImage, LocalDatePipe, MediaUrlPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block h-full' },
  template: `
    @let a = article();
    <article
      class="group relative flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200 transition hover:shadow-md focus-within:ring-2 focus-within:ring-brand-600"
    >
      <div class="aspect-[16/9] bg-slate-100">
        @if (a.properties.featuredImage | mediaUrl; as src) {
          <img [src]="src" [alt]="a.name" loading="lazy" class="size-full object-cover" />
        } @else {
          <div class="flex size-full items-center justify-center text-slate-300">
            <svg lucideImage class="size-10" aria-hidden="true"></svg>
          </div>
        }
      </div>
      <div class="flex flex-1 flex-col gap-2 p-4">
        <div class="flex flex-wrap items-center gap-2 text-xs font-semibold">
          @if (a.properties.category?.name; as category) {
            <span class="uppercase tracking-wide text-brand-700">{{ category }}</span>
          }
          @if (showEnglishOnlyBadge()) {
            <span class="rounded-full bg-amber-100 px-2 py-0.5 text-amber-800">{{ 'news.englishOnly' | transloco }}</span>
          }
        </div>
        @switch (headingLevel()) {
          @case (2) {
            <h2 class="text-lg font-bold leading-snug text-slate-900">
              <a [routerLink]="['/news', a.id]" class="after:absolute after:inset-0 focus:outline-none">{{ a.name }}</a>
            </h2>
          }
          @default {
            <h3 class="text-lg font-bold leading-snug text-slate-900">
              <a [routerLink]="['/news', a.id]" class="after:absolute after:inset-0 focus:outline-none">{{ a.name }}</a>
            </h3>
          }
        }
        @if (a.properties.summary) {
          <p class="line-clamp-3 text-sm text-slate-600">{{ a.properties.summary }}</p>
        }
        <p class="mt-auto flex flex-wrap gap-x-3 pt-2 text-xs text-slate-500">
          @if (a.properties.publishedDate | localDate: lang(); as date) {
            <time [attr.datetime]="a.properties.publishedDate">{{ date }}</time>
          }
          @if (a.properties.author; as author) {
            <span>{{ 'news.by' | transloco: { author } }}</span>
          }
        </p>
      </div>
    </article>
  `,
})
export class ArticleCard {
  readonly article = input.required<Article>();
  readonly showEnglishOnlyBadge = input(false);
  readonly headingLevel = input<2 | 3>(3);
  protected readonly lang = inject(LanguageService).lang;
}
