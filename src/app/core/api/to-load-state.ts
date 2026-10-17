import { catchError, map, Observable, of, OperatorFunction, startWith } from 'rxjs';
import { LoadState } from '../../models/load-state';

/**
 * Wraps a request in a LoadState: `loading` first, then `ok` or `empty`.
 * Any error becomes `error` with a retry callback. A 200 with no items is never an error.
 */
export function toLoadState<T>(
  isEmpty: (value: T) => boolean,
  retry: () => void,
): OperatorFunction<T, LoadState<T>> {
  return (source: Observable<T>) =>
    source.pipe(
      map((data): LoadState<T> => (isEmpty(data) ? { status: 'empty' } : { status: 'ok', data })),
      catchError(() => of<LoadState<T>>({ status: 'error', retry })),
      startWith<LoadState<T>>({ status: 'loading' }),
    );
}
