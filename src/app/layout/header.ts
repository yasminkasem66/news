import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { LanguageSwitcher } from './language-switcher';

/** Placeholder header with the language switcher; US7 adds the CMS logo and navigation. */
@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, TranslocoPipe, LanguageSwitcher],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="border-b border-slate-200 bg-white">
      <div class="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-3">
        <a routerLink="/" class="text-lg font-bold text-slate-900">{{ 'site.name' | transloco }}</a>
        <!-- Temporary until US7 renders the CMS primaryNavigation. -->
        <nav [attr.aria-label]="'nav.primary' | transloco">
          <a
            routerLink="/news"
            routerLinkActive="text-brand-700"
            ariaCurrentWhenActive="page"
            class="font-semibold text-slate-700 hover:text-brand-700"
            >{{ 'nav.news' | transloco }}</a
          >
        </nav>
        <app-language-switcher class="ms-auto" />
      </div>
    </header>
  `,
})
export class Header {}
