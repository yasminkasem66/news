# API Reference — News Portal Demo

Written for: frontend engineers integrating against this backend (Angular SPA at `localhost:4200`
or any other client).

Every example on this page is a real response captured from a running instance, not a mockup.
Base URL during local development is `http://localhost:25050` (`https://localhost:44304` also
works) — see `Properties/launchSettings.json` if you're running the backend yourself.

A ready-to-import Postman collection with every request below is at
[`specs/001-news-portal-demo/postman_collection.json`](../../specs/001-news-portal-demo/postman_collection.json).

## Before you start

- **No authentication today.** `Umbraco:CMS:DeliveryApi:PublicAccess` is `true` — every read below
  is unauthenticated. If that changes later, reads would need an API key header
  (`Api-Key: <key>`); there is nothing to configure for that today.
- **No rate limiting** on the contact-submission endpoint (deliberate, documented decision — see
  `specs/001-news-portal-demo/spec.md` Clarifications). Don't rely on the backend to throttle
  abuse; that's out of scope for this demo.
- **Language selection**: every read endpoint accepts either an `Accept-Language: ar` header or a
  `?culture=ar` query parameter. Omit both for English (the default). See "Bilingual content" below
  — this is the part most likely to surprise you.
- **Pagination**: `skip` / `take` query parameters on list endpoints. No fixed page size is
  enforced server-side; pick what suits your UI.
- All read endpoints are `Umbraco.Cms.Api.Delivery` — Umbraco's own Content Delivery API, not a
  custom backend route. The only custom route in this whole feature is the contact-submission
  `POST` at the bottom of this page.

## Bilingual content — read this before building article detail pages

A request for content that exists but was never translated into the requested language returns
**the exact same 404** (same status, empty body, no distinguishing header) as a request for an id
that doesn't exist at all. This is native Umbraco Delivery API behavior, not a bug we can patch
without adding a second read endpoint (which this project's architecture deliberately avoids — see
`specs/001-news-portal-demo/spec.md` FR-017).

**If you navigate to a detail page by clicking something from a list response**, you already have
what you need: every list item's `cultures` object (see the News list example below) tells you
which languages it has, before you navigate. Don't show an Arabic-language link for an
English-only article in the first place.

**If you only have an id** (a deep link, a bookmark, a page refresh) and get a 404, retry the same
id with no language qualifier:

```
GET /umbraco/delivery/api/v2/content/item/{id}         (Arabic)   → 404
GET /umbraco/delivery/api/v2/content/item/{id}         (no header) → 200  = exists, not translated
                                                        (no header) → 404  = id is genuinely invalid
```

---

## News — browse, filter, search

```
GET /umbraco/delivery/api/v2/content
    ?filter=contentType:newsArticle
    &filter=category:{categoryId}      (optional)
    &filter=tags:{keyword}             (optional)
    &sort=publishedDate:desc
    &skip=0&take=20
```

| Query param | Required | Notes |
|---|---|---|
| `filter=contentType:newsArticle` | Yes | Always required — this is how every content type is scoped |
| `filter=category:{categoryId}` | No | `{categoryId}` is a News Category's `id` (get it from the categories list below) |
| `filter=tags:{keyword}` | No | Exact match against one of the article's tags, e.g. `tags:demo` |
| `sort=publishedDate:desc` | No | Default example; also supports `sort=featuredOrder:asc` (see Featured below) |
| `skip`, `take` | No | Pagination |

Headers: `Accept-Language: ar` (optional, see above).

**Example response** (`?filter=contentType:newsArticle&sort=publishedDate:desc&take=1`):

```json
{
  "total": 8,
  "items": [
    {
      "contentType": "newsArticle",
      "name": "City Unveils New Tech Hub",
      "createDate": "2026-10-17T07:04:49.997Z",
      "updateDate": "2026-10-17T07:04:50.088Z",
      "route": {
        "path": "/news/city-unveils-new-tech-hub/",
        "queryString": null,
        "startItem": { "id": "288cea39-01ee-454a-81f6-66071cb3649d", "path": "site-root" }
      },
      "id": "5b8e0d5f-b1a4-4518-816d-371f1300bbf9",
      "properties": {
        "urlSlug": "city-unveils-new-tech-hub",
        "category": {
          "contentType": "newsCategory",
          "id": "63158b7b-56d6-4fea-a957-262ec4fad8a3",
          "name": "Technology",
          "route": { "path": "/news/technology/", "queryString": null, "startItem": { "...": "..." } },
          "properties": {}
        },
        "summary": "City Unveils New Tech Hub - a demo summary long enough to satisfy the fifty to three hundred character minimum required for News Article summaries in this showcase site.",
        "body": {
          "markup": "<p>City Unveils New Tech Hub. This is placeholder body copy for the News Portal Demo, seeded automatically so every endpoint returns real data.</p>",
          "blocks": []
        },
        "featuredImage": [
          { "id": "aaad4c8e-b9d3-4648-9e8f-a0098aa52748", "name": "Article Photo", "mediaType": "Image",
            "url": "/media/agdowhf0/article-photo.png", "extension": "png", "width": 1, "height": 1,
            "bytes": 69, "focalPoint": null, "crops": [], "properties": {} }
        ],
        "gallery": null,
        "publishedDate": "2026-10-16T07:04:49.995562",
        "author": "Newsroom Staff",
        "tags": ["demo", "news"],
        "isFeatured": true,
        "featuredOrder": 1
      },
      "cultures": {
        "en-US": { "path": "/news/city-unveils-new-tech-hub/", "queryString": null, "startItem": { "...": "..." } },
        "ar": { "path": "/news/city-unveils-new-tech-hub-عربي/", "queryString": null, "startItem": { "...": "..." } }
      }
    }
  ]
}
```

