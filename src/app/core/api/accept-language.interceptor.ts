import { HttpContextToken, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { LanguageService } from '../i18n/language.service';

/**
 * Set on a request to send it with no language qualifier: the backend's documented way to tell
 * "exists but not translated" from "doesn't exist" after a 404 (docs/api/05-api-reference.md).
 */
export const SKIP_LANGUAGE = new HttpContextToken<boolean>(() => false);

const deliveryPrefix = `${environment.apiBaseUrl}/umbraco/delivery/`;

export const acceptLanguageInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(deliveryPrefix) || req.context.get(SKIP_LANGUAGE)) {
    return next(req);
  }
  const lang = inject(LanguageService).lang();
  return next(req.clone({ setHeaders: { 'Accept-Language': lang } }));
};
