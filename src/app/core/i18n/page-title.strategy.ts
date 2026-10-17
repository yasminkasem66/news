import { inject, Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { BehaviorSubject, combineLatest, switchMap } from 'rxjs';

type PageTitle = { kind: 'key'; value: string } | { kind: 'raw'; value: string } | null;

/**
 * Route `title`s are Transloco keys. The document title is "{page} · {site name}" and is
 * re-applied when the language changes. Pages with CMS titles (articles) call `setRaw()`.
 */
@Injectable({ providedIn: 'root' })
export class PageTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly transloco = inject(TranslocoService);
  private readonly current = new BehaviorSubject<PageTitle>(null);

  constructor() {
    super();
    combineLatest([
      this.current,
      this.transloco.langChanges$.pipe(switchMap((lang) => this.transloco.selectTranslation(lang))),
    ]).subscribe(([page]) => this.apply(page));
  }

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const key = this.buildTitle(snapshot);
    this.current.next(key ? { kind: 'key', value: key } : null);
  }

  /** Use a CMS-provided title (already in the active language) for the current page. */
  setRaw(text: string): void {
    this.current.next({ kind: 'raw', value: text });
  }

  /** Use a translated label as the current page's title (e.g. a not-found state). */
  setKey(key: string): void {
    this.current.next({ kind: 'key', value: key });
  }

  private apply(page: PageTitle): void {
    const siteName = this.transloco.translate('site.name');
    if (!page) {
      this.title.setTitle(siteName);
      return;
    }
    const pageName = page.kind === 'key' ? this.transloco.translate(page.value) : page.value;
    this.title.setTitle(`${pageName} · ${siteName}`);
  }
}
