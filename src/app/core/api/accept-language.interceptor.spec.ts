import { HttpClient, HttpContext, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { provideTranslocoTesting } from '../../testing/transloco-testing';
import { LanguageService } from '../i18n/language.service';
import { acceptLanguageInterceptor, LANGUAGE_OVERRIDE } from './accept-language.interceptor';

describe('acceptLanguageInterceptor', () => {
  const deliveryUrl = `${environment.apiBaseUrl}/umbraco/delivery/api/v2/content`;
  let http: HttpClient;
  let controller: HttpTestingController;
  let language: LanguageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([acceptLanguageInterceptor])),
        provideHttpClientTesting(),
        provideTranslocoTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
    language = TestBed.inject(LanguageService);
    language.setLang('en');
  });

  afterEach(() => {
    controller.verify();
    language.setLang('en');
  });

  it('sends the backend culture for the active language (en-US, not en)', () => {
    http.get(deliveryUrl).subscribe();
    expect(controller.expectOne(deliveryUrl).request.headers.get('Accept-Language')).toBe('en-US');

    language.setLang('ar');
    http.get(deliveryUrl).subscribe();
    expect(controller.expectOne(deliveryUrl).request.headers.get('Accept-Language')).toBe('ar');
  });

  it('uses LANGUAGE_OVERRIDE instead of the active language when set', () => {
    language.setLang('ar');
    http.get(deliveryUrl, { context: new HttpContext().set(LANGUAGE_OVERRIDE, 'en') }).subscribe();
    expect(controller.expectOne(deliveryUrl).request.headers.get('Accept-Language')).toBe('en-US');
  });

  it('never adds the header to the contact endpoint', () => {
    const contactUrl = `${environment.apiBaseUrl}/api/contact`;
    http.post(contactUrl, {}).subscribe();
    expect(controller.expectOne(contactUrl).request.headers.has('Accept-Language')).toBeFalse();
  });
});
