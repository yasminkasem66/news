import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { Category } from '../../models/category';

/** "All" plus one toggle per category, in editor order. Wraps instead of scrolling on small screens. */
@Component({
  selector: 'app-category-filter',
  imports: [TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div role="group" [attr.aria-label]="'news.categories' | transloco" class="flex flex-wrap gap-2">
      <button
        type="button"
        [attr.aria-pressed]="!selectedId()"
        [class]="chipClass(!selectedId())"
        (click)="selectedChange.emit(null)"
      >
        {{ 'news.allCategories' | transloco }}
      </button>
      @for (category of categories(); track category.id) {
        <button
          type="button"
          [attr.aria-pressed]="selectedId() === category.id"
          [class]="chipClass(selectedId() === category.id)"
          (click)="selectedChange.emit(category.id)"
        >
          @if (category.properties.colour; as colour) {
            <span class="size-2.5 rounded-full" [style.background-color]="colour" aria-hidden="true"></span>
          }
          {{ category.name }}
        </button>
      }
    </div>
  `,
})
export class CategoryFilter {
  readonly categories = input.required<Category[]>();
  readonly selectedId = input<string | null>(null);
  readonly selectedChange = output<string | null>();

  protected chipClass(active: boolean): string {
    const base = 'inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold transition';
    return active
      ? `${base} bg-brand-600 text-white`
      : `${base} bg-white text-slate-700 ring-1 ring-slate-300 hover:bg-slate-100`;
  }
}
