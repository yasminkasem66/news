import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import settingsArSample from '../../../docs/api/samples/E10-site-settings-ar.json';
import settingsSample from '../../../docs/api/samples/E10-site-settings.json';
import { environment } from '../../environments/environment';
import { acceptLanguageInterceptor } from '../core/api/accept-language.interceptor';
import { LanguageService } from '../core/i18n/language.service';
import { provideTranslocoTesting } from '../testing/transloco-testing';
import { SiteSettingsService } from './site-settings.service';

describe('SiteSettingsService', () => {
  const url = `${environment.apiBaseUrl}/umbraco/delivery/api/v2/content?filter=contentType:siteSettings`;
  let service: SiteSettingsService;
  let http: HttpTestingController;
  let language: LanguageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([acceptLanguageInterceptor])),
        provideHttpClientTesting(),
        provideTranslocoTesting(),
      ],
    });
    language = TestBed.inject(LanguageService);
    language.setLang('en');
    service = TestBed.inject(SiteSettingsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    language.setLang('en');
  });

  function settle(): void {
    TestBed.tick();
  }

  it('loads items[0] once in the active language and shares it', () => {
    expect(service.settings().status).toBe('loading');
    settle();
    const req = http.expectOne(url);
    expect(req.request.headers.get('Accept-Language')).toBe('en-US');
    req.flush(settingsSample);
    settle();

    const state = service.settings();
    expect(state.status).toBe('ok');
    if (state.status === 'ok') {
      expect(state.data.properties.copyrightText).toBe('(c) News Portal Demo');
    }
    // Reading again (another component) sends nothing new.
    service.settings();
    settle();
    http.expectNone(url);
  });

  it('re-fetches once on language change and reuses the cache when switching back', () => {
    settle();
    http.expectOne(url).flush(settingsSample);
    settle();

    language.setLang('ar');
    settle();
    const ar = http.expectOne(url);
    expect(ar.request.headers.get('Accept-Language')).toBe('ar');
    ar.flush(settingsArSample);
    settle();
    const state = service.settings();
    expect(state.status === 'ok' && state.data.properties.copyrightText).toBeTruthy();

    language.setLang('en');
    settle();
    http.expectNone(url);
    expect(service.settings().status).toBe('ok');
  });

  it('reports a missing singleton as empty', () => {
    settle();
    http.expectOne(url).flush({ total: 0, items: [] });
    settle();
    expect(service.settings().status).toBe('empty');
  });

  it('reports a network error as error, and retry fetches again', () => {
    settle();
    http.expectOne(url).error(new ProgressEvent('error'));
    settle();
    const state = service.settings();
    expect(state.status).toBe('error');
    if (state.status === 'error') {
      state.retry();
    }
    settle();
    http.expectOne(url).flush(settingsSample);
    settle();
    expect(service.settings().status).toBe('ok');
  });
});
