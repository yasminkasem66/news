export type Lang = 'en' | 'ar';

export const LANGS: readonly Lang[] = ['en', 'ar'];

export const DEFAULT_LANG: Lang = 'en';

export function isLang(value: unknown): value is Lang {
  return value === 'en' || value === 'ar';
}

export function dirOf(lang: Lang): 'ltr' | 'rtl' {
  return lang === 'ar' ? 'rtl' : 'ltr';
}

export function otherLang(lang: Lang): Lang {
  return lang === 'ar' ? 'en' : 'ar';
}
