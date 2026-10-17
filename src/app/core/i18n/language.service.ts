import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { DEFAULT_LANG, dirOf, isLang, Lang } from '../../models/lang';

export const LANG_STORAGE_KEY = 'news.lang';

/** Holds the active language, persists it, and keeps `<html lang dir>` and Transloco in sync. */
@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly transloco = inject(TranslocoService);

  private readonly current = signal<Lang>(this.readStoredLang());
  readonly lang = this.current.asReadonly();

  constructor() {
    this.apply(this.current());
  }

  setLang(lang: Lang): void {
    if (lang === this.current()) {
      return;
    }
    this.current.set(lang);
    this.writeStoredLang(lang);
    this.apply(lang);
  }

  private apply(lang: Lang): void {
    const html = this.document.documentElement;
    html.lang = lang;
    html.dir = dirOf(lang);
    this.transloco.setActiveLang(lang);
  }

  private readStoredLang(): Lang {
    if (!this.isBrowser) {
      return DEFAULT_LANG;
    }
    try {
      const stored = localStorage.getItem(LANG_STORAGE_KEY);
      return isLang(stored) ? stored : DEFAULT_LANG;
    } catch {
      return DEFAULT_LANG;
    }
  }

  private writeStoredLang(lang: Lang): void {
    if (!this.isBrowser) {
      return;
    }
    try {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {
      // Storage blocked (private mode, disabled site data): the choice lasts for this visit only.
    }
  }
}
