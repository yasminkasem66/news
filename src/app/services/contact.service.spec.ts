import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import invalidSample from '../../../docs/api/samples/E13-contact-invalid.json';
import validSample from '../../../docs/api/samples/E13-contact-valid.json';
import { environment } from '../../environments/environment';
import { acceptLanguageInterceptor } from '../core/api/accept-language.interceptor';
import { ContactRequest, ContactResult } from '../models/contact';
import { provideTranslocoTesting } from '../testing/transloco-testing';
import { ContactService } from './contact.service';

describe('ContactService', () => {
  const url = `${environment.apiBaseUrl}/api/contact`;
  const request: ContactRequest = {
    name: 'Jane Doe',
    email: 'jane@example.com',
    subject: 'Hello there',
    message: 'This is a test message that is definitely long enough.',
  };
  let service: ContactService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([acceptLanguageInterceptor])),
        provideHttpClientTesting(),
        provideTranslocoTesting(),
      ],
    });
    service = TestBed.inject(ContactService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  function submit(): { result: () => ContactResult | undefined; errored: () => boolean } {
    let result: ContactResult | undefined;
    let errored = false;
    service.submit(request).subscribe({ next: (r) => (result = r), error: () => (errored = true) });
    return { result: () => result, errored: () => errored };
  }

  it('POSTs exactly the JSON body, with no Accept-Language, and maps 201 to success', () => {
    const { result } = submit();
    const req = http.expectOne(url);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    expect(req.request.headers.has('Accept-Language')).toBeFalse();
    req.flush(validSample, { status: 201, statusText: 'Created' });
    expect(result()).toEqual({ kind: 'success', submittedAt: validSample.submittedAt });
  });

  it('maps a 400 with PascalCase keys onto the camelCase fields', () => {
    const { result } = submit();
    http.expectOne(url).flush(invalidSample, { status: 400, statusText: 'Bad Request' });
    const r = result()!;
    expect(r.kind).toBe('validation');
    if (r.kind === 'validation') {
      expect(r.fieldErrors.name).toEqual(invalidSample.errors.Name);
      expect(r.fieldErrors.email).toEqual(invalidSample.errors.Email);
      expect(r.fieldErrors.subject).toEqual(invalidSample.errors.Subject);
      expect(r.fieldErrors.message).toEqual(invalidSample.errors.Message);
      expect(r.otherErrors).toEqual([]);
    }
  });

  it('puts unknown error keys into otherErrors', () => {
    const { result } = submit();
    http
      .expectOne(url)
      .flush({ status: 'validationError', errors: { Foo: ['Bad foo.'], email: ['Bad email.'] } }, { status: 400, statusText: 'Bad Request' });
    expect(result()).toEqual({ kind: 'validation', fieldErrors: { email: ['Bad email.'] }, otherErrors: ['Bad foo.'] });
  });

  it('maps network failures, 500s and unexpected 400 bodies to failure, and never errors', () => {
    for (const respond of [
      (r: ReturnType<HttpTestingController['expectOne']>) => r.error(new ProgressEvent('error')),
      (r: ReturnType<HttpTestingController['expectOne']>) => r.flush('oops', { status: 500, statusText: 'Server Error' }),
      (r: ReturnType<HttpTestingController['expectOne']>) => r.flush({ title: 'Bad' }, { status: 400, statusText: 'Bad Request' }),
    ]) {
      const { result, errored } = submit();
      respond(http.expectOne(url));
      expect(result()).toEqual({ kind: 'failure' });
      expect(errored()).toBeFalse();
    }
  });
});
