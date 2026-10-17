import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Placeholder footer; US7 fills it from Site Settings. */
@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<footer class="mt-16 border-t border-slate-200 bg-white"></footer>`,
})
export class Footer {}
