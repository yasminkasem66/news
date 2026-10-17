# Phase 1 Data Model: News Portal Demo

Realizes the Key Entities from [spec.md](spec.md) as Umbraco Document Types / Data Types. Field
names, mandatoriness, and length limits below must stay consistent with the spec's field tables;
this document adds only the Umbraco-specific "how" (property editor, culture variance, Delivery
API registration) that the spec deliberately leaves out.

All content types below are **culture-variant at the content-type level** (so every property is
entered once per culture, per Constitution Principle IV and research.md §3), except where a
property is explicitly marked "invariant" (shared across all cultures — used only for values that
are not language-dependent, such as a toggle or a picker reference).

## Site Root (`siteRoot`)

Not itself requested through the Delivery API. Exists only so every other node in this feature has
a single, purpose-built ancestor (research.md §5). No content-editable properties.

- Allowed at root: yes (the only type allowed at root for this feature's tree)
- Allowed children: `News` folder, `Site Settings`, `About Us`, `Contact Us`

## News (`newsFolder`)

A plain, non-routed organizational folder. No content-editable properties.

- Allowed children: `News Category`, `News Article`

## News Category (`newsCategory`)

| Property alias | Umbraco editor | Variance | Notes |
|---|---|---|---|
| `name` (built-in Name) | — | Variant | Doubles as the spec's "Name" field |
| `icon` | Media Picker (single, no image-type restriction) or Textstring | Invariant | Optional |
| `colour` | Textstring | Invariant | Optional; free-text (e.g. a hex value) |

Display order uses Umbraco's native `sortOrder` (drag-and-drop in the backoffice) — no explicit
property, matches the spec's "Sort Order (native ordering)".

## News Article (`newsArticle`)

| Property alias | Umbraco editor | Variance | Notes |
|---|---|---|---|
| `name` (built-in Name) | — | Variant | Doubles as the spec's "Title" |
| `urlSlug` | Textstring | Variant | Mandatory; unique per culture |
| `category` | Content Picker (constrained to `newsCategory`) | Invariant | Mandatory; single |
| `summary` | Textarea | Variant | Mandatory; 50-300 characters |
| `body` | Rich Text Editor | Variant | Mandatory |
| `featuredImage` | Media Picker (single, image types only) | Invariant | Mandatory |
| `gallery` | Media Picker (multiple, image types only) | Invariant | Optional |
| `publishedDate` | Date Picker | Invariant | Mandatory |
| `author` | Textstring | Variant | Optional |
| `tags` | Tags | Variant | Optional; also registered as a Delivery API filter field (research.md §2) |
| `isFeatured` | Toggle | Invariant | Default off; registered as a Delivery API filter field |
| `featuredOrder` | Numeric (integer) | Invariant | Meaningful only when `isFeatured` is on; registered as a Delivery API sort field |

Delivery API filter/sort registration (research.md §2):

- `category` → `IContentIndexHandler` field, `FieldType.StringRaw`, filter-only (exact match by
  category content key).
- `isFeatured` → `IContentIndexHandler` field, `FieldType.Number` (0/1), filter target for the
  Featured Articles capability (User Story 3).
- `featuredOrder` → included in the same handler's field set as a `FieldType.Number` sort target.
- `tags` → `IContentIndexHandler` field, `FieldType.StringRaw` (multi-value), filter target for
  keyword search (User Story 1); title/summary text search uses the Delivery API's built-in
  full-text query, tags search uses this explicit field.

Featured-set query shape: `filter=contentType:newsArticle&filter=isFeatured:true&sort=featuredOrder
:asc&sort=createDate:asc` — the `createDate` secondary sort gives the tie-break the spec's Edge
Cases leaves "stable but unspecified" a concrete, deterministic rule (oldest-created-first among
ties) without over-specifying it back in the spec itself.

## Site Settings (`siteSettings`, singleton — exactly one instance expected under Site Root)

| Property alias | Umbraco editor | Variance | Notes |
|---|---|---|---|
| `logo` | Media Picker (single, image types only) | Invariant | Mandatory |
| `primaryNavigation` | Block List (block: label, link, open-in-new-tab toggle) | Variant | Repeatable |
| `footerAboutText` | Rich Text Editor | Variant | Optional |
| `footerLinkColumns` | Block List (block: column title + nested link list) | Variant | Repeatable |
| `socialLinks` | Block List (block: platform, URL) | Invariant | Repeatable |
| `copyrightText` | Textstring | Variant | Optional |

## About Us (`aboutUsPage`, singleton)

| Property alias | Umbraco editor | Variance | Notes |
|---|---|---|---|
| `heroText` | Textstring | Variant | Optional |
| `heroImage` | Media Picker (single, image types only) | Invariant | Optional |
| `body` | Rich Text Editor | Variant | Mandatory |
| `stats` | Block List (block: label, value) | Variant | Repeatable, optional |

`name` (built-in) doubles as the spec's "Title".

## Contact Us (`contactUsPage`, singleton)

| Property alias | Umbraco editor | Variance | Notes |
|---|---|---|---|
| `address` | Textstring | Variant | Optional |
| `phone` | Textstring | Invariant | Optional |
| `email` | Textstring | Invariant | Optional |
| `officeHours` | Textstring | Variant | Optional |
| `mapCoordinates` | Textstring (`"lat,lng"`) | Invariant | Optional |
| `socialLinks` | Block List (block: platform, URL) | Invariant | Optional, repeatable |

`name` (built-in) doubles as the spec's "Title/Intro" heading; the intro copy itself lives in a
`intro` Textstring/Textarea property (variant) alongside it.

- Allowed children: `Contact Submissions` (container)

## Contact Submissions (`contactSubmissionsContainer`, non-routed)

Exactly one instance, created by the seeding composer as a child of `Contact Us`. Holds
`Contact Submission` nodes. Never exposed through the Delivery API (Principle II / FR-015) — the
custom controller writes to it via `IContentService` directly; it is not registered as culture-
variant content at all (submissions are stored as-submitted, invariant).

## Contact Submission (`contactSubmission`, invariant — created only by the `POST /api/contact` controller, never through the backoffice "create" action)

| Property alias | Umbraco editor | Notes |
|---|---|---|
| `name` (built-in Name, reused as the submitter's name) | — | Mandatory; 2-100 characters |
| `email` | Textstring | Mandatory; valid email format |
| `subject` | Textstring | Mandatory; 3-150 characters |
| `message` | Textarea | Mandatory; 10-2000 characters |

`submittedDate` uses the node's built-in create date rather than a duplicate property.

## Validation summary (maps 1:1 to spec FR-013 and the field tables above)

| Field | Rule |
|---|---|
| Contact `name` | required, 2-100 chars |
| Contact `email` | required, valid email format |
| Contact `subject` | required, 3-150 chars |
| Contact `message` | required, 10-2000 chars |
| Article `summary` | required, 50-300 chars |
| Article `urlSlug` | required, unique per culture |
