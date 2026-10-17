import { TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';
import aboutSample from '../../../../docs/api/samples/E11-about-en.json';
import { AboutPage as AboutPageContent } from '../../models/about-page';
import { PageService } from '../../services/page.service';
import { provideTranslocoTesting } from '../../testing/transloco-testing';
import AboutPage from './about.page';

describe('AboutPage', () => {
  const about = aboutSample.items[0] as unknown as AboutPageContent;

  function render(getAbout: () => Observable<AboutPageContent | null>) {
    TestBed.configureTestingModule({
      providers: [provideTranslocoTesting(), { provide: PageService, useValue: { getAbout } }],
    });
    const fixture = TestBed.createComponent(AboutPage);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('renders title, hero, body and stats', () => {
    const el = render(() => of(about));
    expect(el.querySelector('h1')!.textContent).toContain('About Us');
    expect(el.textContent).toContain('Who we are');
    expect(el.querySelector('img')).not.toBeNull();
    expect(el.querySelector('.rich-text')!.textContent).toContain('headless Umbraco');
    const stats = Array.from(el.querySelectorAll('dl > div')).map((d) => [
      d.querySelector('dd')!.textContent!.trim(),
      d.querySelector('dt')!.textContent!.trim(),
    ]);
    expect(stats).toEqual([
      ['8+', 'Articles'],
      ['3', 'Categories'],
    ]);
  });

  it('leaves out empty optional sections', () => {
    const bare = { ...about, properties: { ...about.properties, heroText: null, heroImage: null, stats: null } };
    const el = render(() => of(bare));
    expect(el.querySelector('img')).toBeNull();
    expect(el.querySelector('#stats-heading')).toBeNull();
    expect(el.querySelector('header p')).toBeNull();
    expect(el.querySelector('.rich-text')).not.toBeNull();
  });

  it('shows a friendly message when the page is missing', () => {
    const el = render(() => of(null));
    expect(el.textContent).toContain("This content isn't available right now.");
  });

  it('shows an error with retry', () => {
    const el = render(() => throwError(() => new Error('network')));
    expect(el.querySelector('[role="alert"] button')).not.toBeNull();
  });
});
