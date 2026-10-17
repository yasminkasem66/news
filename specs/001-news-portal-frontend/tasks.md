---

description: "Task list for the News Portal public frontend"
---

# Tasks: News Portal Public Frontend

**Input**: Design documents from `specs/001-news-portal-frontend/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/](contracts/), [quickstart.md](quickstart.md)

**Tests**: Included. Constitution Principle VI and spec FR-037 require a unit test (using `HttpTestingController`) for every data service, asserting the URL, query string and headers, plus 404, 400, empty and network handling. Component tests are limited to state branches. Fixtures are the captured responses in `docs/api/samples/*.json`.

**Organization**: Tasks are grouped by user story (spec.md), so each story can be built and checked on its own.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on unfinished tasks)
- **[Story]**: The user story the task belongs to (US1–US7)

## Conventions for every task

- Angular 22 standalone components, signals, `inject()`, and `ChangeDetectionStrategy.OnPush` for new components. Templates use `@if` / `@for` control flow.
- Styling uses Tailwind utilities in templates (component CSS budget is 4 kB). Use **logical** utilities only (`ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`, `text-start`) so RTL mirrors. Icons that point a direction get `rtl:rotate-180`.
- Every user-visible label is a Transloco key, added to **both** `public/i18n/en.json` and `public/i18n/ar.json`. CMS content is never put through translation.
- Components never inject `HttpClient` and never build URLs. Only services in `src/app/services/` call `ApiService`.
- 2-space indentation and single quotes (`.editorconfig`).
- `{api}` = `environment.apiBaseUrl`. `{d}` = `{api}/umbraco/delivery/api/v2/content`.
- Seed ids for tests and manual checks:
  - Article in both languages: `5b8e0d5f-b1a4-4518-816d-371f1300bbf9`
  - English-only article: `170e2282-6ae0-4f0d-b6f1-b080d6c10d2f`
  - Category Technology: `63158b7b-56d6-4fea-a957-262ec4fad8a3`

## Mapping to the brief's stop-and-report phases (TASK-frontend.md)

| Brief phase | Tasks |
|---|---|
| 0 Discovery | Done during `/speckit-plan` (`docs/api/samples/`, research.md) |
| 1 Foundation | T001–T024 |
| 2 Data services | Service and spec tasks inside each story: T025–T027, T038–T039, T052–T053, T061–T066, T073–T075, T085–T086 |
| 3 Shell | T073–T080 (US7) and T048 (switcher, US3) |
| 4 News list | T028–T037 (US1), T054–T060 (US4) |
| 5 Article detail | T040–T047 (US2), T049–T051 (US3) |
| 6 About | T085–T089 (US6) |
| 7 Contact | T061–T072 (US5) |
| 8 Home + polish | T081–T084 (US7), T090–T096 |
| 9 Verification | T097–T101 |

At the end of each brief phase, **stop, summarize what changed (with test results), and wait for confirmation** before starting the next one (constitution, Development Workflow).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Configuration and scaffolding that everything else builds on.

- [X] T001 Create `src/environments/environment.ts` exporting `environment = { production: false, apiBaseUrl: 'http://localhost:25050' }` and `src/environments/environment.production.ts` with `{ production: true, apiBaseUrl: '' }` plus a comment that it is set at deploy time. Add a `fileReplacements` entry to the `production` configuration in `angular.json` that swaps `src/environments/environment.ts` for `src/environments/environment.production.ts`.
- [X] T002 [P] Add `"resolveJsonModule": true` to `compilerOptions` in `tsconfig.spec.json` **only**, so spec files can `import sample from '../../../docs/api/samples/E1-articles.json'`.
- [X] T003 [P] Register the extra Lucide icons in `src/app/icons.provider.ts` (keep the existing ones): `LucideLanguages`, `LucideExternalLink`, `LucideMapPin`, `LucidePhone`, `LucideMail`, `LucideTag`, `LucideCircleAlert`, `LucideRefreshCw`, `LucideLoaderCircle`, `LucideStar`, `LucideCalendar`, `LucideArrowRight`, `LucideImage`.
- [X] T004 [P] Create the Transloco label skeleton in `public/i18n/en.json` and `public/i18n/ar.json` with matching nested keys:
  - `site.name`
  - `nav.{home,news,about,contact,menu,close}`
  - `lang.{en,ar,switchTo}`
  - `state.{loading,error,retry,empty,notFound,notFoundBack,contentUnavailable}`
  - `news.{title,featured,allCategories,searchByTag,searchHint,clear,noArticlesYet,noResults,englishOnly,by,publishedOn,page,prev,next,viewAll,latest,tags,gallery}`
  - `article.{languageGapTitle,languageGapBody,readIn}`
  - `about.{title,stats}`
  - `contact.{title,address,phone,email,hours,map,openMap,social,form.{name,email,subject,message,submit,sending,success,failure,retry,counter},errors.{required,minLength,maxLength,email}}`
  - `notFound.{title,body,home}`
  - `footer.{follow}`

  Arabic values are real Arabic text. `lang.en` = "English" and `lang.ar` = "العربية" in both files.
- [X] T005 [P] In `src/styles.css`, add:
  - a base layer that uses `font-family: 'Montserrat'` on `html[lang=en]` and `font-family: 'Cairo'` on `html[lang=ar]`;
  - `body` background and text color tokens;
  - a `.rich-text` utility block (Tailwind `@layer components`) styling `p`, `h2`, `h3`, `ul`, `ol`, `a`, `img` and `blockquote` descendants with logical spacing, for CMS markup.
- [X] T006 Rewrite `src/app/app.spec.ts` so it no longer expects `<h1>Hello, news</h1>`. It should assert that the `App` component creates and renders a `<router-outlet>`, providing `provideRouter([])`, `provideHttpClient()` and `provideHttpClientTesting()`. Run `npm test` to confirm the suite is green.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared models, API access, language handling, state handling and the shell skeleton that every story uses.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

### Shared models and helpers

- [X] T007 [P] Create `src/app/models/delivery-api.ts` with the types from data-model.md "Shared Delivery API shapes":
  - `PagedResult<T> { total: number; items: T[] }`
  - `ContentRoute`
  - `ContentItem<TContentType extends string, TProps>`, with `cultures?: Record<string, ContentRoute>`
  - `MediaItem`, with `url` documented as "relative (`/media/…`)"
  - `MediaPicker = MediaItem[] | null`
  - `RichText { markup: string; blocks: unknown[] }`
  - `BlockContent<T>`
  - `BlockList<T> = { items: { content: BlockContent<T>; settings: null }[] } | null`
- [X] T008 [P] Create `src/app/models/lang.ts` exporting `type Lang = 'en' | 'ar'`, `LANGS: readonly Lang[]`, `DEFAULT_LANG: Lang = 'en'`, `dirOf(lang): 'ltr' | 'rtl'` (`rtl` for `ar`) and `otherLang(lang)`.
- [X] T009 [P] Create `src/app/models/load-state.ts` with the `LoadState<T>` union from data-model.md, exactly:
  - `{ status: 'loading' }`
  - `{ status: 'ok'; data: T }`
  - `{ status: 'empty' }`
  - `{ status: 'notFound' }`
  - `{ status: 'languageGap'; availableIn: Lang[] }`
  - `{ status: 'error'; retry: () => void }`

  Also add type guards.
- [X] T010 [P] Create `src/app/core/util/media.ts`:
  - `mediaUrl(item: MediaItem | null | undefined): string | null`, which prefixes relative URLs with `environment.apiBaseUrl` and leaves absolute URLs unchanged;
  - `firstMedia(picker: MediaPicker): MediaItem | null`.

  Add `src/app/core/util/media.spec.ts` covering a relative URL, an absolute URL, `null` and an empty array.
- [X] T011 [P] Create `src/app/core/util/blocks.ts` with `blocks<T>(list: BlockList<T>): T[]` (returns `[]` for `null` or missing `items`, otherwise maps `items[].content.properties`). Add `src/app/core/util/blocks.spec.ts` using the `primaryNavigation` and `footerLinkColumns` values from `docs/api/samples/E10-site-settings.json`.
- [X] T012 [P] Create `src/app/core/util/links.ts` with `isInternalLink(url: string): boolean`, true when `url` starts with `/` and not `//`. Add `src/app/core/util/links.spec.ts` covering `/`, `/about-us`, `//cdn.x`, `https://x.com/example` and `mailto:`.
- [X] T013 [P] Create `src/app/core/util/cultures.ts` with `availableLangs(item: { cultures?: Record<string, unknown> }): Lang[]`, mapping keys `en-US` (or any `en*`) to `en` and `ar` to `ar`, in the order `['en','ar']`. Add `src/app/core/util/cultures.spec.ts` using `docs/api/samples/E1-articles.json`: item `5b8e0d5f…` gives `['en','ar']`, and item `170e2282…` gives `['en']`.
- [X] T014 [P] Create `src/app/core/util/coordinates.ts` with `parseCoordinates(value: string | null): { lat: number; lng: number } | null` (split on `,`, trim, `Number.isFinite` checks, lat within ±90 and lng within ±180) and `osmLink(c)` returning `https://www.openstreetmap.org/?mlat={lat}&mlon={lng}#map=16/{lat}/{lng}`. Add `src/app/core/util/coordinates.spec.ts` with `"30.0444,31.2357"`, `""`, `null` and `"abc,1"`.

### API access and language

- [X] T015 Create `src/app/core/api/api.service.ts` (`providedIn: 'root'`):
  - `getContent<T>(params: { filters?: string[]; sort?: string; skip?: number; take?: number }, context?: HttpContext): Observable<T>`, which builds `GET {d}` with **repeated** `filter` params (`HttpParams.append`), in order: `filter`…, `sort`, `skip`, `take`;
  - `getItem<T>(id: string, context?: HttpContext): Observable<T>` → `GET {d}/item/{id}`;
  - `post<TRes>(path: string, body: unknown): Observable<HttpResponse<TRes>>` → `{api}{path}` with `observe: 'response'`.

  Never use `?culture=` (research M5). Add `src/app/core/api/api.service.spec.ts` asserting that the exact URL `…/content?filter=contentType:newsArticle&filter=tags:demo&sort=publishedDate:desc&skip=0&take=20` is produced, plus the `/item/{id}` URL.
- [X] T016 Create `src/app/core/i18n/language.service.ts` (`providedIn: 'root'`):
  - `lang = signal<Lang>(…)`, read at startup from `localStorage['news.lang']`, guarded by `isPlatformBrowser` **and** try/catch, falling back to `'en'` on any failure or invalid value;
  - `setLang(l)`, which persists (try/catch), sets `document.documentElement.lang = l` and `dir = dirOf(l)` (through the `DOCUMENT` token), and calls `TranslocoService.setActiveLang(l)`;
  - applies the initial language in the constructor.

  Add `src/app/core/i18n/language.service.spec.ts` covering:
  - default `en`;
  - restore of `ar` from storage;
  - a throwing `localStorage` (spy) falls back to `en` without throwing;
  - `setLang('ar')` sets `lang="ar"` and `dir="rtl"`.
- [X] T017 Create `src/app/core/api/accept-language.interceptor.ts`:
  - export `CULTURE = { en: 'en-US', ar: 'ar' }` (research M6: `en` matches nothing) and `LANGUAGE_OVERRIDE = new HttpContextToken<Lang | null>(() => null)`;
  - export a functional `acceptLanguageInterceptor` that, for requests whose URL starts with `${environment.apiBaseUrl}/umbraco/delivery/` sets `Accept-Language: CULTURE[override ?? LanguageService.lang()]`, always explicitly. It never touches `/api/contact`.

  Add `src/app/core/api/accept-language.interceptor.spec.ts` covering: `en-US` and `ar` sent for delivery URLs, `LANGUAGE_OVERRIDE` wins over the active language, header absent for `{api}/api/contact`.
- [X] T018 Create `src/app/core/api/to-load-state.ts`, an RxJS operator `toLoadState<T>(isEmpty: (v: T) => boolean, retry: () => void)`. It emits `{status:'loading'}` first, then `ok`/`empty`, and maps `HttpErrorResponse` (status 0, 5xx, or any other unexpected status) to `{status:'error', retry}`. Add `src/app/core/api/to-load-state.spec.ts`.
- [X] T019 Update `src/app/app.config.ts`:
  - `provideHttpClient(withXhr(), withInterceptors([acceptLanguageInterceptor]))`;
  - `provideRouter(routes, withComponentInputBinding(), withInMemoryScrolling({ scrollPositionRestoration: 'top' }))`;
  - an `APP_INITIALIZER` / `provideAppInitializer` that injects `LanguageService`, so `lang`/`dir` and the Transloco language are applied before first render;
  - a custom `TitleStrategy` provider (T020).
- [X] T020 [P] Create `src/app/core/i18n/page-title.strategy.ts`, a `TitleStrategy` that takes the route's `title` as a Transloco key and sets `document.title` to `"{translated} · {site.name}"`. It re-applies on language change, and exposes `setRaw(text)` so the article page can set `"{article name} · {site.name}"`.

### Shared UI and the shell skeleton

- [X] T021 [P] Create the state components in `src/app/shared/state/`:
  - `loading-block.ts` (spinner icon plus the `state.loading` label, `role="status"`, `aria-live="polite"`);
  - `empty-block.ts` (input `message` key);
  - `error-block.ts` (`state.error` text plus a Retry button emitting `retry`, `role="alert"`);
  - `not-found-block.ts` (inputs `titleKey`, `linkTo`, `linkLabelKey`).

  All standalone and OnPush, with `src/app/shared/state/state-blocks.spec.ts` covering that each renders its label and that Retry emits.
- [X] T022 [P] Create `src/app/shared/rich-text.ts`, a component with input `value: RichText | null` that renders `<div class="rich-text" [innerHTML]="value.markup">`, and nothing when `null` or the markup is empty. **Do not** use `DomSanitizer.bypassSecurityTrust*` (Constitution IV). Add `src/app/shared/rich-text.spec.ts` asserting that a `<script>` in the markup is removed and that `<p>` survives.
- [X] T023 [P] Create `src/app/shared/cms-link.ts`, a component with inputs `url: string`, `label: string`, `openInNewTab: boolean` and optional `class`:
  - when `isInternalLink(url)`, render `<a [routerLink]="url">`;
  - otherwise render `<a [href]="url">`;
  - when `openInNewTab` is true, add `target="_blank" rel="noopener noreferrer"` and an external-link icon with `aria-hidden="true"`.

  Add `src/app/shared/cms-link.spec.ts`.
- [X] T024 Replace `src/app/app.html` and `src/app/app.ts` with the shell skeleton:
  - a skip-link (`#main`), then `<app-header>`, `<main id="main" tabindex="-1">` with `<router-outlet>`, `<app-footer>` and `<ngx-sonner-toaster>`;
  - create placeholder standalone `src/app/layout/header.ts` (shows the `site.name` text linking to `/`) and `src/app/layout/footer.ts` (empty), to be filled in US3 and US7;
  - create `src/app/features/not-found/not-found.page.ts` (uses `NotFoundBlock`, links to `/` and `/news`);
  - in `src/app/app.routes.ts`, set `routes` to `[{ path: '**', title: 'notFound.title', loadComponent: () => import('./features/not-found/not-found.page') }]`. Later stories insert their routes **before** the wildcard.

  Run `npm run build` and `npm test`.

**Checkpoint**: Foundation ready. Stop and report (brief Phase 1).

---

## Phase 3: User Story 1 - Browse the latest news (Priority: P1) 🎯 MVP

**Goal**: `/news` lists articles newest first, 20 per page, with featured articles above in editorial order.

**Independent Test**: quickstart V1. `/news` shows 8 articles from "City Unveils New Tech Hub" (2026-10-16) to "Youth League…" (2026-10-09), with the featured strip ordered Tech Hub → Championship → Seed Funding. `?page=2` with page size 20 shows the "no results" state.

### Tests for User Story 1

- [X] T025 [P] [US1] Write `src/app/services/news.service.spec.ts`, section `getArticles` and `getFeatured`, using `provideHttpClientTesting`:
  - `getArticles({page:1,pageSize:20})` sends `GET {d}?filter=contentType:newsArticle&sort=publishedDate:desc&skip=0&take=20` with `Accept-Language: en-US`;
  - `page:2` gives `skip=20`;
  - the response from `E1-articles.json` passes through with `total` 8;
  - `E5-no-results.json` gives `total` 0;
  - `getFeatured()` sends `filter=contentType:newsArticle&filter=isFeatured:1&sort=featuredOrder:asc` (**not** `isFeatured:true`, research M2) and returns 3 items from `E6-featured.json` in the order 1, 2, 3;
  - two items sharing a `featuredOrder` are tie-broken by `createDate` ascending.

### Implementation for User Story 1

- [X] T026 [P] [US1] Create `src/app/models/article.ts`:
  - `CategoryRef = { id: string; name: string; contentType: 'newsCategory'; route: ContentRoute; properties: Record<string, unknown> }`;
  - `ArticleProps`, with every field from data-model.md "Article": `urlSlug: string; category: CategoryRef | null; summary: string /* 50–300 characters (backend rule) */; body: RichText; featuredImage: MediaPicker; gallery: MediaPicker; publishedDate: string; author: string | null; tags: string[] | null; isFeatured: boolean; featuredOrder: number`;
  - `Article = ContentItem<'newsArticle', ArticleProps>`;
  - `ArticleQuery = { page: number; pageSize: number; categoryId?: string; tag?: string }`.
- [X] T027 [US1] Create `src/app/services/news.service.ts` (`providedIn: 'root'`) with:
  - `getArticles(q: ArticleQuery): Observable<PagedResult<Article>>`, which calls `ApiService.getContent` with `filters: ['contentType:newsArticle', …(q.categoryId ? ['category:'+id] : []), …(q.tag ? ['tags:'+tag] : [])]`, `sort: 'publishedDate:desc'`, `skip: (page-1)*pageSize` and `take: pageSize`;
  - `getFeatured(): Observable<Article[]>`, with a stable sort by `featuredOrder` asc then `createDate` asc.

  Make T025 pass.
- [X] T028 [P] [US1] Create `src/app/shared/media-url.pipe.ts` (`mediaUrl` pure pipe wrapping `mediaUrl(firstMedia(x))`).
- [X] T029 [P] [US1] Create `src/app/features/news/article-card.ts`, a component with inputs `article: Article`, `showEnglishOnlyBadge = false` and `headingLevel: 2 | 3 = 3`. It renders:
  - the featured image (via the pipe, `alt` = article name, `loading="lazy"`, fixed aspect ratio, and an icon placeholder when there is no image);
  - the title as `routerLink` `/news/{id}`;
  - the category name;
  - the summary;
  - the published date via `DatePipe` with format `mediumDate` and the active locale (`en` or `ar`);
  - the author only when present.

  Leave out empty parts (FR-005). Add `src/app/features/news/article-card.spec.ts` using item 1 from `E1-articles.json`.
- [X] T030 [P] [US1] Create `src/app/shared/pagination.ts`, a component with inputs `page`, `pageSize` and `total`, emitting `pageChange`. It renders prev/next plus "page X of Y" (translated), hides itself when `total <= pageSize`, uses `<nav aria-label>`, and puts `aria-current="page"` on the current page. The chevron icons use `rtl:rotate-180`. Add `src/app/shared/pagination.spec.ts`.
- [X] T031 [P] [US1] Create `src/app/features/news/featured-strip.ts`, a component that loads `NewsService.getFeatured()` through `toLoadState`:
  - `ok` renders a horizontal list of `ArticleCard`s under the `news.featured` heading;
  - `empty` renders **nothing at all** (no heading, never filled with other articles; FR-010);
  - `error` renders a compact `ErrorBlock` with retry, **independent** of the list (FR-011).

  It re-fetches when `LanguageService.lang()` changes.
- [X] T032 [US1] Create `src/app/features/news/news-list.page.ts`, a page component:
  - reads `page` (int ≥ 1, default 1, invalid values become 1) from query params via the component input binding;
  - loads `getArticles({ page, pageSize: 20 })` through `toLoadState`;
  - shows `FeaturedStrip` above the list;
  - list states: `loading` → `LoadingBlock`; `ok` → a responsive grid (1/2/3 columns at `sm`/`lg`) of `ArticleCard`; `empty` with no filters → `EmptyBlock` `news.noArticlesYet`; `error` → `ErrorBlock` with retry;
  - a page past the end (items empty, total > 0) shows `news.noResults`;
  - `Pagination` changes `?page=` via `router.navigate([], { queryParams, queryParamsHandling: 'merge' })`;
  - re-fetches when `lang()` or `page` changes.
- [X] T033 [US1] Register `{ path: 'news', title: 'news.title', loadComponent: () => import('./features/news/news-list.page') }` before the wildcard in `src/app/app.routes.ts`.
- [X] T034 [P] [US1] Add `src/app/features/news/featured-strip.spec.ts` covering: `ok` renders 3 cards in order; `empty` renders no heading; `error` shows retry while a sibling list is unaffected.
- [X] T035 [P] [US1] Add `src/app/features/news/news-list.page.spec.ts` covering: `noArticlesYet` for `E5-no-results.json` with no filters; 8 cards for `E1-articles.json`; the `?page=` input feeds `skip`.
- [X] T036 [US1] Add a temporary `news` link to the placeholder header in `src/app/layout/header.ts` (US7 replaces it with CMS navigation).
- [X] T037 [US1] Manual check against quickstart V1 with `npm start`. Record the result for the phase report.

**Checkpoint**: US1 works on its own (MVP slice).

---

## Phase 4: User Story 2 - Read a full article (Priority: P1)

**Goal**: `/news/:id` shows the whole article, separates not-found from the language gap, and links tags back to the list.

**Independent Test**: quickstart V4 and V5. `/news/5b8e0d5f-b1a4-4518-816d-371f1300bbf9` shows every field and the tab title is the article name. `/news/00000000-0000-0000-0000-000000000000` shows not-found with a link to `/news`.

### Tests for User Story 2

- [X] T038 [P] [US2] Extend `src/app/services/news.service.spec.ts` with a `getArticle` section:
  - 200 (`E7-article-detail.json`) gives `{kind:'ok', article}` with `cultures` kept;
  - in `ar`, a 404 on `{d}/item/170e2282…` triggers exactly **one** retry to the same URL with `Accept-Language: en-US` (via `LANGUAGE_OVERRIDE`), which responds 200 (`E8-language-gap-retry-default.json`) and gives `{kind:'languageGap', availableIn:['en']}`;
  - in `ar`, a 404 then a 404 gives `{kind:'notFound'}`;
  - in `en`, a 404 gives `{kind:'notFound'}` with **no** retry (`expectNone`);
  - a 500 propagates as an error.

### Implementation for User Story 2

- [X] T039 [US2] Add `getArticle(id: string): Observable<ArticleResult>` to `src/app/services/news.service.ts`, with `ArticleResult = {kind:'ok'; article: Article} | {kind:'notFound'} | {kind:'languageGap'; availableIn: Lang[]}` exported from `src/app/models/article.ts`:
  - `ApiService.getItem(id)`;
  - on `HttpErrorResponse` 404, if `LanguageService.lang() === 'ar'`, call `getItem(id, new HttpContext().set(LANGUAGE_OVERRIDE, 'en'))`: 200 gives `languageGap(availableLangs(res))`, 404 gives `notFound`;
  - a 404 in `en` gives `notFound`;
  - other errors rethrow.

  Make T038 pass.
- [X] T040 [P] [US2] Create `src/app/features/news/article-gallery.ts`, a component with input `images: MediaPicker`. It renders nothing when it's `null` or empty, otherwise a responsive grid of images (`alt` = media `name`, `loading="lazy"`) under the `news.gallery` heading.
- [X] T041 [P] [US2] Create `src/app/features/news/tag-list.ts`, a component with input `tags: string[] | null`. It renders each tag as `<a routerLink="/news" [queryParams]="{ tag }">` (FR-016) and nothing when there are no tags.
- [X] T042 [US2] Create `src/app/features/news/article-detail.page.ts`, a page component with input `id` (route param). It loads `NewsService.getArticle(id)` into a `LoadState`:
  - `loading` → `LoadingBlock`;
  - `ok` → `<article>` with `<h1>` name, category name, featured image (`firstMedia`, `alt` = article name, eager loading), published date, author (only when present), `TagList`, `RichText` body, `ArticleGallery`;
  - `notFound` → `NotFoundBlock` linking to `/news` (FR-014);
  - `languageGap` → a dedicated block with `article.languageGapTitle` / `languageGapBody` and a button per language in `availableIn` that calls `LanguageService.setLang(l)` (FR-015), visibly different from not-found;
  - `error` → `ErrorBlock` with retry.

  On `ok`, call `PageTitleStrategy.setRaw(article.name)` (FR-017). Re-fetch on `id` change.
- [X] T043 [US2] Register `{ path: 'news/:id', loadComponent: () => import('./features/news/article-detail.page') }` in `src/app/app.routes.ts`, after `news` and before the wildcard.
- [X] T044 [P] [US2] Add `src/app/features/news/article-detail.page.spec.ts` with a mocked `NewsService` covering: `ok` renders title, author, tags and body; `notFound` renders a back link to `/news`; `languageGap` renders the switch button and **not** the not-found text; a body with no gallery renders no gallery heading.
- [X] T045 [P] [US2] Add `src/app/features/news/tag-list.spec.ts`, asserting the link `href` is `/news?tag=news`.
- [X] T046 [US2] Make sure `ArticleCard` titles from US1 link to `/news/{id}` (already in T029), then run through quickstart V4 and V5 by hand.
- [X] T047 [US2] Confirm that no `bypassSecurityTrust` appears anywhere in `src/` (`grep -r bypassSecurityTrust src` returns nothing). Note the result for the phase report.

**Checkpoint**: US1 and US2 work on their own.

---

## Phase 5: User Story 3 - Read the site in Arabic (Priority: P1)

**Goal**: A language switcher on every page. Content, header and footer reload in the chosen language with the right RTL layout, the choice persists, and language gaps are explained.

**Independent Test**: quickstart V6, V7a, V7b and V8.

### Implementation for User Story 3

- [X] T048 [US3] Create `src/app/layout/language-switcher.ts`, a component with two buttons, `English` and `العربية` (from `lang.en`/`lang.ar`). Each has `lang` and `dir` attributes set for its own language, `aria-pressed` on the active one, and a click calls `LanguageService.setLang`. Mount it in `src/app/layout/header.ts` (on the end side). Add `src/app/layout/language-switcher.spec.ts`.
- [X] T049 [US3] In `src/app/features/news/article-detail.page.ts`, when `LanguageService.lang()` changes while the state is `ok` **and** `availableLangs(article)` does not include the new language, switch to `{status:'languageGap', availableIn: availableLangs(article)}` straight away **without** a new request (research §6, layer 1). Otherwise re-fetch. Extend `article-detail.page.spec.ts`: with article `170e2282…` loaded in `en`, switching to `ar` gives `languageGap` and `expectNone` for the detail request.
- [X] T050 [US3] In `src/app/features/news/news-list.page.ts` and `featured-strip.ts`, pass `showEnglishOnlyBadge = lang() === 'en' && !availableLangs(article).includes('ar')` to `ArticleCard`, and render the badge in `article-card.ts` (`news.englishOnly`, small pill). Extend `article-card.spec.ts`.
- [X] T051 [US3] RTL pass over every component built so far (`header`, `language-switcher`, `article-card`, `featured-strip`, `pagination`, `news-list.page`, `article-detail.page`, `state/*`): replace any `ml-`/`mr-`/`pl-`/`pr-`/`left-`/`right-`/`text-left`/`text-right` with logical equivalents, and add `rtl:rotate-180` to directional icons. Check by hand in Arabic: V6 (5 articles, RTL), V7a (deep-link language gap with exactly one retry in the network tab), V7b (instant gap) and V8 (persistence, plus a private window with storage blocked falling back to English).

**Checkpoint**: US1–US3 work in both languages.

---

## Phase 6: User Story 4 - Narrow the news by category or tag (Priority: P2)

**Goal**: Category filter (with "All") and tag search on `/news`, reflected in the URL, with distinct empty states.

**Independent Test**: quickstart V2 and V3. Selecting Technology gives 3 articles and `?category=63158b7b-56d6-4fea-a957-262ec4fad8a3`, which survives a reload. `tag=doesnotexist` gives "no results match your search". Clearing restores all 8.

### Tests for User Story 4

- [ ] T052 [P] [US4] Extend `src/app/services/news.service.spec.ts`:
  - `getCategories()` sends `GET {d}?filter=contentType:newsCategory` and returns 3 categories in response order (`E2-categories.json`);
  - `getArticles({page:1,pageSize:20,categoryId:'63158b7b-…'})` sends `filter=contentType:newsArticle&filter=category:63158b7b-…&sort=publishedDate:desc&skip=0&take=20`;
  - with `tag:'demo'` it appends `filter=tags:demo`;
  - with both, both filters are present (ANDed);
  - the tag is sent **exactly as typed after trim**, with no lower-casing (research §4: matching is case-sensitive).

### Implementation for User Story 4

- [ ] T053 [P] [US4] Create `src/app/models/category.ts` (`CategoryProps { colour: string | null; icon: MediaPicker | string | null }`, `Category = ContentItem<'newsCategory', CategoryProps>`), and add `getCategories(): Observable<Category[]>` to `src/app/services/news.service.ts`. Make T052 pass.
- [ ] T054 [P] [US4] Create `src/app/features/news/category-filter.ts`, a component with inputs `categories: Category[]` and `selectedId: string | null`, emitting `selectedChange`. It renders an "All" option (`news.allCategories`) plus one option per category in response order, as a `role="radiogroup"` of buttons or a `<select>` on mobile, and shows the category `colour` as a small swatch when present. Add `src/app/features/news/category-filter.spec.ts`.
- [ ] T055 [P] [US4] Create `src/app/features/news/tag-search.ts`, a component with input `value` and outputs `search(tag: string)` and `clear()`. It's a `<form role="search">` with a labelled input (`news.searchByTag`), helper text `news.searchHint` ("tags are matched exactly") linked by `aria-describedby`, and Submit and Clear buttons. It trims the value and emits nothing for an empty string. Add `src/app/features/news/tag-search.spec.ts`.
- [ ] T056 [US4] Extend `src/app/features/news/news-list.page.ts`:
  - read the `category` and `tag` query params;
  - load categories (E2) with their own `LoadState`; if categories fail, hide the filter but keep the list working (FR-011);
  - pass `categoryId` and `tag` to `getArticles`;
  - selecting a category or searching sets `?category=` / `?tag=` and resets `page` to 1;
  - "Clear" removes `category`, `tag` and `page` (FR-008);
  - hide `FeaturedStrip` while any filter is active;
  - when `total === 0` with filters active, show `news.noResults` (distinct from `news.noArticlesYet`, FR-009);
  - show the active tag as a removable chip.
- [ ] T057 [US4] Extend `src/app/features/news/news-list.page.spec.ts` covering:
  - `?category=63158b7b-…` feeds the category filter;
  - `?tag=doesnotexist` with `E5-no-results.json` shows `noResults` and **not** `noArticlesYet`;
  - Clear navigates to `/news` with no params;
  - a category-load error still renders the list.
- [ ] T058 [US4] Confirm that tag links from US2 (`/news?tag=news`) land on the filtered list.
- [ ] T059 [US4] Edge case: an unknown `?category=` id, or a page past the end, shows `news.noResults` and not an error.
- [ ] T060 [US4] Check quickstart V2 and V3 by hand in both languages.

**Checkpoint**: US1–US4 work on their own.

---

## Phase 7: User Story 5 - Contact the organization (Priority: P2)

**Goal**: `/contact` shows the organization's details and a validated message form that handles 201, 400 and network failures.

**Independent Test**: quickstart V10–V13. Invalid input shows field errors with focus on the first one and sends no request. Valid input gives 201: success, a cleared form, and the record visible in the backoffice. A server 400 maps onto the fields. Backend down gives a general error with Retry and the input kept.

### Tests for User Story 5

- [ ] T061 [P] [US5] Write `src/app/services/contact.service.spec.ts`:
  - `submit({name:'Jane Doe',email:'jane@example.com',subject:'Hello there',message:'This is a test message that is definitely long enough.'})` sends `POST {api}/api/contact` with exactly that JSON body and **no** `Accept-Language` header;
  - a 201 with `E13-contact-valid.json` gives `{kind:'success', submittedAt}`;
  - a 400 with `E13-contact-invalid.json` (PascalCase keys `Name`, `Email`, `Subject`, `Message`) gives `{kind:'validation', fieldErrors:{name:[…],email:[…],subject:[…],message:[…]}, otherErrors:[]}`;
  - an unknown key `Foo` goes to `otherErrors`;
  - status 0 gives `{kind:'failure'}`;
  - a 500 gives `{kind:'failure'}`;
  - the observable **never errors**.
- [ ] T062 [P] [US5] Write `src/app/services/page.service.spec.ts`, section `getContactInfo`: it sends `GET {d}?filter=contentType:contactUsPage` and returns `items[0]` (`E12-contact-info.json`), and returns `null` for `{"total":0,"items":[]}`.

### Implementation for User Story 5

- [ ] T063 [P] [US5] Create `src/app/models/contact.ts` with these types, verbatim from data-model.md:
  - `ContactRequest { name: string; email: string; subject: string; message: string }`
  - `ContactSuccessResponse { status: 'success'; submittedAt: string }` (HTTP 201)
  - `ContactValidationResponse { status: 'validationError'; errors: Record<string, string[]> }` (HTTP 400; keys are PascalCase in practice)
  - `ContactField = 'name' | 'email' | 'subject' | 'message'`
  - the `ContactResult` union

  Also export `CONTACT_RULES = { name: { min: 2, max: 100 }, subject: { min: 3, max: 150 }, message: { min: 10, max: 2000 } }`, with email "required, valid email".
- [ ] T064 [P] [US5] Create `src/app/models/contact-page.ts`: `SocialLink { platform: string; url: string }`, `ContactPageProps { intro, address, phone, email, officeHours, mapCoordinates: string | null; socialLinks: BlockList<SocialLink> }` and `ContactPage = ContentItem<'contactUsPage', ContactPageProps>`. (`SocialLink` is reused by US7.)
- [ ] T065 [US5] Create `src/app/services/contact.service.ts` with `submit(req): Observable<ContactResult>`, using `ApiService.post<ContactSuccessResponse>('/api/contact', req)`. It maps 201 to success. On `HttpErrorResponse` with status 400 and body `status === 'validationError'`, it maps each key **case-insensitively** to a `ContactField` (research §11, M1), with unknown keys going to `otherErrors`. Anything else becomes `failure` (via `catchError`, never rethrowing). Make T061 pass.
- [ ] T066 [US5] Create `src/app/services/page.service.ts` with `getContactInfo(): Observable<ContactPage | null>` (`filters: ['contentType:contactUsPage']`, `items[0] ?? null`). Make T062 pass.
- [ ] T067 [P] [US5] Create `src/app/shared/social-links.ts`, a component with input `links: SocialLink[]`. It renders nothing when empty; otherwise a `<ul>` of external links (`target="_blank" rel="noopener noreferrer"`) labelled with `platform`.
- [ ] T068 [US5] Create `src/app/features/contact/contact-form.ts`, a reactive form component with these validators:
  - `name`: `[Validators.required, Validators.minLength(2), Validators.maxLength(100)]` (validated on the trimmed value);
  - `email`: `[Validators.required, Validators.email]`;
  - `subject`: `[Validators.required, Validators.minLength(3), Validators.maxLength(150)]`;
  - `message`: `[Validators.required, Validators.minLength(10), Validators.maxLength(2000)]`, plus a live counter `n / 2000` (`contact.form.counter`, `aria-live="polite"`).

  Behavior:
  - every field has a `<label for>` and an error `<p id="…-error">` linked with `aria-describedby`, plus `aria-invalid` (FR-034);
  - on submit with invalid fields: mark all as touched, send nothing, and focus the **first** invalid field;
  - states `idle | submitting | success | failure`; Submit is disabled and shows `contact.form.sending` while submitting (FR-031);
  - `success`: show `contact.form.success` (`role="status"`) and `form.reset()`;
  - `validation`: set each server message on its control with `control.setErrors({ server: messages })`, rendered in the **same** error slot as client errors, keep the values (FR-032), and focus the first field with an error;
  - `failure`: show `contact.form.failure` with a Retry button that resubmits the same values (FR-033).

  Client error text uses the `contact.errors.*` keys, with `{min}`/`{max}` taken from `CONTACT_RULES`. Server messages are shown as received.
- [ ] T069 [US5] Create `src/app/features/contact/contact.page.ts`, a page component that loads `PageService.getContactInfo()` with its own `LoadState`. On `ok`, it renders:
  - `<h1>` name and the intro;
  - address, phone (as a `tel:` link), email (as a `mailto:` link) and office hours, each left out when empty;
  - a map link from `parseCoordinates(mapCoordinates)` → `osmLink` (`contact.openMap`, external, new tab), left out when it doesn't parse;
  - `SocialLinks` from `blocks(socialLinks)`.

  `empty` shows `state.contentUnavailable`, and `error` shows an `ErrorBlock`. `ContactForm` always renders, **independent** of the info state.
- [ ] T070 [US5] In `src/app/app.routes.ts`, register `{ path: 'contact', title: 'contact.title', loadComponent: () => import('./features/contact/contact.page') }` and `{ path: 'contact-us', redirectTo: 'contact', pathMatch: 'full' }` (research §10, M4).
- [ ] T071 [P] [US5] Add `src/app/features/contact/contact-form.spec.ts` covering:
  - submitting `J` / `not-an-email` / `Hi` / `short` shows 4 errors, focuses `name` and sends no request;
  - a mocked `validation` result puts the server text under `email` and keeps the values;
  - `success` clears the form;
  - `failure` shows Retry and keeps the values;
  - the button is disabled while submitting;
  - the counter shows `5 / 2000` after typing `hello`.
- [ ] T072 [US5] Check quickstart V10–V13 by hand. After V11, confirm the submission appears in the Umbraco backoffice under Contact Us → Contact Submissions.

**Checkpoint**: US5 works on its own.

---

## Phase 8: User Story 7 - Navigate the site through managed header, footer and home page (Priority: P2)

**Goal**: A header and footer driven entirely by Site Settings (E10) and refreshed on language change, a home page, and redirects for CMS paths.

**Independent Test**: quickstart V9 (nav part) and V14. The header shows the CMS logo and the Home/About links. The footer shows about text, the "Company" column, Twitter/X and Facebook, and the copyright. Switching to Arabic shows الرئيسية / من نحن. `/` shows featured articles and the latest articles. `/does-not-exist` shows not-found.

### Tests for User Story 7

- [ ] T073 [P] [US7] Write `src/app/services/site-settings.service.spec.ts` covering:
  - the first subscription sends `GET {d}?filter=contentType:siteSettings` with `Accept-Language: en-US` and yields `ok` with `items[0]` (`E10-site-settings.json`);
  - a second subscriber in the same language sends **no** new request (`expectNone`; shared per language, FR-024);
  - after `setLang('ar')` exactly one new request goes out with `Accept-Language: ar` (`E10-site-settings-ar.json`);
  - `{"total":0,"items":[]}` gives `empty`;
  - a network error gives `error`.

### Implementation for User Story 7

- [ ] T074 [P] [US7] Create `src/app/models/site-settings.ts`:
  - `LinkBlock { label: string; url: string; openInNewTab: boolean }`
  - `FooterLinkColumn { columnTitle: string; links: BlockList<LinkBlock> }`
  - `SiteSettingsProps { logo: MediaPicker; primaryNavigation: BlockList<LinkBlock>; footerAboutText: RichText | null; footerLinkColumns: BlockList<FooterLinkColumn>; socialLinks: BlockList<SocialLink>; copyrightText: string | null }`
  - `SiteSettings = ContentItem<'siteSettings', SiteSettingsProps>`
- [ ] T075 [US7] Create `src/app/services/site-settings.service.ts` (`providedIn: 'root'`). It exposes `settings: Signal<LoadState<SiteSettings>>` built from `toObservable(LanguageService.lang)` → `switchMap` to `ApiService.getContent({ filters: ['contentType:siteSettings'] })` → `items[0]` → `toLoadState`, with `shareReplay({ bufferSize: 1, refCount: false })`, then `toSignal`. It also has `reload()`. Make T073 pass.
- [ ] T076 [US7] Rebuild `src/app/layout/header.ts` from `SiteSettingsService.settings()`:
  - logo image (`mediaUrl(firstMedia(logo))`, `alt` = `site.name`) linking to `/`, falling back to the `site.name` text while loading, on error, or with no logo;
  - a `<nav aria-label>` with `blocks(primaryNavigation)` rendered through `CmsLink` (internal → router, external → href, `openInNewTab` honored; FR-025);
  - `LanguageSwitcher`;
  - on mobile (below `md`), a menu toggle button with `aria-expanded` / `aria-controls` that closes on navigation and on Escape.

  Remove the temporary `news` link from T036, **unless** the CMS navigation lacks a News item. In that case keep it, using the `nav.news` label, and note it as a content gap in the phase report. Settings loading or errors never block the page.
- [ ] T077 [US7] Build `src/app/layout/footer.ts` from `settings()`:
  - `RichText` `footerAboutText`;
  - `blocks(footerLinkColumns)`, each rendered as a `<h2>` `columnTitle` plus a `<ul>` of `CmsLink` from `blocks(column.links)`;
  - `SocialLinks` from `blocks(socialLinks)`;
  - `copyrightText`.

  **Leave out every empty section entirely** (FR-023), and render nothing extra on load error.
- [ ] T078 [P] [US7] Add `src/app/layout/header.spec.ts` (renders 2 nav links from `E10-site-settings.json`, `/about-us` as a `routerLink`; `aria-expanded` toggles) and `src/app/layout/footer.spec.ts` (renders the "Company" column and 2 social links; with `footerAboutText: null` and `socialLinks: null`, those sections are absent).
- [ ] T079 [US7] Check that language switching re-renders the header and footer in Arabic (`E10-site-settings-ar.json` labels) and that both mirror correctly in RTL.
- [ ] T080 [US7] Confirm CMS link handling end to end: header "About" (`/about-us`) routes inside the app (it needs US6's redirect; until US6 is built it lands on not-found, which is expected), and social links open in a new tab with `rel="noopener noreferrer"`.
- [ ] T081 [US7] Create `src/app/features/home/home.page.ts`:
  - `FeaturedStrip` (reused);
  - a "Latest" section (`news.latest`) loading `NewsService.getArticles({ page: 1, pageSize: 6 })` with its own `LoadState` (loading / empty `noArticlesYet` / error with retry), shown as `ArticleCard`s;
  - a `news.viewAll` link to `/news` (FR-027).

  Featured and latest fail independently.
- [ ] T082 [US7] Register `{ path: '', pathMatch: 'full', title: 'nav.home', loadComponent: () => import('./features/home/home.page') }` as the first route in `src/app/app.routes.ts`.
- [ ] T083 [P] [US7] Add `src/app/features/home/home.page.spec.ts` covering: 6 latest cards render; a featured error doesn't hide the latest section; a "view all" link to `/news` is present.
- [ ] T084 [US7] Check quickstart V9 (navigation) and V14 by hand, and confirm any article is reachable from `/` in 3 clicks or fewer (SC-003).

**Checkpoint**: US7 works on its own, with the full shell in place.

---

## Phase 9: User Story 6 - Learn about the organization (Priority: P3)

**Goal**: `/about` shows the About Us singleton in either language.

**Independent Test**: quickstart V9. Header "About" (`/about-us`) lands on `/about`, which shows the hero "Who we are", the body, and the stats "8+ Articles" and "3 Categories". The Arabic version renders RTL.

### Tests for User Story 6

- [ ] T085 [P] [US6] Extend `src/app/services/page.service.spec.ts` with `getAbout`: it sends `GET {d}?filter=contentType:aboutUsPage`, returns `items[0]` from `E11-about-en.json` (and from `E11-about-ar.json` with `Accept-Language: ar`), and returns `null` for an empty result.

### Implementation for User Story 6

- [ ] T086 [P] [US6] Create `src/app/models/about-page.ts`: `StatItem { label: string; value: string }` (the value is a string, e.g. `"8+"`), `AboutPageProps { heroText: string | null; heroImage: MediaPicker; body: RichText; stats: BlockList<StatItem> }` and `AboutPage = ContentItem<'aboutUsPage', AboutPageProps>`. Add `getAbout(): Observable<AboutPage | null>` to `src/app/services/page.service.ts`. Make T085 pass.
- [ ] T087 [US6] Create `src/app/features/about/about.page.ts`, which loads `getAbout()` with a `LoadState`:
  - `ok`: `<h1>` name, a hero section with `heroText` and `heroImage` (each left out when empty), the `RichText` body, and stats from `blocks(stats)` as a `<dl>` grid of value + label under `about.stats`, left out when empty (FR-028);
  - `empty`: `state.contentUnavailable`;
  - `error`: `ErrorBlock`.

  Re-fetch on language change.
- [ ] T088 [US6] Register `{ path: 'about', title: 'about.title', loadComponent: () => import('./features/about/about.page') }` and `{ path: 'about-us', redirectTo: 'about', pathMatch: 'full' }` in `src/app/app.routes.ts`.
- [ ] T089 [P] [US6] Add `src/app/features/about/about.page.spec.ts` covering: renders 2 stats from `E11-about-en.json`; with `stats: null` and `heroImage: null`, those sections are absent; `null` renders `contentUnavailable`. Then check quickstart V9 by hand.

**Checkpoint**: Every user story works on its own.

---

## Phase 10: Polish & Cross-Cutting Concerns (brief Phase 8)

- [ ] T090 Final route-table check in `src/app/app.routes.ts`, in this order: `''`, `news`, `news/:id`, `about`, `about-us`→`about`, `contact`, `contact-us`→`contact`, `**`. Every feature uses `loadComponent` (lazy).
- [ ] T091 [P] Accessibility pass on every page in both languages:
  - one `<h1>` per page;
  - heading order;
  - visible `focus-visible` rings on all interactive elements;
  - the skip-link works;
  - every `<img>` has a meaningful `alt` (article name, media `name`, or `site.name`);
  - full keyboard navigation through header, filters, pagination and the form (FR-035).

  Fix any issues in place.
- [ ] T092 [P] Responsive pass at 375 px, 768 px and 1280 px for every route in `en` and `ar`: no horizontal scroll, the grid collapses, and the mobile menu works (FR-036, SC-008). Fix any issues in place.
- [ ] T093 [P] Hardcoded-content audit: search `src/app/**/*.html` and the inline templates for literal user-visible text. Everything must be a Transloco key or a CMS field (FR-001, Constitution II). Confirm `en.json` and `ar.json` have identical key sets with a short node one-liner, and record the output.
- [ ] T094 [P] SSR-safety audit: `grep -rn "localStorage\|window\.\|document\." src/app`. Each hit must sit behind `isPlatformBrowser`, the `DOCUMENT` token, or try/catch (Constitution, Technology Constraints).
- [ ] T095 Check performance against SC-004 and SC-005: run `npm run build`, confirm the initial bundle is under the existing 2 MB warning budget and every component style is under 4 kB, and check in DevTools that `/news` and `/news/:id` render their main content within 2 s on a "Fast 4G" throttle.
- [ ] T096 Update `README.md` with: prerequisites (backend at `http://localhost:25050`), `npm start` / `npm test` / `npm run build`, a link to `specs/001-news-portal-frontend/quickstart.md`, and the known backend gaps G2 and M5 from `research.md`.

