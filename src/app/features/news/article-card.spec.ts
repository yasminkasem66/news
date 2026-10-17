import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import articlesSample from '../../../../docs/api/samples/E1-articles.json';
import { environment } from '../../../environments/environment';
import { Article } from '../../models/article';
import { provideTranslocoTesting } from '../../testing/transloco-testing';
import { ArticleCard } from './article-card';

describe('ArticleCard', () => {
  const article = articlesSample.items[0] as unknown as Article;

  function render(value: Article, extra: Record<string, unknown> = {}) {
    TestBed.configureTestingModule({ providers: [provideRouter([]), provideTranslocoTesting()] });
    const fixture = TestBed.createComponent(ArticleCard);
    fixture.componentRef.setInput('article', value);
    for (const [key, v] of Object.entries(extra)) {
      fixture.componentRef.setInput(key, v);
    }
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('renders image, title link, category, summary, date and author', () => {
    const el = render(article);
    const img = el.querySelector('img')!;
    expect(img.getAttribute('src')).toBe(`${environment.apiBaseUrl}${article.properties.featuredImage![0].url}`);
    expect(img.getAttribute('alt')).toBe('City Unveils New Tech Hub');
    expect(el.querySelector('h3 a')!.getAttribute('href')).toBe(`/news/${article.id}`);
    expect(el.textContent).toContain('Technology');
    expect(el.textContent).toContain(article.properties.summary);
    expect(el.querySelector('time')!.getAttribute('datetime')).toBe(article.properties.publishedDate);
    expect(el.textContent).toContain('By Newsroom Staff');
  });

  it('leaves out the author and shows a placeholder when there is no image', () => {
    const el = render({
      ...article,
      properties: { ...article.properties, author: null, featuredImage: null },
    });
    expect(el.textContent).not.toContain('By ');
    expect(el.querySelector('img')).toBeNull();
  });

  it('shows the English-only badge only when asked', () => {
    expect(render(article).textContent).not.toContain('English only');
    TestBed.resetTestingModule();
    expect(render(article, { showEnglishOnlyBadge: true }).textContent).toContain('English only');
  });
});
