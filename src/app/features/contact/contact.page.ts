import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { TranslocoPipe } from '@jsverse/transloco';
import { LucideClock, LucideExternalLink, LucideMail, LucideMapPin, LucidePhone } from '@lucide/angular';
import { loadStateSignal } from '../../core/api/load-state-signal';
import { LanguageService } from '../../core/i18n/language.service';
import { blocks } from '../../core/util/blocks';
import { osmLink, parseCoordinates } from '../../core/util/coordinates';
import { ContactPage as ContactPageContent } from '../../models/contact-page';
import { PageService } from '../../services/page.service';
import { SocialLinks } from '../../shared/social-links';
import { EmptyBlock } from '../../shared/state/empty-block';
import { ErrorBlock } from '../../shared/state/error-block';
import { LoadingBlock } from '../../shared/state/loading-block';
import { ContactForm } from './contact-form';

@Component({
  selector: 'app-contact-page',
  imports: [
    TranslocoPipe,
    LucideClock,
    LucideExternalLink,
    LucideMail,
    LucideMapPin,
    LucidePhone,
    SocialLinks,
    EmptyBlock,
    ErrorBlock,
    LoadingBlock,
    ContactForm,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let s = info.state();
    <h1 class="mb-2 text-3xl font-bold text-slate-900">
      {{ s.status === 'ok' ? s.data.name : ('contact.title' | transloco) }}
    </h1>

    <div class="mt-6 grid gap-8 lg:grid-cols-5">
      <!-- Contact details load independently of the form. -->
      <section class="lg:col-span-2" [attr.aria-label]="'contact.details' | transloco">
        @switch (s.status) {
          @case ('loading') {
            <app-loading-block />
          }
          @case ('empty') {
            <app-empty-block message="state.contentUnavailable" />
          }
          @case ('error') {
            @if (s.status === 'error') {
              <app-error-block [compact]="true" (retry)="s.retry()" />
            }
          }
          @case ('ok') {
            @if (s.status === 'ok') {
              @let p = s.data.properties;
              @if (p.intro) {
                <p class="mb-6 text-lg text-slate-600">{{ p.intro }}</p>
              }
              <dl class="flex flex-col gap-4">
                @if (p.address) {
                  <div class="flex gap-3">
                    <svg lucideMapPin class="mt-0.5 size-5 shrink-0 text-brand-600" aria-hidden="true"></svg>
                    <div>
                      <dt class="text-sm font-semibold text-slate-500">{{ 'contact.address' | transloco }}</dt>
                      <dd class="text-slate-900">{{ p.address }}</dd>
                    </div>
                  </div>
                }
                @if (p.phone) {
                  <div class="flex gap-3">
                    <svg lucidePhone class="mt-0.5 size-5 shrink-0 text-brand-600" aria-hidden="true"></svg>
                    <div>
                      <dt class="text-sm font-semibold text-slate-500">{{ 'contact.phone' | transloco }}</dt>
                      <dd><a [href]="'tel:' + telHref(p.phone)" dir="ltr" class="text-brand-700 hover:underline">{{ p.phone }}</a></dd>
                    </div>
                  </div>
                }
                @if (p.email) {
                  <div class="flex gap-3">
                    <svg lucideMail class="mt-0.5 size-5 shrink-0 text-brand-600" aria-hidden="true"></svg>
                    <div>
                      <dt class="text-sm font-semibold text-slate-500">{{ 'contact.email' | transloco }}</dt>
                      <dd><a [href]="'mailto:' + p.email" class="break-all text-brand-700 hover:underline">{{ p.email }}</a></dd>
                    </div>
                  </div>
                }
                @if (p.officeHours) {
                  <div class="flex gap-3">
                    <svg lucideClock class="mt-0.5 size-5 shrink-0 text-brand-600" aria-hidden="true"></svg>
                    <div>
                      <dt class="text-sm font-semibold text-slate-500">{{ 'contact.hours' | transloco }}</dt>
                      <dd class="text-slate-900">{{ p.officeHours }}</dd>
                    </div>
                  </div>
                }
                @if (mapLink(s.data); as map) {
                  <div class="flex gap-3">
                    <svg lucideMapPin class="mt-0.5 size-5 shrink-0 text-brand-600" aria-hidden="true"></svg>
                    <div>
                      <dt class="text-sm font-semibold text-slate-500">{{ 'contact.map' | transloco }}</dt>
                      <dd>
                        <a [href]="map" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 text-brand-700 hover:underline">
                          {{ 'contact.openMap' | transloco }}
                          <svg lucideExternalLink class="size-3.5" aria-hidden="true"></svg>
                        </a>
                      </dd>
                    </div>
                  </div>
                }
              </dl>
              @if (social(s.data).length) {
                <h2 class="mt-8 mb-3 text-sm font-semibold text-slate-500">{{ 'contact.social' | transloco }}</h2>
                <app-social-links [links]="social(s.data)" />
              }
            }
          }
        }
      </section>

      <section class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 lg:col-span-3">
        <app-contact-form />
      </section>
    </div>
  `,
})
export default class ContactPage {
  private readonly pages = inject(PageService);
  private readonly lang = inject(LanguageService).lang;

  // A missing singleton (null) is reported as 'empty', so 'ok' always carries a page.
  protected readonly info = loadStateSignal(
    () => this.lang(),
    () => this.pages.getContactInfo() as Observable<ContactPageContent>,
    (page: ContactPageContent | null) => page === null,
  );

  protected mapLink(page: ContactPageContent): string | null {
    const coordinates = parseCoordinates(page.properties.mapCoordinates);
    return coordinates ? osmLink(coordinates) : null;
  }

  protected social(page: ContactPageContent) {
    return blocks(page.properties.socialLinks);
  }

  protected telHref(phone: string): string {
    return phone.replace(/[^\d+]/g, '');
  }
}