---

## Phase 11: Verification (brief Phase 9)

- [ ] T097 Run `npm run build` (production) and `npm test`. Fix every failure until both are green, and record the test count.
- [ ] T098 With the backend running and seeded, walk through every request in `docs/api/postman_collection.json` and write `specs/001-news-portal-frontend/verification.md`: a table of **Postman request → screen/behavior → result** (pass/fail plus notes), covering all 15 requests and quickstart V1–V15.
- [ ] T099 In `verification.md`, explicitly confirm each of these with its observed result:
  - an English-only article in Arabic shows the language-gap state (V7a and V7b);
  - a nonexistent id shows not-found (V5);
  - an empty search shows the empty state (V3);
  - an invalid contact submission shows field errors (V10, V12);
  - a valid submission shows success (V11);
  - the submitted message appears in the backoffice under Contact Us → Contact Submissions.
- [ ] T100 Confirm, and record in `verification.md`, that no content is hardcoded (T093 output) and that no backend file was changed. The backend lives in `D:\studying\umbraco`; run `git -C D:/studying/umbraco status --short` and record the result.
- [ ] T101 Write the final summary in `verification.md`: what is runnable, how to start both apps (`dotnet run` in `D:\studying\umbraco`, `npm start` here), the URLs to open, what was left out, and the open backend gaps (G2 free-text search, M5 `?culture=` ignored).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: none.
- **Foundational (Phase 2)**: needs Setup. **Blocks all stories.**
- **US1 (Phase 3)**: needs Foundational.
- **US2 (Phase 4)**: needs Foundational. It adds to `news.service.ts` and `article.ts`, which US1 creates, so if both run at once, create `article.ts` and `news.service.ts` first (T026 and T027).
- **US3 (Phase 5)**: needs Foundational, plus US1 and US2 for the badge and instant-gap tasks T049 and T050. T048 (switcher) only needs Foundational.
- **US4 (Phase 6)**: needs US1 (it extends `news-list.page.ts`).
- **US5 (Phase 7)**: needs Foundational only.
- **US7 (Phase 8)**: needs Foundational. The home page (T081) reuses `FeaturedStrip` and `ArticleCard` from US1. Language switcher placement (T076) uses T048 from US3.
- **US6 (Phase 9)**: needs Foundational, and US5's `page.service.ts` (T066). If built first, it creates `page.service.ts` itself.
- **Polish (Phase 10)** and **Verification (Phase 11)**: after every story.

