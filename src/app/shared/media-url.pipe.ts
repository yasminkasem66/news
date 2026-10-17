import { Pipe, PipeTransform } from '@angular/core';
import { firstMedia, mediaUrl } from '../core/util/media';
import { MediaItem, MediaPicker } from '../models/delivery-api';

/** Absolute URL for a media picker (first item) or a single media item; null when absent. */
@Pipe({ name: 'mediaUrl' })
export class MediaUrlPipe implements PipeTransform {
  transform(value: MediaPicker | MediaItem | null | undefined): string | null {
    return mediaUrl(Array.isArray(value) ? firstMedia(value) : value);
  }
}
