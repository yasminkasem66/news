import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { ApiService } from './api.service';

describe('ApiService', () => {
  const delivery = `${environment.apiBaseUrl}/umbraco/delivery/api/v2/content`;
  let api: ApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(ApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('builds repeated filter params in order, then sort, skip and take', () => {
    api
      .getContent({
        filters: ['contentType:newsArticle', 'tags:demo'],
        sort: 'publishedDate:desc',
        skip: 0,
        take: 20,
      })
      .subscribe();

    const req = http.expectOne(
      `${delivery}?filter=contentType:newsArticle&filter=tags:demo&sort=publishedDate:desc&skip=0&take=20`,
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.urlWithParams).not.toContain('culture=');
    req.flush({ total: 0, items: [] });
  });

  it('omits optional params that are not set', () => {
    api.getContent({ filters: ['contentType:siteSettings'] }).subscribe();
    const req = http.expectOne(`${delivery}?filter=contentType:siteSettings`);
    expect(req.request.params.keys()).toEqual(['filter']);
    req.flush({ total: 0, items: [] });
  });

  it('requests a single item by id', () => {
    api.getItem('5b8e0d5f-b1a4-4518-816d-371f1300bbf9').subscribe();
    const req = http.expectOne(`${delivery}/item/5b8e0d5f-b1a4-4518-816d-371f1300bbf9`);
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('posts JSON to a path under the API base URL and exposes the full response', () => {
    let status = 0;
    api.post('/api/contact', { name: 'Jane' }).subscribe((res) => (status = res.status));

    const req = http.expectOne(`${environment.apiBaseUrl}/api/contact`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ name: 'Jane' });
    req.flush({ status: 'success' }, { status: 201, statusText: 'Created' });
    expect(status).toBe(201);
  });
});
