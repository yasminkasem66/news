import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { LucideCircleAlert } from '@lucide/angular';

@Component({
  selector: 'app-not-found-block',
  imports: [RouterLink, TranslocoPipe, LucideCircleAlert],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center gap-4 px-6 py-16 text-center">
      <svg lucideCircleAlert class="size-10 text-slate-400" aria-hidden="true"></svg>
      <h1 class="text-2xl font-bold text-slate-900">{{ titleKey() | transloco }}</h1>
      @if (bodyKey(); as body) {
        <p class="max-w-prose text-slate-600">{{ body | transloco }}</p>
      }
      <a
        [routerLink]="linkTo()"
        class="rounded-lg bg-brand-600 px-5 py-2.5 font-semibold text-white hover:bg-brand-700"
      >
        {{ linkLabelKey() | transloco }}
      </a>
    </div>
  `,
})
export class NotFoundBlock {
  readonly titleKey = input('state.notFound');
  readonly bodyKey = input<string | null>(null);
  readonly linkTo = input('/news');
  readonly linkLabelKey = input('state.notFoundBack');
}
