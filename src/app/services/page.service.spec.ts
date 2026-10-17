import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import contactSample from '../../../docs/api/samples/E12-contact-info.json';
import { environment } from '../../environments/environment';
import { acceptLanguageInterceptor } from '../core/api/accept-language.interceptor';
import { ContactPage } from '../models/contact-page';
import { provideTranslocoTesting } from '../testing/transloco-testing';
import { PageService } from './page.service';

describe('PageService', () => {
  const delivery = `${environment.apiBaseUrl}/umbraco/delivery/api/v2/content`;
  let service: PageService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([acceptLanguageInterceptor])),
        provideHttpClientTesting(),
        provideTranslocoTesting(),
      ],
    });
    service = TestBed.inject(PageService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  describe('getContactInfo', () => {
    it('returns the singleton (items[0])', () => {
      let result: ContactPage | null | undefined;
      service.getContactInfo().subscribe((r) => (result = r));
      const req = http.expectOne(`${delivery}?filter=contentType:contactUsPage`);
      expect(req.request.headers.get('Accept-Language')).toBe('en-US');
      req.flush(contactSample);
      expect(result!.name).toBe('Contact Us');
      expect(result!.properties.mapCoordinates).toBe('30.0444,31.2357');
    });

    it('returns null when the singleton is missing', () => {
      let result: ContactPage | null | undefined;
      service.getContactInfo().subscribe((r) => (result = r));
      http.expectOne(`${delivery}?filter=contentType:contactUsPage`).flush({ total: 0, items: [] });
      expect(result).toBeNull();
    });
  });
});