### Story completion order (priority, then dependencies)

`Setup → Foundational → US1 → US2 → US3 → US4 → US5 → US7 → US6 → Polish → Verification`

### Within each story

Tests first (they should fail), then models, then the service (make the tests pass), then components, then the route, then the manual quickstart check.

## Parallel Opportunities

- **Setup**: T002, T003, T004 and T005 in parallel after T001.
- **Foundational**: T007–T014 (models and util helpers, separate files) all in parallel. T020–T023 in parallel. T015 → T017 → T019 run in sequence.
- **US1**: T025, T026, T028, T029, T030 and T031 in parallel, then T032. T034 and T035 in parallel.
- **US2**: T038, T040 and T041 in parallel, then T039, then T042.
- **US4**: T052, T054 and T055 in parallel, then T053 and T056.
- **US5**: T061, T062, T063, T064 and T067 in parallel, then T065 and T066, then T068 and T069.
- **US7**: T073 and T074 in parallel, then T075, then T076 and T077, then T078 and T083 in parallel.
- **Across stories** (after Foundational): US5 (contact) and US7 (shell) don't touch US1's files and can run alongside US1 and US2.

### Parallel Example: User Story 1

```text
Task: "T025 news.service.spec.ts getArticles/getFeatured"
Task: "T026 models/article.ts"
Task: "T028 shared/media-url.pipe.ts"
Task: "T029 features/news/article-card.ts + spec"
Task: "T030 shared/pagination.ts + spec"
Task: "T031 features/news/featured-strip.ts"
```

