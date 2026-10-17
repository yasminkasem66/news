import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { LucideLanguages } from '@lucide/angular';
import { LanguageService } from '../core/i18n/language.service';
import { dirOf, Lang, LANGS } from '../models/lang';

/** English / العربية toggle. Each label is written in its own language and direction. */
@Component({
  selector: 'app-language-switcher',
  imports: [TranslocoPipe, LucideLanguages],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div role="group" [attr.aria-label]="'lang.switchTo' | transloco" class="flex items-center gap-1">
      <svg lucideLanguages class="size-4 text-slate-400" aria-hidden="true"></svg>
      @for (l of langs; track l) {
        <button
          type="button"
          [attr.lang]="l"
          [attr.dir]="dir(l)"
          [attr.aria-pressed]="current() === l"
          class="rounded-md px-2.5 py-1 text-sm font-semibold transition"
          [class]="
            current() === l
              ? 'bg-brand-600 text-white'
              : 'text-slate-700 hover:bg-slate-100'
          "
          (click)="select(l)"
        >
          {{ 'lang.' + l | transloco }}
        </button>
      }
    </div>
  `,
})
export class LanguageSwitcher {
  private readonly language = inject(LanguageService);
  protected readonly langs = LANGS;
  protected readonly current = this.language.lang;
  protected readonly dir = dirOf;

  protected select(lang: Lang): void {
    this.language.setLang(lang);
  }
}
