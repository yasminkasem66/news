import { ContentItem, ContentRoute, MediaPicker, RichText } from './delivery-api';
import { Lang } from './lang';

/** The article's category arrives expanded one level; no `expand=` needed (research §5). */
export interface CategoryRef {
  id: string;
  name: string;
  contentType: 'newsCategory';
  route: ContentRoute;
  properties: Record<string, unknown>;
}

export interface ArticleProps {
  urlSlug: string;
  category: CategoryRef | null;
  /** 50–300 characters (backend rule). */
  summary: string;
  body: RichText;
  featuredImage: MediaPicker;
  gallery: MediaPicker;
  /** ISO date without zone; the server sort key (`sort=publishedDate:desc`). */
  publishedDate: string;
  author: string | null;
  /** Exact, case-sensitive filter values. */
  tags: string[] | null;
  isFeatured: boolean;
  featuredOrder: number;
}

export type Article = ContentItem<'newsArticle', ArticleProps>;

/** Detail lookup outcome; the two kinds of 404 are told apart by a retry in English (research §6). */
export type ArticleResult =
  | { kind: 'ok'; article: Article }
  | { kind: 'notFound' }
  | { kind: 'languageGap'; availableIn: Lang[] };

export interface ArticleQuery {
  /** 1-based. */
  page: number;
  pageSize: number;
  categoryId?: string;
  tag?: string;
}
