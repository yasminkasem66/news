import { TestBed } from '@angular/core/testing';
import { LanguageService } from '../core/i18n/language.service';
import { provideTranslocoTesting } from '../testing/transloco-testing';
import { LanguageSwitcher } from './language-switcher';

describe('LanguageSwitcher', () => {
  function render() {
    TestBed.configureTestingModule({ providers: [provideTranslocoTesting()] });
    const fixture = TestBed.createComponent(LanguageSwitcher);
    fixture.detectChanges();
    return fixture;
  }

  afterEach(() => TestBed.inject(LanguageService).setLang('en'));

  it('shows each language in its own script and direction, with the current one pressed', () => {
    const el = render().nativeElement as HTMLElement;
    const [en, ar] = Array.from(el.querySelectorAll('button'));
    expect(en.textContent!.trim()).toBe('English');
    expect(ar.textContent!.trim()).toBe('العربية');
    expect(ar.getAttribute('lang')).toBe('ar');
    expect(ar.getAttribute('dir')).toBe('rtl');
    expect(en.getAttribute('aria-pressed')).toBe('true');
    expect(ar.getAttribute('aria-pressed')).toBe('false');
  });

  it('switches the language on click', () => {
    const fixture = render();
    const ar = (fixture.nativeElement as HTMLElement).querySelectorAll('button')[1];
    ar.click();
    fixture.detectChanges();
    expect(TestBed.inject(LanguageService).lang()).toBe('ar');
    expect(document.documentElement.dir).toBe('rtl');
    expect(ar.getAttribute('aria-pressed')).toBe('true');
  });
});
