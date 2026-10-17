import { computed, Signal, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Observable, switchMap } from 'rxjs';
import { LoadState } from '../../models/load-state';
import { toLoadState } from './to-load-state';

export interface LoadStateRef<T> {
  state: Signal<LoadState<T>>;
  reload(): void;
}

/**
 * Runs `load(params())` whenever the params signal changes (e.g. language, route inputs) or
 * `reload()` is called, cancelling the previous request. Must be called in an injection context.
 */
export function loadStateSignal<P, T>(
  params: () => P,
  load: (params: P) => Observable<T>,
  isEmpty: (value: T) => boolean,
): LoadStateRef<T> {
  const attempt = signal(0);
  const reload = () => attempt.update((n) => n + 1);
  const trigger = computed(() => ({ params: params(), attempt: attempt() }));
  const state = toSignal(
    toObservable(trigger).pipe(switchMap(({ params: p }) => load(p).pipe(toLoadState(isEmpty, reload)))),
    { initialValue: { status: 'loading' } as LoadState<T> },
  );
  return { state, reload };
}
