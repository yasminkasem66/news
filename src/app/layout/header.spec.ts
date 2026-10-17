import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import settingsSample from '../../../docs/api/samples/E10-site-settings.json';
import { environment } from '../../environments/environment';
import { LoadState } from '../models/load-state';
import { SiteSettings } from '../models/site-settings';
import { SiteSettingsService } from '../services/site-settings.service';
import { provideTranslocoTesting } from '../testing/transloco-testing';
import { Header } from './header';

describe('Header', () => {
  const settings = settingsSample.items[0] as unknown as SiteSettings;

  function render(state: LoadState<SiteSettings>) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideTranslocoTesting(),
        { provide: SiteSettingsService, useValue: { settings: signal(state) } },
      ],
    });
    const fixture = TestBed.createComponent(Header);
    fixture.detectChanges();
    return fixture;
  }

  const navLinks = (el: HTMLElement) =>
    Array.from(el.querySelectorAll('#primary-nav a')).map((a) => [a.textContent!.trim(), a.getAttribute('href')]);

  it('renders the CMS logo and navigation, internal links through the router', () => {
    const el = render({ status: 'ok', data: settings }).nativeElement as HTMLElement;
    expect(el.querySelector('header img')!.getAttribute('src')).toBe(
      `${environment.apiBaseUrl}${settings.properties.logo![0].url}`,
    );
    const links = navLinks(el);
    expect(links.slice(0, 2)).toEqual([
      ['Home', '/'],
      ['About', '/about-us'],
    ]);
  });

  it('adds app sections the CMS navigation does not link to (content gap), without duplicates', () => {
    const el = render({ status: 'ok', data: settings }).nativeElement as HTMLElement;
    expect(navLinks(el).map(([label]) => label)).toEqual(['Home', 'About', 'News', 'Contact']);

    TestBed.resetTestingModule();
    const withContact = structuredClone(settings);
    withContact.properties.primaryNavigation!.items.push({
      content: { contentType: 'link', id: 'c', name: 'n/a', properties: { label: 'Reach us', url: '/contact-us', openInNewTab: false } },
      settings: null,
    });
    const el2 = render({ status: 'ok', data: withContact }).nativeElement as HTMLElement;
    expect(navLinks(el2).map(([label]) => label)).toEqual(['Home', 'About', 'Reach us', 'News']);
  });

  it('falls back to the site name and app sections when settings fail', () => {
    const el = render({ status: 'error', retry: () => undefined }).nativeElement as HTMLElement;
    expect(el.querySelector('header img')).toBeNull();
    expect(el.querySelector('header a')!.textContent).toContain('News Portal');
    expect(navLinks(el).map(([label]) => label)).toEqual(['News', 'Contact']);
    expect(el.querySelector('app-language-switcher')).not.toBeNull();
  });

  it('toggles the mobile menu with aria-expanded and closes on Escape', () => {
    const fixture = render({ status: 'ok', data: settings });
    const el = fixture.nativeElement as HTMLElement;
    const toggle = el.querySelector<HTMLButtonElement>('button[aria-controls="primary-nav"]')!;
    const nav = el.querySelector('#primary-nav')!;
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(nav.classList).toContain('hidden');

    toggle.click();
    fixture.detectChanges();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(nav.classList).not.toContain('hidden');

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  });
});
