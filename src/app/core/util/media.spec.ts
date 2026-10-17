import { environment } from '../../../environments/environment';
import { MediaItem } from '../../models/delivery-api';
import { firstMedia, mediaUrl } from './media';

function media(url: string): MediaItem {
  return {
    id: '1',
    name: 'Photo',
    mediaType: 'Image',
    url,
    extension: 'png',
    width: 1,
    height: 1,
    focalPoint: null,
    crops: [],
    properties: {},
  };
}

describe('media utils', () => {
  it('prefixes relative media URLs with the API base URL', () => {
    expect(mediaUrl(media('/media/x/photo.png'))).toBe(`${environment.apiBaseUrl}/media/x/photo.png`);
  });

  it('leaves absolute URLs unchanged', () => {
    expect(mediaUrl(media('https://cdn.example.com/a.png'))).toBe('https://cdn.example.com/a.png');
  });

  it('returns null for missing media', () => {
    expect(mediaUrl(null)).toBeNull();
    expect(mediaUrl(undefined)).toBeNull();
  });

  it('takes the first item of a picker and handles empty pickers', () => {
    const item = media('/media/a.png');
    expect(firstMedia([item])).toBe(item);
    expect(firstMedia([])).toBeNull();
    expect(firstMedia(null)).toBeNull();
  });
});
