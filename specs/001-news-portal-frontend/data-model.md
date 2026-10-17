# Data Model: News Portal Public Frontend

**Source of truth**: [docs/api/samples/](../../docs/api/samples/README.md) (re-captured 2026-10-17 after the backend was re-seeded), with [docs/api/05-api-reference.md](../../docs/api/05-api-reference.md) as the written contract. These are
the TypeScript shapes the frontend models, under `src/app/models/`. Field names match the JSON exactly.
Only fields the UI uses are required in the types. Anything nullable in a capture is typed `| null`.

## Shared Delivery API shapes (`models/delivery-api.ts`)

| Type | Shape | Notes |
|---|---|---|
| `PagedResult<T>` | `{ total: number; items: T[] }` | Every list endpoint (E1–E6, E10–E12). `total: 0, items: []` is a valid empty result |
| `ContentRoute` | `{ path: string; queryString: string \| null; startItem: { id: string; path: string } }` | Not used for routing (we route by id) |
| `ContentItem<TContentType extends string, TProps>` | `{ id: string; contentType: TContentType; name: string; createDate: string; updateDate: string; route: ContentRoute; properties: TProps; cultures?: Record<string, ContentRoute> }` | `cultures` keys seen: `en-US`, `ar`. Present on list items **and** detail. Helper `availableLangs(item): Lang[]` maps `en-US → en` and `ar → ar` |
| `MediaItem` | `{ id: string; name: string; mediaType: string; url: string; extension: string \| null; width: number \| null; height: number \| null; focalPoint: unknown \| null; crops: unknown[]; properties: Record<string, unknown> }` | `url` is relative (`/media/…`) and is prefixed with `apiBaseUrl` |
| `MediaPicker` | `MediaItem[] \| null` | Single pickers use `[0]` |
| `RichText` | `{ markup: string; blocks: unknown[] }` | Rendered through `[innerHTML]` (sanitized) |
| `BlockList<T>` | `{ items: { content: BlockContent<T>; settings: null }[] } \| null` | Helper `blocks(list): T[]` |
| `BlockContent<T>` | `{ contentType: string; id: string; name: string; properties: T }` | |

## Content entities

### Article (`models/article.ts`), contentType `newsArticle` (E1, E3–E8)

| Field | Type | Required in UI | Notes |
|---|---|---|---|
| `id` | `string` (GUID) | yes | Route param for `/news/:id` |
| `name` | `string` | yes | Title |
| `createDate` | `string` (ISO) | yes | Tie-break only |
| `properties.urlSlug` | `string` | no | Not used for routing (see research §10) |
| `properties.category` | `CategoryRef \| null` | yes | Expanded one level: `{ id, name, contentType: 'newsCategory', route, properties }` |
| `properties.summary` | `string` | yes | 50–300 characters (backend rule) |
| `properties.body` | `RichText` | detail only | |
| `properties.featuredImage` | `MediaPicker` | yes | Mandatory in the CMS, but handle `null` |
| `properties.gallery` | `MediaPicker` | no | `null` in all seed items |
| `properties.publishedDate` | `string` (ISO, no zone) | yes | Server sort key (`sort=publishedDate:desc`) |
| `cultures` | `Record<string, ContentRoute>` | yes | Drives the "English only" badge and the instant `languageGap` on a language switch |
| `properties.author` | `string \| null` | no | Left out when empty |
| `properties.tags` | `string[] \| null` | no | Exact, case-sensitive filter values |
| `properties.isFeatured` | `boolean` | no | |
| `properties.featuredOrder` | `number` | no | Featured sort key |

**Ordering rule**: Both are done by the server. The list uses `sort=publishedDate:desc`. Featured uses `sort=featuredOrder:asc`, with a stable client tie-break by `createDate` ascending only when two items share a `featuredOrder`.

### Category (`models/category.ts`), contentType `newsCategory` (E2)

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | Value for `filter=category:{id}` |
| `name` | `string` | Localized |
| `properties.colour` | `string \| null` | Optional accent, e.g. `#2563eb` |
| `properties.icon` | `MediaPicker \| string \| null` | `null` in the seed. Unused in v1 |

