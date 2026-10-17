# Research: News Portal Public Frontend

**Date**: 2026-10-17 | **Spec**: [spec.md](spec.md) | **Evidence**: [docs/api/samples/](../../docs/api/samples/README.md)

All findings below come from real responses captured against the running backend at
`http://localhost:25050`, plus inspection of this repository. Nothing is inferred from the
contract documents alone. Responses were **re-captured on 2026-10-17** after the backend was
re-seeded and the `publishedDate` sort was registered. The backend's frontend-facing reference
was copied to [docs/api/05-api-reference.md](../../docs/api/05-api-reference.md). Where documents
disagree, the captured behavior wins.

## 1. Existing project conventions

- **Decision**: Follow what is already there:
  - Angular 22, standalone components (no NgModules).
  - `provideZoneChangeDetection` with zone.js.
  - `provideHttpClient(withXhr())`.
  - Tailwind CSS 4 via PostCSS (global `src/styles.css`).
  - Transloco (`en`, `ar`, files in `public/i18n/`, `reRenderOnLangChange: true`).
  - Lucide icons registered in `icons.provider.ts`.
  - ngx-sonner toaster mounted in `app.html`.
  - Cairo and Montserrat fonts.
  - Karma + Jasmine (`ng test`).
  - Strict TypeScript and strict templates.
  - 2-space indentation and single quotes (`.editorconfig`, Prettier).
- **Rationale**: Constitution Principle VII.
- **Notes**:
  - `routes` is empty.
  - There is no `src/environments/`.
  - `public/i18n/*.json` are empty `{}`.
  - `app.spec.ts` asserts an `<h1>Hello, news</h1>` that `app.html` does not render, so it fails today and must be updated in Phase 1.
  - `@angular/ssr` is installed but SSR is not configured (no `server.ts`, no `server` builder option). The app is client-rendered, but browser globals are still guarded so SSR can be enabled later.
  - `ngx-extended-pdf-viewer` is installed and unused by this feature. Leave it alone.
- **Alternatives considered**: Adding NgRx or another state library was rejected. Signals plus services cover the shared state (language, site settings) with no new dependency.

## 2. Article list ordering and paging (G1, resolved)

- **History**: The first capture (on the previous seed) found `sort=publishedDate:desc` returned **400** `"Sort option not found"`, which was recorded as gap G1. The backend owner then registered `publishedDate` as a sort field and re-seeded. The contract is now [docs/api/05-api-reference.md](../../docs/api/05-api-reference.md).
- **Finding (re-capture)**:
  - `sort=publishedDate:desc` returns **200** with articles ordered 2026-10-16 down to 2026-10-09.
  - `skip=3&take=3` returns items 4–6 with `total: 8`.
  - The sort works combined with `filter=category:` and `filter=tags:`.
- **Decision**:
  - Use **server-side** ordering and paging exactly as in Postman: `sort=publishedDate:desc&skip={(page-1)*20}&take=20`.
  - `total` drives the pagination control.
  - No client-side sorting or caching of the whole corpus.
- **Alternatives considered**: The earlier workaround (fetch everything, then sort and slice on the client) was dropped now that the backend supports the sort. It no longer appears in Complexity Tracking.

## 3. Featured filter value

- **Finding**: `filter=isFeatured:1` returns the 3 featured articles in `featuredOrder` 1, 2, 3. `filter=isFeatured:true` (the contract-doc variant) is **silently ignored** and returns all 8.
- **Decision**: Use `filter=contentType:newsArticle&filter=isFeatured:1&sort=featuredOrder:asc` (the Postman request). For ties on `featuredOrder`, apply a stable client-side tie-break by `createDate` ascending, which is the contract doc's rule.
- **Alternatives considered**: Adding `sort=createDate:asc` as a second sort parameter on the server. It is not exercised in Postman, and the client tie-break is equivalent and safe.

## 4. Search

- **Finding**: `query=demo` and `query=Marathon` both return all 8 articles. The parameter is ignored, so free-text search is **not available** (gap **G2**). `filter=tags:<keyword>` works as an exact tag match (seed tags are `demo` and `news`).
- **Finding**: Tag matching is **exact and case-sensitive**: `tags:Demo` returns `total: 0`. Category and tag filters can be combined (they are ANDed): `category:<Technology>` plus `tags:demo` returns 3.
- **Decision**:
  - Tag search (E4) is the only search.
  - The input is labelled "Search by tag" and the keyword is trimmed but **not** case-changed, because editors may use mixed-case tags.
  - The helper text tells visitors tags are matched exactly, and tags on article cards and the detail page are clickable, so visitors rarely need to type them.
  - A category and a tag can be active together.
  - No free-text search ships.
