import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { MediaPicker } from '../../models/delivery-api';
import { MediaUrlPipe } from '../../shared/media-url.pipe';

@Component({
  selector: 'app-article-gallery',
  imports: [TranslocoPipe, MediaUrlPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (images()?.length) {
      <section aria-labelledby="gallery-heading" class="mt-10">
        <h2 id="gallery-heading" class="mb-4 text-xl font-bold text-slate-900">{{ 'news.gallery' | transloco }}</h2>
        <ul class="grid grid-cols-2 gap-4 md:grid-cols-3">
          @for (image of images(); track image.id) {
            @if (image | mediaUrl; as src) {
              <li>
                <img [src]="src" [alt]="image.name" loading="lazy" class="aspect-square w-full rounded-lg object-cover" />
              </li>
            }
          }
        </ul>
      </section>
    }
  `,
})
export class ArticleGallery {
  readonly images = input<MediaPicker | undefined>(null);
}
