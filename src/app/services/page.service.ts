import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiService } from '../core/api/api.service';
import { AboutPage } from '../models/about-page';
import { ContactPage } from '../models/contact-page';
import { PagedResult } from '../models/delivery-api';

/** Singleton pages: take `items[0]`, or null when the page is missing. */
@Injectable({ providedIn: 'root' })
export class PageService {
  private readonly api = inject(ApiService);

  /** E11. */
  getAbout(): Observable<AboutPage | null> {
    return this.singleton<AboutPage>('aboutUsPage');
  }

  /** E12. */
  getContactInfo(): Observable<ContactPage | null> {
    return this.singleton<ContactPage>('contactUsPage');
  }

  private singleton<T>(contentType: string): Observable<T | null> {
    return this.api
      .getContent<PagedResult<T>>({ filters: [`contentType:${contentType}`] })
      .pipe(map(({ items }) => items[0] ?? null));
  }
}
