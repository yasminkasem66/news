import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RichText } from '../models/delivery-api';

/**
 * Renders CMS rich text through Angular's built-in sanitizer.
 * Never bypass it (Constitution IV): captured markup is plain HTML that needs no trust escape.
 */
@Component({
  selector: 'app-rich-text',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (markup(); as html) {
      <div class="rich-text" [innerHTML]="html"></div>
    }
  `,
})
export class RichTextView {
  readonly value = input<RichText | null | undefined>(null);
  protected readonly markup = computed(() => this.value()?.markup?.trim() || null);
}
