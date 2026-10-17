import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { LucideTag } from '@lucide/angular';

/** Article tags, each linking back to the list filtered by that tag (FR-016). */
@Component({
  selector: 'app-tag-list',
  imports: [RouterLink, TranslocoPipe, LucideTag],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (tags()?.length) {
      <div class="flex flex-wrap items-center gap-2">
        <span class="sr-only">{{ 'news.tags' | transloco }}</span>
        <svg lucideTag class="size-4 text-slate-400" aria-hidden="true"></svg>
        <ul class="flex flex-wrap gap-2">
          @for (tag of tags(); track tag) {
            <li>
              <a
                routerLink="/news"
                [queryParams]="{ tag }"
                class="inline-block rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700 hover:bg-brand-50 hover:text-brand-700"
                >{{ tag }}</a
              >
            </li>
          }
        </ul>
      </div>
    }
  `,
})
export class TagList {
  readonly tags = input<string[] | null | undefined>(null);
}
