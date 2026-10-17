import { HttpContextToken, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { LanguageService } from '../i18n/language.service';
import { Lang } from '../../models/lang';

/**
 * Backend culture names. English is `en-US`: `Accept-Language: en` matches nothing (research M6).
 * The header is always sent explicitly — if omitted, the browser sends its own default.
 */
export const CULTURE: Record<Lang, string> = { en: 'en-US', ar: 'ar' };

/**
 * Forces a request to a specific language instead of the active one. Used by the language-gap
 * retry, which must ask for the default (English) culture regardless of the browser's language.
 */
export const LANGUAGE_OVERRIDE = new HttpContextToken<Lang | null>(() => null);

const deliveryPrefix = `${environment.apiBaseUrl}/umbraco/delivery/`;

export const acceptLanguageInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(deliveryPrefix)) {
    return next(req);
  }
  const lang = req.context.get(LANGUAGE_OVERRIDE) ?? inject(LanguageService).lang();
  return next(req.clone({ setHeaders: { 'Accept-Language': CULTURE[lang] } }));
};
