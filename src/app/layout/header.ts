import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { LucideMenu, LucideX } from '@lucide/angular';
import { filter } from 'rxjs';
import { blocks } from '../core/util/blocks';
import { isInternalLink } from '../core/util/links';
import { firstMedia, mediaUrl } from '../core/util/media';
import { SiteSettingsService } from '../services/site-settings.service';
import { CmsLink } from '../shared/cms-link';
import { LanguageSwitcher } from './language-switcher';

interface NavItem {
  url: string;
  /** CMS label (already in the active language)… */
  label?: string;
  /** …or a Transloco key for an app section the CMS navigation doesn't link to. */
  labelKey?: string;
  openInNewTab: boolean;
}

/** App sections that must stay reachable even if the CMS navigation omits them (content gap). */
const APP_SECTIONS: NavItem[] = [
  { url: '/news', labelKey: 'nav.news', openInNewTab: false },
  { url: '/contact', labelKey: 'nav.contact', openInNewTab: false },
];

/** CMS paths that redirect to app routes (research §10). */
const ROUTE_ALIASES: Record<string, string> = { '/about-us': '/about', '/contact-us': '/contact' };

function routeOf(url: string): string {
  const path = url.split(/[?#]/)[0].replace(/\/+$/, '') || '/';
  return ROUTE_ALIASES[path] ?? path;
}

const LINK_CLASS =
  'block rounded-md px-3 py-2 font-semibold text-slate-700 hover:bg-slate-100 hover:text-brand-700 md:inline-block';
const ACTIVE_CLASS = 'text-brand-700';

@Component({
  selector: 'app-header',
  imports: [RouterLink, TranslocoPipe, LucideMenu, LucideX, CmsLink, LanguageSwitcher],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'menuOpen.set(false)' },
  template: `
    <header class="border-b border-slate-200 bg-white">
      <div class="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
        <a routerLink="/" class="flex items-center gap-2 text-lg font-bold text-slate-900">
          @if (logoUrl(); as logo) {
            <!-- The site name is shown next to the logo, so the image is decorative. -->
            <img [src]="logo" alt="" class="h-8 w-auto" />
          }
          {{ 'site.name' | transloco }}
        </a>

        <nav
          id="primary-nav"
          [attr.aria-label]="'nav.primary' | transloco"
          class="order-last w-full md:order-none md:block md:w-auto"
          [class.hidden]="!menuOpen()"
        >
          <ul class="flex flex-col gap-1 pb-2 md:flex-row md:pb-0">
            @for (item of navItems(); track item.url) {
              <li>
                @if (item.label) {
                  <app-cms-link
                    [url]="item.url"
                    [label]="item.label"
                    [openInNewTab]="item.openInNewTab"
                    [linkClass]="linkClass"
                    [activeClass]="activeClass"
                  />
                } @else {
                  <app-cms-link
                    [url]="item.url"
                    [label]="item.labelKey! | transloco"
                    [linkClass]="linkClass"
                    [activeClass]="activeClass"
                  />
                }
              </li>
            }
          </ul>
        </nav>

        <app-language-switcher class="ms-auto" />

        <button
          type="button"
          class="rounded-md p-2 text-slate-700 hover:bg-slate-100 md:hidden"
          aria-controls="primary-nav"
          [attr.aria-expanded]="menuOpen()"
          [attr.aria-label]="(menuOpen() ? 'nav.close' : 'nav.menu') | transloco"
          (click)="menuOpen.set(!menuOpen())"
        >
          @if (menuOpen()) {
            <svg lucideX class="size-6" aria-hidden="true"></svg>
          } @else {
            <svg lucideMenu class="size-6" aria-hidden="true"></svg>
          }
        </button>
      </div>
    </header>
  `,
})
export class Header {
  private readonly settings = inject(SiteSettingsService).settings;

  protected readonly linkClass = LINK_CLASS;
  protected readonly activeClass = ACTIVE_CLASS;
  protected readonly menuOpen = signal(false);

  protected readonly logoUrl = computed(() => {
    const state = this.settings();
    return state.status === 'ok' ? mediaUrl(firstMedia(state.data.properties.logo)) : null;
  });

  /** CMS navigation first, then any app section it doesn't already link to. */
  protected readonly navItems = computed((): NavItem[] => {
    const state = this.settings();
    const cms: NavItem[] =
      state.status === 'ok'
        ? blocks(state.data.properties.primaryNavigation).map((link) => ({
            url: link.url,
            label: link.label,
            openInNewTab: link.openInNewTab,
          }))
        : [];
    const linked = new Set(cms.filter((item) => isInternalLink(item.url)).map((item) => routeOf(item.url)));
    return [...cms, ...APP_SECTIONS.filter((section) => !linked.has(section.url))];
  });

  constructor() {
    inject(Router)
      .events.pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(inject(DestroyRef)),
      )
      .subscribe(() => this.menuOpen.set(false));
  }
}
