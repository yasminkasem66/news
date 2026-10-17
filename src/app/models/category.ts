import { ContentItem, MediaPicker } from './delivery-api';

export interface CategoryProps {
  /** Optional accent, e.g. `#2563eb`. */
  colour: string | null;
  /** `null` in the seed; unused in v1. */
  icon: MediaPicker | string | null;
}

/** Response order is the editors' sort order — display it unchanged. */
export type Category = ContentItem<'newsCategory', CategoryProps>;
