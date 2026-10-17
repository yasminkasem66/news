import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { LucideNewspaper } from '@lucide/angular';

@Component({
  selector: 'app-empty-block',
  imports: [TranslocoPipe, LucideNewspaper],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-300 px-6 py-10 text-center text-slate-600">
      <svg lucideNewspaper class="size-8 text-slate-400" aria-hidden="true"></svg>
      <p>{{ message() | transloco }}</p>
      <ng-content />
    </div>
  `,
})
export class EmptyBlock {
  /** Transloco key of the message to show. */
  readonly message = input('state.empty');
}
