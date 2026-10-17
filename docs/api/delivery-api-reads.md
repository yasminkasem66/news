# Contract: Public Read Endpoints (Umbraco Content Delivery API)

All read access (User Stories 1, 2, 3, 4, 5, 6) goes through Umbraco's built-in Content Delivery
API — no custom read controller is written for this feature (Constitution Principle II). Base path
is Umbraco's standard `/umbraco/delivery/api/v2/content`. Every request may carry an
`Accept-Language` header (or `culture` query parameter) of `en` (default) or `ar`; content not
published for the requested culture is not returned (spec FR-017).

## Browse / filter / search News Articles (User Story 1)

```
GET /umbraco/delivery/api/v2/content
    ?filter=contentType:newsArticle
    &filter=category:<newsCategory content key>      (optional)
    &filter=tags:<keyword>                            (optional, matches User Story 1 tag search)
    &sort=publishedDate:desc
    &skip=<n>&take=<n>
```

Free-text title/summary search uses the Delivery API's built-in query parameter (`query=` /
full-text search over indexed fields) in addition to or instead of `filter=tags:`.

- 200, empty `items: []` → spec Scenario 4/5 (no results / no articles yet), not an error.
- Each item exposes: title (name), category (expanded content-picker reference), summary, body,
  featuredImage, gallery, publishedDate, author, tags — per data-model.md.

## News Article detail (User Story 2)

```
GET /umbraco/delivery/api/v2/content/item/{id}
GET /umbraco/delivery/api/v2/content/item/{path}
```

(Verified against the running app: the by-id/by-path detail route is `/content/item/{...}`, not
`/content/{...}` — a plain `/content/{id}` 404s.)

- 200 with full article payload for a published article.
- 404 for a non-existent id, or an article that exists only as Draft (spec Scenarios 2-3).

## Featured Articles (User Story 3)

```
GET /umbraco/delivery/api/v2/content
    ?filter=contentType:newsArticle
    &filter=isFeatured:true
    &sort=featuredOrder:asc
    &sort=createDate:asc
```

- 200, empty `items: []` when nothing is featured — never auto-substituted (spec Scenario 2).

## Site Settings (User Story 4)

```
GET /umbraco/delivery/api/v2/content
    ?filter=contentType:siteSettings
```

Singleton — callers take `items[0]`. Returns logo, primaryNavigation, footerAboutText,
footerLinkColumns, socialLinks, copyrightText per data-model.md.

## About Us (User Story 5)

```
GET /umbraco/delivery/api/v2/content
    ?filter=contentType:aboutUsPage
```

Singleton — callers take `items[0]`. Returns title (name), heroText, heroImage, body, stats[].

## Contact Us static info (User Story 6)

```
GET /umbraco/delivery/api/v2/content
    ?filter=contentType:contactUsPage
```

Singleton — callers take `items[0]`. Returns title/intro (name + `intro`), address, phone, email,
officeHours, mapCoordinates (if set), socialLinks (if set). `Contact Submissions` and any
`contactSubmission` nodes underneath are never returned by any Delivery API query (FR-015) — the
container is non-routed and excluded from the public content index.
