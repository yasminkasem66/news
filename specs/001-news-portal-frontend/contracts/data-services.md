# Contract: Data Services → Backend Requests

How every frontend data service maps to a verified backend request. Components MUST use only
these methods (Constitution VII). The unit tests for each method assert exactly the request shown
here. `{api}` = `environment.apiBaseUrl` (dev: `http://localhost:25050`); `{d}` =
`{api}/umbraco/delivery/api/v2/content`. Every `{d}` request carries `Accept-Language: <active lang>`
(added by `acceptLanguageInterceptor`). The header value is the backend culture: `en-US` for
English (`en` matches nothing, research M6) and `ar` for Arabic. A request marked with the
`LANGUAGE_OVERRIDE` context token uses that language instead of the active one. `?culture=` is never used because the backend ignores it (research M5).

## NewsService

| Method | Returns | Request(s) | Endpoint | Response mapping |
|---|---|---|---|---|
| `getArticles(q: ArticleQuery)` | `Observable<PagedResult<Article>>` | `GET {d}?filter=contentType:newsArticle[&filter=category:{categoryId}][&filter=tags:{tag}]&sort=publishedDate:desc&skip={(page-1)*pageSize}&take={pageSize}` | E1, E3, E4, E5 | Response passed through unchanged: `{ total, items }`. `total: 0` → empty state |
| `getFeatured()` | `Observable<Article[]>` | `GET {d}?filter=contentType:newsArticle&filter=isFeatured:1&sort=featuredOrder:asc` | E6 | `items`, stable tie-break by `createDate` asc. `[]` hides the section |
| `getArticle(id)` | `Observable<ArticleResult>` (`ok \| notFound \| languageGap`) | `GET {d}/item/{id}`. On **404 while the active language is `ar`** only: the same `GET {d}/item/{id}` with `Accept-Language: en-US` (via `LANGUAGE_OVERRIDE` = `en`). This is the documented "no language qualifier" retry, made explicit because a browser fills in its own default `Accept-Language` when the header is omitted | E7, E8, E9 | 200 → `ok` (keeps `cultures`). 404 + retry 200 → `languageGap(availableLangs(retry))`. 404 + retry 404 → `notFound`. 404 in `en` → `notFound` with no retry. Other errors propagate |
| `getCategories()` | `Observable<Category[]>` | `GET {d}?filter=contentType:newsCategory` | E2 | `items` in response order |

## SiteSettingsService

| Method | Returns | Request | Endpoint | Mapping |
|---|---|---|---|---|
| `settings` (signal) / `settings$` | `LoadState<SiteSettings>` | `GET {d}?filter=contentType:siteSettings` | E10 | `items[0]` or `empty`. Fetched once per language (`shareReplay`) and re-fetched on language change |

## PageService

| Method | Returns | Request | Endpoint | Mapping |
|---|---|---|---|---|
| `getAbout()` | `Observable<AboutPage \| null>` | `GET {d}?filter=contentType:aboutUsPage` | E11 | `items[0] ?? null` (`null` → friendly empty state) |
| `getContactInfo()` | `Observable<ContactPage \| null>` | `GET {d}?filter=contentType:contactUsPage` | E12 | `items[0] ?? null` |

## ContactService

| Method | Returns | Request | Endpoint | Mapping |
|---|---|---|---|---|
| `submit(req: ContactRequest)` | `Observable<ContactResult>` (never errors) | `POST {api}/api/contact`, JSON body `{ name, email, subject, message }`, `Content-Type: application/json`. **No** `Accept-Language` | E13 | 201 → `success`. 400 with `status: 'validationError'` → `validation`, keys matched case-insensitively to fields (unknown keys go to `otherErrors`). Anything else (0, 5xx, malformed body) → `failure` |

## Error classification (shared `toLoadState` operator)

| HTTP outcome | Classification |
|---|---|
| 200 with `items.length === 0` (or missing singleton) | `empty` (never an error) |
| 404 on `/item/{id}` | Resolved by `getArticle` as `notFound` / `languageGap` |
| 400 on `/api/contact` | `validation` |
| Status 0 (network), 5xx, or unexpected 4xx | `error`, with a retry callback |