- **Alternatives considered**: Filtering titles on the client from the full list. It was rejected because the brief limits search to verified backend capabilities.

## 5. Category shape

- **Finding**: In both list and detail responses, `properties.category` arrives already expanded one level: `{ id, name, contentType, route, properties: {} }`, with the name localized under `ar`. With `expand=properties[category]`, the category's own `properties` (`colour`, `icon`) are filled in too.
- **Decision**: No `expand` parameter. Use `category.id` and `category.name` from the article. Category colour, if shown, comes from the E2 list (which includes `properties.colour`), matched by id.

## 6. Language and the "not available in this language" state

- **Findings**:
  - `Accept-Language: ar` changes the names, rich text and Block List labels.
  - Content without an Arabic version is excluded from lists: E1 in `ar` has `total: 5`.
  - For detail, both an English-only article in `ar` and a nonexistent id return **404 with an empty body**. [05-api-reference.md](../../docs/api/05-api-reference.md) documents this as native Umbraco behavior.
  - Retrying the same id **with no language header** gives 200 for "exists, not translated" (`E8-language-gap-retry-default.json`) and 404 for a genuinely invalid id. This is the backend's documented, supported workaround.
  - Both list items and the detail response carry a `cultures` map. Keys are `en-US` and `ar`, and a missing `ar` key means there is no Arabic version.
  - `?culture=ar` is **ignored** on both list and detail, contrary to the doc (mismatch M5). Only the `Accept-Language` header works.
- **Decision** (language-gap detection, two layers):
  1. **Known `cultures` (navigating from a list, or switching language while on a detail page)**:
     - The detail page keeps the loaded article's `cultures`.
     - Switching to a language the article lacks shows the `languageGap` state straight away, without another request.
     - In the English list, cards for articles without `ar` show a small "English only" badge, so visitors aren't surprised later. This follows the doc's advice not to promise an Arabic version.
     - The Arabic list never contains them, because the server filters them out.
  2. **Unknown `cultures` (deep link, bookmark, refresh) and a 404**:
     - `NewsService.getArticle` makes **one retry of the same `/item/{id}` request with no `Accept-Language` header** (the documented way).
     - 200 gives `{ kind: 'languageGap', availableIn: <languages from the retry's cultures map> }`.
     - 404 gives `{ kind: 'notFound' }`.
     - When the active language is already `en`, a 404 is final and there is no retry.
- **Decision** (header handling):
  - An HTTP interceptor adds `Accept-Language` to every request whose URL starts with `${apiBaseUrl}/umbraco/delivery/`.
  - The retry opts out through an `HttpContext` token (`SKIP_LANGUAGE`), so it goes out with no language qualifier, exactly like the documented workaround.
  - The language is a signal in `LanguageService`, persisted to `localStorage` key `news.lang`. Every access is wrapped in try/catch with `isPlatformBrowser`. The fallback is `en`.
  - On change, the service sets `document.documentElement.lang`/`dir` and calls `TranslocoService.setActiveLang`.
- **Alternatives considered**:
  - `?culture=` instead of the header was rejected because it doesn't work (M5).
  - Relying only on the `cultures` map was rejected because deep links have no list context.

## 7. Media URLs

- **Finding**: Media pickers (`logo`, `featuredImage`, `heroImage`, `gallery`) are arrays (or `null`) of `{ id, name, url, width, height, extension, focalPoint, crops }`. The `url` is **relative** (`/media/…`).
- **Decision**: A `mediaUrl()` helper (a pure function plus a pipe) prefixes `environment.apiBaseUrl`. The first array element is used for single pickers. Alt text uses the article title (or page name), falling back to the media `name`. Images use `loading="lazy"` except the logo and the detail hero.

## 8. Rich text

- **Finding**: `body` and `footerAboutText` are `{ markup: string, blocks: [] }`. Seed markup is plain `<p>`.
- **Decision**: Render with `[innerHTML]="value.markup"`, which goes through Angular's DomSanitizer. **No `bypassSecurityTrust*` is needed.** Style it with Tailwind arbitrary descendant selectors (no `@tailwindcss/typography` dependency).

## 9. Block List values

