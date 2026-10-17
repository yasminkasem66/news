import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideExternalLink } from '@lucide/angular';
import { isInternalLink } from '../core/util/links';

/** A link whose URL comes from the CMS: router navigation for internal paths, a plain anchor otherwise. */
@Component({
  selector: 'app-cms-link',
  imports: [RouterLink, RouterLinkActive, LucideExternalLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (internal()) {
      <a
        [routerLink]="url()"
        [class]="linkClass()"
        [routerLinkActive]="activeClass()"
        [routerLinkActiveOptions]="{ exact: url() === '/' }"
        ariaCurrentWhenActive="page"
        [attr.target]="openInNewTab() ? '_blank' : null"
        [attr.rel]="openInNewTab() ? 'noopener noreferrer' : null"
        >{{ label() }}</a
      >
    } @else {
      <a
        [href]="url()"
        [class]="linkClass()"
        [attr.target]="openInNewTab() ? '_blank' : null"
        [attr.rel]="openInNewTab() ? 'noopener noreferrer' : null"
        >{{ label() }}
        @if (openInNewTab()) {
          <svg lucideExternalLink class="ms-1 inline size-3.5 align-baseline" aria-hidden="true"></svg>
        }
      </a>
    }
  `,
})
export class CmsLink {
  readonly url = input.required<string>();
  readonly label = input.required<string>();
  readonly openInNewTab = input(false);
  readonly linkClass = input('');
  readonly activeClass = input('');
  protected readonly internal = computed(() => isInternalLink(this.url()));
}
