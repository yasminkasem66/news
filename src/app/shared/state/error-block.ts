import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { LucideCircleAlert, LucideRefreshCw } from '@lucide/angular';

@Component({
  selector: 'app-error-block',
  imports: [TranslocoPipe, LucideCircleAlert, LucideRefreshCw],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="flex flex-col items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-6 text-center text-red-800"
      [class.py-10]="!compact()"
      [class.py-4]="compact()"
      role="alert"
    >
      <svg lucideCircleAlert class="size-6" aria-hidden="true"></svg>
      <p>{{ message() | transloco }}</p>
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 font-semibold text-red-800 shadow-sm ring-1 ring-red-200 hover:bg-red-100"
        (click)="retry.emit()"
      >
        <svg lucideRefreshCw class="size-4" aria-hidden="true"></svg>
        {{ 'state.retry' | transloco }}
      </button>
    </div>
  `,
})
export class ErrorBlock {
  readonly message = input('state.error');
  readonly compact = input(false);
  readonly retry = output<void>();
}
