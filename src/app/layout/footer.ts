import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { blocks } from '../core/util/blocks';
import { SiteSettingsService } from '../services/site-settings.service';
import { CmsLink } from '../shared/cms-link';
import { RichTextView } from '../shared/rich-text';
import { SocialLinks } from '../shared/social-links';

/** Footer driven by Site Settings (E10). Every empty section is left out entirely (FR-023). */
@Component({
  selector: 'app-footer',
  imports: [TranslocoPipe, CmsLink, RichTextView, SocialLinks],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="mt-16 border-t border-slate-200 bg-white">
      @if (content(); as c) {
        <div class="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
          @if (c.about) {
            <div class="text-sm sm:col-span-2">
              <app-rich-text [value]="c.about" />
            </div>
          }
          @for (column of c.columns; track $index) {
            <nav [attr.aria-label]="column.title">
              <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">{{ column.title }}</h2>
              <ul class="flex flex-col gap-2">
                @for (link of column.links; track link.url) {
                  <li>
                    <app-cms-link
                      [url]="link.url"
                      [label]="link.label"
                      [openInNewTab]="link.openInNewTab"
                      linkClass="text-slate-700 hover:text-brand-700 hover:underline"
                    />
                  </li>
                }
              </ul>
            </nav>
          }
          @if (c.social.length) {
            <div>
              <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">{{ 'footer.follow' | transloco }}</h2>
              <app-social-links [links]="c.social" />
            </div>
          }
        </div>
        @if (c.copyright) {
          <p class="border-t border-slate-100 px-4 py-4 text-center text-sm text-slate-500">{{ c.copyright }}</p>
        }
      }
    </footer>
  `,
})
export class Footer {
  private readonly settings = inject(SiteSettingsService).settings;

  protected readonly content = computed(() => {
    const state = this.settings();
    if (state.status !== 'ok') {
      return null;
    }
    const p = state.data.properties;
    return {
      about: p.footerAboutText?.markup?.trim() ? p.footerAboutText : null,
      columns: blocks(p.footerLinkColumns)
        .map((column) => ({ title: column.columnTitle, links: blocks(column.links) }))
        .filter((column) => column.links.length > 0),
      social: blocks(p.socialLinks),
      copyright: p.copyrightText?.trim() || null,
    };
  });
}
