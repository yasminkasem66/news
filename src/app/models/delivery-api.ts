// Shapes returned by the Umbraco Content Delivery API v2.
// Derived from the captured responses in docs/api/samples/.

/** Every list endpoint. `total: 0, items: []` is a valid empty result, not an error. */
export interface PagedResult<T> {
  total: number;
  items: T[];
}

export interface ContentRoute {
  path: string;
  queryString: string | null;
  startItem: { id: string; path: string };
}

export interface ContentItem<TContentType extends string, TProps> {
  id: string;
  contentType: TContentType;
  name: string;
  createDate: string;
  updateDate: string;
  route: ContentRoute;
  properties: TProps;
  /** Cultures the item is published in. Keys seen: `en-US`, `ar`. */
  cultures?: Record<string, ContentRoute>;
}

export interface MediaItem {
  id: string;
  name: string;
  mediaType: string;
  /** Relative (`/media/…`); prefix with `apiBaseUrl` via `mediaUrl()`. */
  url: string;
  extension: string | null;
  width: number | null;
  height: number | null;
  focalPoint: unknown | null;
  crops: unknown[];
  properties: Record<string, unknown>;
}

/** Media pickers always arrive as an array (or null); single pickers use `[0]`. */
export type MediaPicker = MediaItem[] | null;

export interface RichText {
  markup: string;
  blocks: unknown[];
}

export interface BlockContent<T> {
  contentType: string;
  id: string;
  name: string;
  properties: T;
}

export type BlockList<T> = { items: { content: BlockContent<T>; settings: null }[] } | null;
