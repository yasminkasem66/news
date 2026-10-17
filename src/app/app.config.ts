import {
  ApplicationConfig,
  inject,
  isDevMode,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter, TitleStrategy, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withInterceptors, withXhr } from '@angular/common/http';
import { provideTransloco } from '@jsverse/transloco';

import { routes } from './app.routes';
import { TranslocoHttpLoader } from './transloco-loader';
import { provideAppLucideIcons } from './icons.provider';
import { acceptLanguageInterceptor } from './core/api/accept-language.interceptor';
import { LanguageService } from './core/i18n/language.service';
import { PageTitleStrategy } from './core/i18n/page-title.strategy';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'top' }),
    ),
    provideHttpClient(withXhr(), withInterceptors([acceptLanguageInterceptor])),
    provideTransloco({
      config: {
        availableLangs: ['en', 'ar'],
        defaultLang: 'en',
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
      },
      loader: TranslocoHttpLoader,
    }),
    provideAppLucideIcons,
    // Apply the stored language (html lang/dir + Transloco) before the first render.
    provideAppInitializer(() => {
      inject(LanguageService);
    }),
    { provide: TitleStrategy, useClass: PageTitleStrategy },
  ],
};
