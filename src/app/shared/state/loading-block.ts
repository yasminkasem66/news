import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { LucideLoaderCircle } from '@lucide/angular';

@Component({
  selector: 'app-loading-block',
  imports: [TranslocoPipe, LucideLoaderCircle],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center justify-center gap-2 py-10 text-slate-500" role="status" aria-live="polite">
      <svg lucideLoaderCircle class="size-5 animate-spin" aria-hidden="true"></svg>
      <span>{{ 'state.loading' | transloco }}</span>
    </div>
  `,
})
export class LoadingBlock {}