The response order is the editors' sort order. Display it unchanged.

### Site Settings (`models/site-settings.ts`), contentType `siteSettings`, singleton (E10)

| Field | Type | Notes |
|---|---|---|
| `properties.logo` | `MediaPicker` | Header logo. Alt text is the site name from translations |
| `properties.primaryNavigation` | `BlockList<LinkBlock>` | |
| `properties.footerAboutText` | `RichText \| null` | |
| `properties.footerLinkColumns` | `BlockList<FooterLinkColumn>` | |
| `properties.socialLinks` | `BlockList<SocialLink>` | |
| `properties.copyrightText` | `string \| null` | |

Block types:
- `LinkBlock` (`contentType: 'link'`): `{ label: string; url: string; openInNewTab: boolean }`
- `FooterLinkColumn` (`'footerLinkColumn'`): `{ columnTitle: string; links: BlockList<LinkBlock> }`
- `SocialLink` (`'socialLink'`): `{ platform: string; url: string }`

### About Page (`models/about-page.ts`), contentType `aboutUsPage`, singleton (E11)

`name` (title), `properties.heroText: string | null`, `properties.heroImage: MediaPicker`, `properties.body: RichText`, `properties.stats: BlockList<StatItem>`.
`StatItem` (`'statItem'`): `{ label: string; value: string }`. The value is a string (e.g. `"8+"`).

### Contact Page (`models/contact-page.ts`), contentType `contactUsPage`, singleton (E12)

`name` (title), `properties.intro`, `address`, `phone`, `email`, `officeHours`, `mapCoordinates` (`"lat,lng"`), all `string | null`, plus `socialLinks: BlockList<SocialLink>`.

### Contact Message (`models/contact.ts`), E13

| Type | Shape |
|---|---|
| `ContactRequest` | `{ name: string; email: string; subject: string; message: string }` |
| `ContactSuccessResponse` | `{ status: 'success'; submittedAt: string }` (HTTP 201) |
| `ContactValidationResponse` | `{ status: 'validationError'; errors: Record<string, string[]> }` (HTTP 400; keys are PascalCase in practice) |
| `ContactField` | `'name' \| 'email' \| 'subject' \| 'message'` |
| `ContactResult` | `{ kind: 'success'; submittedAt: string } \| { kind: 'validation'; fieldErrors: Partial<Record<ContactField, string[]>>; otherErrors: string[] } \| { kind: 'failure' }` |

**Validation rules** (client mirrors server):

| Field | Rule |
|---|---|
| `name` | required, 2–100 characters (after trim) |
| `email` | required, valid email |
| `subject` | required, 3–150 characters |
| `message` | required, 10–2000 characters. Counter shows `n / 2000` |

## Frontend state types (`models/load-state.ts`)

```text
LoadState<T> =
  | { status: 'loading' }
  | { status: 'ok'; data: T }
  | { status: 'empty' }                         // 200 with items: [] or a missing singleton
  | { status: 'notFound' }                      // 404 that is missing in every language
  | { status: 'languageGap'; availableIn: Lang[] } // missing in the active language: from `cultures`, or 404 + 200 on the no-header retry
  | { status: 'error'; retry: () => void }      // network / 5xx / unexpected
```

`ArticleQuery`: `{ page: number (1-based); pageSize: number (default 20); categoryId?: string; tag?: string }`. It's mirrored in the URL as `?page=&category=&tag=`.

`Lang`: `'en' | 'ar'`. Direction is `rtl` for `ar`, otherwise `ltr`.

### State transitions

- **Language**: `en ⇄ ar` (user switch). Each switch persists the choice, updates `<html lang dir>`, switches Transloco and re-runs all active loads. Detail pages may move `ok → languageGap`.
- **Contact form**: `idle → submitting → (success → idle with a cleared form) | (validation → idle, values kept, errors shown) | (failure → idle, values kept, retry available)`. Submit is disabled while `submitting`.
