import { EnvironmentProviders, importProvidersFrom } from '@angular/core';
import { TranslocoTestingModule, TranslocoTestingOptions } from '@jsverse/transloco';
import en from '../../../public/i18n/en.json';
import ar from '../../../public/i18n/ar.json';

/** Real en/ar label files, preloaded, so specs can assert on translated text. */
export function provideTranslocoTesting(options: TranslocoTestingOptions = {}): EnvironmentProviders {
  return importProvidersFrom(
    TranslocoTestingModule.forRoot({
      langs: { en, ar },
      translocoConfig: { availableLangs: ['en', 'ar'], defaultLang: 'en' },
      preloadLangs: true,
      ...options,
    }),
  );
}
