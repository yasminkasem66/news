import { BlockList, ContentItem, MediaPicker, RichText } from './delivery-api';

/** Block `statItem`. The value is a string, e.g. `"8+"`. */
export interface StatItem {
  label: string;
  value: string;
}

export interface AboutPageProps {
  heroText: string | null;
  heroImage: MediaPicker;
  body: RichText;
  stats: BlockList<StatItem>;
}

/** Singleton (E11). `name` doubles as the page title. */
export type AboutPage = ContentItem<'aboutUsPage', AboutPageProps>;
