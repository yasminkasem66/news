import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import featuredSample from '../../../../docs/api/samples/E6-featured.json';
import { Article } from '../../models/article';
import { NewsService } from '../../services/news.service';
import { provideTranslocoTesting } from '../../testing/transloco-testing';
import { FeaturedStrip } from './featured-strip';

describe('FeaturedStrip', () => {
  const featured = featuredSample.items as unknown as Article[];

  function render(getFeatured: () => Observable<Article[]>) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideTranslocoTesting(),
        { provide: NewsService, useValue: { getFeatured: jasmine.createSpy().and.callFake(getFeatured) } },
      ],
    });
    const fixture = TestBed.createComponent(FeaturedStrip);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('renders the featured articles in order under a heading', () => {
    const el = render(() => of(featured));
    expect(el.querySelector('h2')!.textContent).toContain('Featured');
    const titles = Array.from(el.querySelectorAll('h3')).map((h) => h.textContent!.trim());
    expect(titles).toEqual(['City Unveils New Tech Hub', 'Local Team Wins Championship', 'Startup Raises Seed Funding']);
  });

  it('renders nothing at all when nothing is featured', () => {
    const el = render(() => of([]));
    expect(el.querySelector('h2')).toBeNull();
    expect(el.textContent!.trim()).toBe('');
  });

  it('shows a compact retry on error', () => {
    const el = render(() => throwError(() => new Error('network')));
    expect(el.querySelector('[role="alert"]')).not.toBeNull();
    expect(el.querySelector('h2')).toBeNull();
  });
});
