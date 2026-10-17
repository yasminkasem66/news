import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import settingsSample from '../../../docs/api/samples/E10-site-settings.json';
import { LoadState } from '../models/load-state';
import { SiteSettings } from '../models/site-settings';
import { SiteSettingsService } from '../services/site-settings.service';
import { provideTranslocoTesting } from '../testing/transloco-testing';
import { Footer } from './footer';

describe('Footer', () => {
  const settings = settingsSample.items[0] as unknown as SiteSettings;

  function render(state: LoadState<SiteSettings>) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideTranslocoTesting(),
        { provide: SiteSettingsService, useValue: { settings: signal(state) } },
      ],
    });
    const fixture = TestBed.createComponent(Footer);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('renders about text, link columns, social links and copyright', () => {
    const el = render({ status: 'ok', data: settings });
    expect(el.querySelector('.rich-text')!.textContent).toContain('headless Umbraco showcase');
    expect(el.querySelector('nav h2')!.textContent).toBe('Company');
    expect(el.querySelector('nav a')!.getAttribute('href')).toBe('/about-us');
    const social = Array.from(el.querySelectorAll('app-social-links a'));
    expect(social.map((a) => a.textContent!.trim())).toEqual(['Twitter/X', 'Facebook']);
    expect(social[0].getAttribute('rel')).toBe('noopener noreferrer');
    expect(el.textContent).toContain('(c) News Portal Demo');
  });

  it('leaves out every empty section', () => {
    const empty = structuredClone(settings);
    empty.properties.footerAboutText = null;
    empty.properties.socialLinks = null;
    empty.properties.footerLinkColumns = null;
    empty.properties.copyrightText = null;
    const el = render({ status: 'ok', data: empty });
    expect(el.querySelector('.rich-text')).toBeNull();
    expect(el.querySelector('nav')).toBeNull();
    expect(el.querySelector('app-social-links')).toBeNull();
    expect(el.querySelector('h2')).toBeNull();
    expect(el.querySelector('p')).toBeNull();
  });

  it('renders nothing extra while loading or on error', () => {
    expect(render({ status: 'loading' }).querySelector('footer')!.children.length).toBe(0);
    TestBed.resetTestingModule();
    expect(render({ status: 'error', retry: () => undefined }).querySelector('footer')!.children.length).toBe(0);
  });
});
