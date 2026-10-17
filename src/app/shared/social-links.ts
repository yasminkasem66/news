import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LucideExternalLink } from '@lucide/angular';
import { SocialLink } from '../models/contact-page';

/** Social profile links (always external, new tab). Renders nothing when empty. */
@Component({
  selector: 'app-social-links',
  imports: [LucideExternalLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (links().length) {
      <ul class="flex flex-wrap gap-2">
        @for (link of links(); track link.url) {
          <li>
            <a
              [href]="link.url"
              target="_blank"
              rel="noopener noreferrer"
              [class]="linkClass()"
            >
              {{ link.platform }}
              <svg lucideExternalLink class="size-3.5" aria-hidden="true"></svg>
            </a>
          </li>
        }
      </ul>
    }
  `,
})
export class SocialLinks {
  readonly links = input<SocialLink[]>([]);
  readonly linkClass = input(
    'inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700 hover:bg-brand-50 hover:text-brand-700',
  );
}