Note `category` and `featuredImage` are already expanded to full objects — you don't need a
separate request or an `expand=` query param for either. `cultures` is the map referenced above:
if a key is missing (e.g. no `"ar"` key), that article has no Arabic translation.

**No results**: `?filter=contentType:newsArticle&filter=tags:doesnotexist` → `200` with
`{"total":0,"items":[]}`. Never an error.

**List News Categories** (to get a `categoryId` for the filter above):

```
GET /umbraco/delivery/api/v2/content?filter=contentType:newsCategory
```

Each category's `properties` has `icon` and `colour`; its own `id` is what you pass as
`filter=category:{id}` above.

## News — article detail

```
GET /umbraco/delivery/api/v2/content/item/{id}
GET /umbraco/delivery/api/v2/content/item/{path}
```

⚠️ The route is `/content/item/{id}`, **not** `/content/{id}` — the latter 404s regardless of
whether the id is valid.

- `200` → same shape as one item in the list response above.
- `404` → either the id doesn't exist, or it exists but isn't published in the requested
  language — see "Bilingual content" above for how to tell them apart.
- `404` → also returned for a Draft-only (unpublished) article.

## News — featured articles

```
GET /umbraco/delivery/api/v2/content
    ?filter=contentType:newsArticle
    &filter=isFeatured:1
    &sort=featuredOrder:asc
```

Returns the curated set in editor-assigned order (verified: `featuredOrder` 1, 2, 3 in that
order). Returns `{"total":0,"items":[]}` when nothing is currently featured — never
auto-substituted with other articles.

## Site Settings (header / footer / nav)

```
GET /umbraco/delivery/api/v2/content?filter=contentType:siteSettings
```

Singleton — always take `items[0]`.

```json
{
  "total": 1,
  "items": [
    {
      "contentType": "siteSettings",
      "id": "9e7081c7-bdba-4952-925f-b7f0e4673533",
      "properties": {
        "logo": [
          { "id": "c150321f-5cc7-4072-9ad0-65655431449a", "name": "Site Logo", "mediaType": "Image",
            "url": "/media/sd2bm33o/site-logo.png", "width": 1, "height": 1, "bytes": 69, "properties": {} }
        ],
        "primaryNavigation": {
          "items": [
            { "content": { "contentType": "link", "id": "ef71a43c-0cca-40d3-b400-c95f674c6372",
                           "name": "n/a", "properties": { "label": "Home", "url": "/", "openInNewTab": false } },
              "settings": null },
            { "content": { "contentType": "link", "id": "119a03a0-9ec9-41ce-b821-c2eb599c3f7c",
                           "name": "n/a", "properties": { "label": "About", "url": "/about-us", "openInNewTab": false } },
              "settings": null }
          ]
        },
        "footerAboutText": { "markup": "<p>News Portal Demo is a headless Umbraco showcase site.</p>", "blocks": [] },
        "footerLinkColumns": {
          "items": [
            { "content": { "contentType": "footerLinkColumn", "id": "d6b242cb-5f6b-4a5a-be62-093fba90b226",
                           "name": "n/a",
                           "properties": {
                             "columnTitle": "Company",
                             "links": {
                               "items": [
                                 { "content": { "contentType": "link", "id": "8246e8ce-c41f-4961-a634-45b5721a1001",
                                               "name": "n/a", "properties": { "label": "About", "url": "/about-us", "openInNewTab": false } },
                                   "settings": null }
                               ]
                             }
                           } },
              "settings": null }
          ]
        },
        "socialLinks": {
          "items": [
            { "content": { "contentType": "socialLink", "id": "f8286f32-2ca0-4069-b686-29d6e5528d19",
                           "name": "n/a", "properties": { "platform": "Twitter/X", "url": "https://x.com/example" } },
              "settings": null },
            { "content": { "contentType": "socialLink", "id": "8562317c-0947-4db1-b240-69dbdb2fa30e",
                           "name": "n/a", "properties": { "platform": "Facebook", "url": "https://facebook.com/example" } },
              "settings": null }
          ]
        },
        "copyrightText": "(c) News Portal Demo"
      }
    }
  ]
}
```

