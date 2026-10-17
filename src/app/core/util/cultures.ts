import { Lang, LANGS } from '../../models/lang';

/** Maps a Delivery API `cultures` map (`en-US`, `ar`) to the site's languages. */
export function availableLangs(item: { cultures?: Record<string, unknown> } | null | undefined): Lang[] {
  const keys = Object.keys(item?.cultures ?? {}).map((key) => key.toLowerCase());
  return LANGS.filter((lang) => keys.some((key) => key === lang || key.startsWith(`${lang}-`)));
}
