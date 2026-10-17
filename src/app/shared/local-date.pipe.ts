import { Pipe, PipeTransform } from '@angular/core';
import { Lang } from '../models/lang';

const formatters = new Map<Lang, Intl.DateTimeFormat>();

/**
 * Formats a CMS date for the active language with `Intl` (Arabic digits and month names for `ar`),
 * so no Angular locale data has to be registered. Pass the language to re-render on switch.
 */
@Pipe({ name: 'localDate' })
export class LocalDatePipe implements PipeTransform {
  transform(value: string | null | undefined, lang: Lang): string {
    if (!value) {
      return '';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '';
    }
    let formatter = formatters.get(lang);
    if (!formatter) {
      formatter = new Intl.DateTimeFormat(lang, { year: 'numeric', month: 'long', day: 'numeric' });
      formatters.set(lang, formatter);
    }
    return formatter.format(date);
  }
}
