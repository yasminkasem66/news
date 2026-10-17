import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

/** Placeholder header; US3 adds the language switcher and US7 the CMS logo and navigation. */
@Component({
  selector: 'app-header',
  imports: [RouterLink, TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="border-b border-slate-200 bg-white">
      <div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <a routerLink="/" class="text-lg font-bold text-slate-900">{{ 'site.name' | transloco }}</a>
      </div>
    </header>
  `,
})
export class Header {}
