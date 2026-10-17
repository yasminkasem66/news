import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import detailSample from '../../../../docs/api/samples/E7-article-detail.json';
import { LanguageService } from '../../core/i18n/language.service';
import { Article, ArticleResult } from '../../models/article';
import { NewsService } from '../../services/news.service';
import { provideTranslocoTesting } from '../../testing/transloco-testing';
import ArticleDetailPage from './article-detail.page';

describe('ArticleDetailPage', () => {
  const article = detailSample as unknown as Article;
  let getArticle: jasmine.Spy<(id: string) => Observable<ArticleResult>>;

  function render(result: () => Observable<ArticleResult>, id = article.id) {
    getArticle = jasmine.createSpy('getArticle').and.callFake(result);
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideTranslocoTesting(),
        { provide: NewsService, useValue: { getArticle } },
      ],
    });
    const fixture = TestBed.createComponent(ArticleDetailPage);
    fixture.componentRef.setInput('id', id);
    fixture.detectChanges();
    return fixture;
  }

  afterEach(() => TestBed.inject(LanguageService).setLang('en'));

  it('renders the article: title, author, tags, body; no gallery when there is none', () => {
    const el = render(() => of({ kind: 'ok', article })).nativeElement as HTMLElement;
    expect(getArticle).toHaveBeenCalledWith(article.id);
    expect(el.querySelector('h1')!.textContent).toContain('City Unveils New Tech Hub');
    expect(el.textContent).toContain('By Newsroom Staff');
    expect(el.textContent).toContain('Technology');
    const tagLinks = Array.from(el.querySelectorAll('app-tag-list a')).map((a) => a.textContent!.trim());
    expect(tagLinks).toEqual(['demo', 'news']);
    expect(el.querySelector('.rich-text p')).not.toBeNull();
    expect(el.querySelector('#gallery-heading')).toBeNull();
  });

  it('sets the document title from the article name', () => {
    render(() => of({ kind: 'ok', article }));
    TestBed.tick();
    expect(TestBed.inject(Title).getTitle()).toBe('City Unveils New Tech Hub · News Portal');
  });

  it('shows not-found with a link back to the news list', () => {
    const el = render(() => of({ kind: 'notFound' })).nativeElement as HTMLElement;
    expect(el.textContent).toContain("We couldn't find that page.");
    expect(el.querySelector('a[href="/news"]')).not.toBeNull();
    expect(el.textContent).not.toContain('Not available in this language');
  });

  it('shows the language gap with a switch button, distinct from not-found', () => {
    const fixture = render(() => of({ kind: 'languageGap', availableIn: ['en'] }));
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Not available in this language');
    expect(el.textContent).not.toContain("We couldn't find that page.");

    const button = el.querySelector('section button') as HTMLButtonElement;
    expect(button.textContent).toContain('Read in English');
    TestBed.inject(LanguageService).setLang('ar');
    button.click();
    expect(TestBed.inject(LanguageService).lang()).toBe('en');
  });

  it('shows an error with retry', () => {
    const fixture = render(() => throwError(() => new Error('network')));
    const el = fixture.nativeElement as HTMLElement;
    (el.querySelector('[role="alert"] button') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(getArticle).toHaveBeenCalledTimes(2);
  });

  it('renders a gallery when the article has one', () => {
    const image = article.properties.featuredImage![0];
    const withGallery = { ...article, properties: { ...article.properties, gallery: [image, { ...image, id: 'x2' }] } };
    const el = render(() => of({ kind: 'ok', article: withGallery })).nativeElement as HTMLElement;
    expect(el.querySelector('#gallery-heading')).not.toBeNull();
    expect(el.querySelectorAll('app-article-gallery img').length).toBe(2);
  });
});
