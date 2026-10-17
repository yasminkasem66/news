import { environment } from '../../../environments/environment';
import { MediaItem, MediaPicker } from '../../models/delivery-api';

export function firstMedia(picker: MediaPicker | undefined): MediaItem | null {
  return picker?.[0] ?? null;
}

/** Media URLs from the API are relative (`/media/…`); serve them from the backend origin. */
export function mediaUrl(item: MediaItem | null | undefined): string | null {
  if (!item?.url) {
    return null;
  }
  if (/^(https?:)?\/\//i.test(item.url)) {
    return item.url;
  }
  const path = item.url.startsWith('/') ? item.url : `/${item.url}`;
  return `${environment.apiBaseUrl}${path}`;
}
