import { Lang } from './lang';

export type LoadState<T> =
  | { status: 'loading' }
  | { status: 'ok'; data: T }
  /** 200 with `items: []`, or a missing singleton. */
  | { status: 'empty' }
  /** 404 that is missing in every language. */
  | { status: 'notFound' }
  /** Missing in the active language: from `cultures`, or 404 + 200 on the no-header retry. */
  | { status: 'languageGap'; availableIn: Lang[] }
  /** Network, 5xx or an unexpected status. */
  | { status: 'error'; retry: () => void };

export function isOk<T>(state: LoadState<T>): state is { status: 'ok'; data: T } {
  return state.status === 'ok';
}

export function isError<T>(state: LoadState<T>): state is { status: 'error'; retry: () => void } {
  return state.status === 'error';
}

export function isLanguageGap<T>(
  state: LoadState<T>,
): state is { status: 'languageGap'; availableIn: Lang[] } {
  return state.status === 'languageGap';
}