- **Finding**: `primaryNavigation`, `footerLinkColumns` (with nested `links`), `socialLinks` and `stats` all use the shape `{ items: [{ content: { contentType, id, properties }, settings: null }] }`, or `null` when empty. Link blocks hold `{ label, url, openInNewTab }`. URLs are plain strings: internal ones start with `/` (`/`, `/about-us`), external ones are absolute.
- **Decision**:
  - A generic `BlockList<T>` model plus a `blocks()` helper that returns `T[]` (empty on `null`).
  - A link is internal when its `url` starts with `/` and not `//`. Internal links render with `routerLink`, external ones with a plain `<a href>`.
  - `openInNewTab` adds `target="_blank" rel="noopener noreferrer"`.

## 10. Routes and CMS link paths

- **Finding**: CMS navigation links point to `/about-us`, while the brief's route table uses `/about` and `/contact`.
- **Decision**:
  - Keep the brief's routes as canonical.
  - Add redirect routes `about-us → about` and `contact-us → contact`, so editor-entered paths resolve without touching content.
  - Any other unknown internal path falls to the wildcard not-found page.

## 11. Contact submission

- **Findings**:
  - Valid input gives **201** `{ status: "success", submittedAt }`.
  - Invalid input gives **400** `{ status: "validationError", errors: { Name: [...], Email: [...], Subject: [...], Message: [...] } }`. Keys are **PascalCase**. `05-api-reference.md` documents this. The older `contact-submission.md` shows camelCase (mismatch **M1**, now resolved in favor of PascalCase).
  - Server messages are English only.
- **Decision**:
  - `ContactService` maps error keys case-insensitively to `name | email | subject | message`. Unknown keys go into a form-level error list.
  - Client validators mirror the rules: required, `minLength`/`maxLength` 2–100, 3–150 and 10–2000, plus `Validators.email`.
  - Server messages are shown as given. They are content from the server, not translated.
  - Use Angular reactive forms (already in `@angular/forms`).
- **Note**: The capture created one real submission in the backoffice. That's expected, and it doubles as evidence for the Phase 9 check.

## 12. Map link

- **Decision**: Parse `mapCoordinates` (`"lat,lng"`) into numbers. If parsing works, render an external link to `https://www.openstreetmap.org/?mlat={lat}&mlon={lng}#map=16/{lat}/{lng}`. No embed and no API key. If parsing fails, leave the map out.

## 13. State and data flow

- **Decision**:
  - Services return `Observable`s, and components convert them with `toSignal` or `rxResource`.
  - `SiteSettingsService` exposes a signal driven by `LanguageService.lang`, using `switchMap` plus `shareReplay(1)` per language. The settings are fetched once per language and re-fetched on switch (FR-024).
  - Page components re-fetch when the language signal or route params change.
  - Each request is wrapped in a `LoadState<T>` (`loading | ok | empty | notFound | languageGap | error`) so templates handle every state (FR-011).

## 14. Testing

- **Decision**:
  - Unit tests for every data service use `provideHttpClientTesting` and `HttpTestingController`. They assert the URL, query string, `Accept-Language` header and the mapping of 200, empty, 404 (both kinds), 400 and network-error responses.
  - Fixtures are loaded from `docs/api/samples/*.json` through a JSON import in the spec files (the tsconfig `resolveJsonModule` flag is added to `tsconfig.spec.json` only).
  - Each component has a light test for its state branches.
  - The broken `app.spec.ts` is rewritten.

## Gaps and mismatches (report to the backend owner; not worked around with invented data)

| ID | Type | Description | Impact | Handling |
|---|---|---|---|---|
| G1 | Gap (**resolved** 2026-10-17) | `publishedDate` was not a registered sort field | — | Backend fixed. Server-side sort and paging are used (§2) |
| G2 | Gap (open) | `query=` full-text search is ignored. `05-api-reference.md` does not offer it either | No free-text search | Tag search only (§4) |
| M1 | Mismatch (resolved) | 400 error keys are PascalCase. `05-api-reference.md` agrees, the older `contact-submission.md` does not | Field mapping | Case-insensitive mapping (§11) |
| M2 | Mismatch | `isFeatured:true` (`delivery-api-reads.md`) is ignored; `isFeatured:1` works, as in `05-api-reference.md` | Featured list | Use `:1` (§3) |
| M3 | Known limitation | Not-found and language-gap 404s are identical (empty body). Documented in `05-api-reference.md` | Detail state | `cultures` map plus a retry with no language header (§6) |
| M4 | Mismatch | CMS nav uses `/about-us`; brief routes use `/about` | Navigation | Redirect routes (§10) |
| M5 | Mismatch (open) | `05-api-reference.md` says `?culture=ar` works like the header; it is ignored on list and detail | Language selection | Use the `Accept-Language` header only (§6). Report to the backend owner |
