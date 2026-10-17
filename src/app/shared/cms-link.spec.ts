import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CmsLink } from './cms-link';

describe('CmsLink', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  function render(url: string, openInNewTab = false): HTMLAnchorElement {
    const fixture = TestBed.createComponent(CmsLink);
    fixture.componentRef.setInput('url', url);
    fixture.componentRef.setInput('label', 'Label');
    fixture.componentRef.setInput('openInNewTab', openInNewTab);
    fixture.detectChanges();
    return (fixture.nativeElement as HTMLElement).querySelector('a')!;
  }

  it('routes internal paths through the router', () => {
    const a = render('/about-us');
    expect(a.getAttribute('href')).toBe('/about-us');
    expect(a.hasAttribute('target')).toBeFalse();
  });

  it('renders external URLs as plain anchors', () => {
    const a = render('https://x.com/example');
    expect(a.getAttribute('href')).toBe('https://x.com/example');
    expect(a.hasAttribute('target')).toBeFalse();
  });

  it('opens in a new tab safely when asked', () => {
    const a = render('https://x.com/example', true);
    expect(a.getAttribute('target')).toBe('_blank');
    expect(a.getAttribute('rel')).toBe('noopener noreferrer');
  });
});
