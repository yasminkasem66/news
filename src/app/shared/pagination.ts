import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { LucideChevronLeft, LucideChevronRight } from '@lucide/angular';

@Component({
  selector: 'app-pagination',
  imports: [TranslocoPipe, LucideChevronLeft, LucideChevronRight],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (pages() > 1) {
      <nav [attr.aria-label]="'news.pagination' | transloco" class="mt-8 flex items-center justify-center gap-3">
        <button
          type="button"
          class="inline-flex items-center gap-1 rounded-lg px-3 py-2 font-semibold text-slate-700 ring-1 ring-slate-300 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          [disabled]="page() <= 1"
          (click)="pageChange.emit(page() - 1)"
        >
          <svg lucideChevronLeft class="size-4 rtl:rotate-180" aria-hidden="true"></svg>
          {{ 'news.prev' | transloco }}
        </button>
        <span class="text-sm text-slate-600" aria-current="page">
          {{ 'news.page' | transloco: { page: page(), pages: pages() } }}
        </span>
        <button
          type="button"
          class="inline-flex items-center gap-1 rounded-lg px-3 py-2 font-semibold text-slate-700 ring-1 ring-slate-300 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          [disabled]="page() >= pages()"
          (click)="pageChange.emit(page() + 1)"
        >
          {{ 'news.next' | transloco }}
          <svg lucideChevronRight class="size-4 rtl:rotate-180" aria-hidden="true"></svg>
        </button>
      </nav>
    }
  `,
})
export class Pagination {
  readonly page = input.required<number>();
  readonly pageSize = input.required<number>();
  readonly total = input.required<number>();
  readonly pageChange = output<number>();
  protected readonly pages = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize())));
}
