import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { LoadState } from '../../models/load-state';
import { toLoadState } from './to-load-state';

describe('toLoadState', () => {
  const isEmpty = (items: number[]) => items.length === 0;

  function collect<T>(source: import('rxjs').Observable<LoadState<T>>): LoadState<T>[] {
    const states: LoadState<T>[] = [];
    source.subscribe((state) => states.push(state));
    return states;
  }

  it('emits loading, then ok', () => {
    const states = collect(of([1, 2]).pipe(toLoadState(isEmpty, () => undefined)));
    expect(states.map((s) => s.status)).toEqual(['loading', 'ok']);
    expect(states[1]).toEqual({ status: 'ok', data: [1, 2] });
  });

  it('emits empty for an empty result, not an error', () => {
    const states = collect(of<number[]>([]).pipe(toLoadState(isEmpty, () => undefined)));
    expect(states.map((s) => s.status)).toEqual(['loading', 'empty']);
  });

  it('maps network and server errors to error with a working retry', () => {
    const retry = jasmine.createSpy('retry');
    for (const status of [0, 500, 403]) {
      const states = collect(
        throwError(() => new HttpErrorResponse({ status })).pipe(toLoadState<number[]>(isEmpty, retry)),
      );
      const last = states[states.length - 1];
      expect(last.status).toBe('error');
      if (last.status === 'error') {
        last.retry();
      }
    }
    expect(retry).toHaveBeenCalledTimes(3);
  });
});
