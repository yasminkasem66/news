import { BlockList } from '../../models/delivery-api';

/** Unwraps a Block List value to its blocks' properties; `[]` when null or empty. */
export function blocks<T>(list: BlockList<T> | undefined): T[] {
  return list?.items?.map((item) => item.content.properties) ?? [];
}