Every repeatable group (`primaryNavigation`, `footerLinkColumns`, `socialLinks`, and the nested
`links` inside each footer column) comes back as `{ "items": [ { "content": { ...properties }, "settings": null } ] }`
— drill into `.content.properties` for the actual fields. `footerLinkColumns` nests one more
level (a column has its own `links.items[].content.properties`).

## About Us

```
GET /umbraco/delivery/api/v2/content?filter=contentType:aboutUsPage
```

Singleton — take `items[0]`.

```json
{
  "total": 1,
  "items": [
    {
      "contentType": "aboutUsPage",
      "name": "About Us",
      "id": "5542654a-6bb9-4bf2-8e1b-f484965c5089",
      "properties": {
        "heroText": "Who we are",
        "heroImage": [
          { "id": "4ecc8a52-b9a7-459b-92a1-5317f055596c", "name": "About Us Hero", "mediaType": "Image",
            "url": "/media/1vaiv4go/about-us-hero.png", "width": 1, "height": 1, "properties": {} }
        ],
        "body": { "markup": "<p>News Portal Demo exists to showcase a fully headless Umbraco content architecture.</p>", "blocks": [] },
        "stats": {
          "items": [
            { "content": { "contentType": "statItem", "id": "6d4f48f5-be21-4276-b12b-e67006e9aa8b",
                           "name": "n/a", "properties": { "label": "Articles", "value": "8+" } }, "settings": null },
            { "content": { "contentType": "statItem", "id": "9399874f-0110-45ab-be42-da108d94b60e",
                           "name": "n/a", "properties": { "label": "Categories", "value": "3" } }, "settings": null }
          ]
        }
      },
      "cultures": { "en-US": { "...": "..." }, "ar": { "...": "..." } }
    }
  ]
}
```

`"name"` doubles as the page title. `stats` is `{"items":[]}` when no stats blocks were configured
— not an error, just an empty collection to render conditionally.

## Contact Us — static info

```
GET /umbraco/delivery/api/v2/content?filter=contentType:contactUsPage
```

Singleton — take `items[0]`.

```json
{
  "total": 1,
  "items": [
    {
      "contentType": "contactUsPage",
      "name": "Contact Us",
      "id": "c879e237-adf2-434a-9add-b7ffdf7c77fc",
      "properties": {
        "intro": "We would love to hear from you.",
        "address": "123 Demo Street, Cairo",
        "phone": "+1-555-0100",
        "email": "hello@newsportaldemo.test",
        "officeHours": "Sun-Thu, 9am-5pm",
        "mapCoordinates": "30.0444,31.2357",
        "socialLinks": {
          "items": [
            { "content": { "contentType": "socialLink", "id": "422f504a-4a75-449d-bd98-e3a572cf419c",
                           "name": "n/a", "properties": { "platform": "Twitter/X", "url": "https://x.com/example" } },
              "settings": null }
          ]
        }
      }
    }
  ]
}
```

`mapCoordinates` is a plain `"lat,lng"` string (not an object) — split on the comma if you're
feeding it to a map component. `socialLinks` is absent/empty when not configured, same pattern as
everywhere else.

---

## Contact submission — the one write endpoint

This is a plain custom ASP.NET Core controller, **not** part of the Delivery API — it's the one
named exception in this project's architecture (Delivery API handles every read; this is the one
write a read-only API structurally can't do). It is never readable back — a submission is stored
for backoffice review only and will never appear in any Delivery API response.

```
POST /api/contact
Content-Type: application/json
```

**Request body**:

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "subject": "Hello there",
  "message": "This is a test message that is definitely long enough."
}
```

| Field | Required | Validation |
|---|---|---|
| `name` | Yes | 2–100 characters |
| `email` | Yes | Valid email format |
| `subject` | Yes | 3–150 characters |
| `message` | Yes | 10–2000 characters |

**Success — `201 Created`**:

```json
{ "status": "success", "submittedAt": "2026-10-17T07:05:21.5767644Z" }
```

No id or echoed data — you don't get anything back to reference later; a successful response is
confirmation enough that it landed.

**Validation failure — `400 Bad Request`** (one or more fields invalid):

```json
{
  "status": "validationError",
  "errors": {
    "Name": ["The field Name must be a string with a minimum length of 2 and a maximum length of 100."],
    "Email": ["The Email field is not a valid e-mail address."],
    "Subject": ["The field Subject must be a string with a minimum length of 3 and a maximum length of 150."],
    "Message": ["The field Message must be a string with a minimum length of 10 and a maximum length of 2000."]
  }
}
```

`errors` keys match the request field names (PascalCase, matching the .NET model). Nothing is
stored when validation fails — don't expect a partial record to clean up.

**No rate limiting** — see "Before you start" above. Submit as fast as you want during
development; there's no backend-enforced cooldown to work around.

---

## Known limitations (so you don't file these as bugs)

- Article-detail 404s are ambiguous between "doesn't exist" and "not translated" — see "Bilingual
  content" above for the supported workaround.
- There's no API key / auth layer yet (`PublicAccess: true`). Don't build around an auth flow that
  doesn't exist; ask before assuming one is coming.
- The contact endpoint has no spam/rate protection by design for this demo.
