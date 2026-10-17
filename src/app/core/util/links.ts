/** CMS link URLs starting with a single `/` are routes inside this app. */
export function isInternalLink(url: string): boolean {
  return url.startsWith('/') && !url.startsWith('//');
}
