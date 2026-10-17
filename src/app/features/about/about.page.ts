import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { Observable } from 'rxjs';
import { loadStateSignal } from '../../core/api/load-state-signal';
import { LanguageService } from '../../core/i18n/language.service';
import { blocks } from '../../core/util/blocks';
import { AboutPage as AboutPageContent } from '../../models/about-page';
import { PageService } from '../../services/page.service';
import { MediaUrlPipe } from '../../shared/media-url.pipe';
import { RichTextView } from '../../shared/rich-text';
import { EmptyBlock } from '../../shared/state/empty-block';
import { ErrorBlock } from '../../shared/state/error-block';
import { LoadingBlock } from '../../shared/state/loading-block';

/** About Us singleton (E11). Empty optional sections are left out (FR-028). */
@Component({
  selector: 'app-about-page',
  imports: [TranslocoPipe, MediaUrlPipe, RichTextView, EmptyBlock, ErrorBlock, LoadingBlock],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let s = about.state();
    @switch (s.status) {
      @case ('loading') {
        <app-loading-block />
      }
      @case ('empty') {
        <h1 class="mb-6 text-3xl font-bold text-slate-900">{{ 'about.title' | transloco }}</h1>
        <app-empty-block message="state.contentUnavailable" />
      }
      @case ('error') {
        @if (s.status === 'error') {
          <h1 class="mb-6 text-3xl font-bold text-slate-900">{{ 'about.title' | transloco }}</h1>
          <app-error-block (retry)="s.retry()" />
        }
      }
      @case ('ok') {
        @if (s.status === 'ok') {
          @let p = s.data.properties;
          <article class="mx-auto max-w-4xl">
            <header class="mb-8">
              <h1 class="text-3xl font-bold text-slate-900 md:text-4xl">{{ s.data.name }}</h1>
              @if (p.heroText) {
                <p class="mt-3 text-xl text-slate-600">{{ p.heroText }}</p>
              }
            </header>
            @if (p.heroImage | mediaUrl; as hero) {
              <img [src]="hero" alt="" class="mb-8 aspect-[21/9] w-full rounded-xl bg-slate-100 object-cover" />
            }
            <app-rich-text [value]="p.body" />
            @if (stats(s.data).length) {
              <section aria-labelledby="stats-heading" class="mt-10">
                <h2 id="stats-heading" class="mb-4 text-xl font-bold text-slate-900">{{ 'about.stats' | transloco }}</h2>
                <dl class="grid grid-cols-2 gap-4 md:grid-cols-4">
                  @for (stat of stats(s.data); track $index) {
                    <div class="flex flex-col-reverse rounded-xl bg-white p-5 text-center shadow-sm ring-1 ring-slate-200">
                      <dt class="text-sm font-semibold text-slate-500">{{ stat.label }}</dt>
                      <dd class="text-3xl font-bold text-brand-700">{{ stat.value }}</dd>
                    </div>
                  }
                </dl>
              </section>
            }
          </article>
        }
      }
    }
  `,
})
export default class AboutPage {
  private readonly pages = inject(PageService);
  private readonly lang = inject(LanguageService).lang;

  // A missing singleton (null) is reported as 'empty', so 'ok' always carries a page.
  protected readonly about = loadStateSignal(
    () => this.lang(),
    () => this.pages.getAbout() as Observable<AboutPageContent>,
    (page: AboutPageContent | null) => page === null,
  );

  protected stats(page: AboutPageContent) {
    return blocks(page.properties.stats);
  }
}
