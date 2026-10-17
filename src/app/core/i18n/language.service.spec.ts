import { TestBed } from '@angular/core/testing';
import { TranslocoService } from '@jsverse/transloco';
import { provideTranslocoTesting } from '../../testing/transloco-testing';
import { LANG_STORAGE_KEY, LanguageService } from './language.service';

describe('LanguageService', () => {
  function create(): LanguageService {
    TestBed.configureTestingModule({ providers: [provideTranslocoTesting()] });
    return TestBed.inject(LanguageService);
  }

  beforeEach(() => {
    try {
      localStorage.removeItem(LANG_STORAGE_KEY);
    } catch {
      // ignore
    }
  });

  afterEach(() => {
    document.documentElement.lang = 'en';
    document.documentElement.dir = 'ltr';
    try {
      localStorage.removeItem(LANG_STORAGE_KEY);
    } catch {
      // ignore
    }
  });

  it('defaults to English with ltr direction', () => {
    const service = create();
    expect(service.lang()).toBe('en');
    expect(document.documentElement.lang).toBe('en');
    expect(document.documentElement.dir).toBe('ltr');
  });

  it('restores Arabic from storage', () => {
    localStorage.setItem(LANG_STORAGE_KEY, 'ar');
    const service = create();
    expect(service.lang()).toBe('ar');
    expect(document.documentElement.dir).toBe('rtl');
  });

  it('ignores an invalid stored value', () => {
    localStorage.setItem(LANG_STORAGE_KEY, 'fr');
    expect(create().lang()).toBe('en');
  });

  it('falls back to English when storage throws', () => {
    spyOn(Storage.prototype, 'getItem').and.throwError('SecurityError');
    spyOn(Storage.prototype, 'setItem').and.throwError('SecurityError');
    const service = create();
    expect(service.lang()).toBe('en');
    expect(() => service.setLang('ar')).not.toThrow();
    expect(service.lang()).toBe('ar');
  });

  it('setLang updates html lang/dir, Transloco and storage', () => {
    const service = create();
    service.setLang('ar');
    expect(document.documentElement.lang).toBe('ar');
    expect(document.documentElement.dir).toBe('rtl');
    expect(TestBed.inject(TranslocoService).getActiveLang()).toBe('ar');
    expect(localStorage.getItem(LANG_STORAGE_KEY)).toBe('ar');
  });
});
