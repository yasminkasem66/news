import { ChangeDetectionStrategy, Component, input, linkedSignal, output } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { LucideSearch } from '@lucide/angular';

/**
 * Tag search (E4) — the only search the backend supports (research §4, G2). Tags match exactly and
 * case-sensitively, so the keyword is trimmed but never case-changed.
 */
@Component({
  selector: 'app-tag-search',
  imports: [TranslocoPipe, LucideSearch],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form role="search" class="flex flex-col gap-1" (submit)="submit($event)">
      <label for="tag-search" class="text-sm font-semibold text-slate-700">{{ 'news.searchByTag' | transloco }}</label>
      <div class="flex gap-2">
        <div class="relative flex-1">
          <svg
            lucideSearch
            class="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          ></svg>
          <input
            id="tag-search"
            type="search"
            autocomplete="off"
            aria-describedby="tag-search-hint"
            class="w-full rounded-lg border border-slate-300 bg-white py-2 ps-9 pe-3 text-slate-900 focus:border-brand-600"
            [value]="draft()"
            (input)="draft.set($any($event.target).value)"
          />
        </div>
        <button type="submit" class="rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700">
          {{ 'news.search' | transloco }}
        </button>
      </div>
      <p id="tag-search-hint" class="text-xs text-slate-500">{{ 'news.searchHint' | transloco }}</p>
    </form>
  `,
})
export class TagSearch {
  /** The active tag (from the URL). */
  readonly value = input<string | null>(null);
  readonly search = output<string>();

  protected readonly draft = linkedSignal(() => this.value() ?? '');

  protected submit(event: Event): void {
    event.preventDefault();
    const tag = this.draft().trim();
    if (tag) {
      this.search.emit(tag);
    }
  }
}