### Parallel Example: User Story 5

```text
Task: "T061 contact.service.spec.ts"
Task: "T062 page.service.spec.ts getContactInfo"
Task: "T063 models/contact.ts"
Task: "T064 models/contact-page.ts"
Task: "T067 shared/social-links.ts"
```

---

## Implementation Strategy

### MVP first (US1)

1. Phase 1 Setup, then Phase 2 Foundational. **Stop and report** (brief Phase 1).
2. Phase 3 US1. Check V1. This is the MVP: a working, paged, newest-first news list with featured articles.

### Incremental delivery

1. Add US2 (detail), then US3 (Arabic and language gap). This completes all P1 stories, and the site is readable in both languages.
2. Add US4 (filters), US5 (contact) and US7 (CMS shell and home). These are the P2 stories.
3. Add US6 (About, P3).
4. Polish, then Verification (`verification.md`).

At each brief-phase boundary (see the mapping table above), stop, report what changed plus test results, and wait for confirmation.

---

## Notes

- `[P]` means a different file with no dependency on unfinished tasks.
- Update the `en.json` and `ar.json` keys in the same task that adds the label.
- Seed ids change whenever the backend is re-seeded. Re-check them in `docs/api/samples/README.md` before the manual checks.
- Commit after each task or logical group, on branch `001-news-portal-frontend`.
- Never change backend files (`D:\studying\umbraco`). Record gaps in `research.md` instead.
