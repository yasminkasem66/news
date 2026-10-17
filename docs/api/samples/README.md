# Captured backend responses

Re-captured on 2026-10-17 from `http://localhost:25050` after the backend was re-seeded and the
`publishedDate` sort was registered. Each file is the raw response body. Models in
`src/app/models/` are derived from these files (Constitution Principle I). The written contract is
[../05-api-reference.md](../05-api-reference.md), copied from the backend repo
(`docs/requirements/05-api-reference.md`).

Seed ids used below:
- Article available in both languages: `5b8e0d5f-b1a4-4518-816d-371f1300bbf9` (City Unveils New Tech Hub).
- English-only article: `170e2282-6ae0-4f0d-b6f1-b080d6c10d2f` (Regional Bank Reports Strong Quarter).
- Category Technology: `63158b7b-56d6-4fea-a957-262ec4fad8a3`.

| File | Request | Status | Notes |
|---|---|---|---|
| `E1-articles.json` | `filter=contentType:newsArticle&sort=publishedDate:desc&skip=0&take=20` | 200 | `total: 8`, newest published first (10-16 down to 10-09) |
| `E1-articles-ar.json` | E1 with `Accept-Language: ar` | 200 | `total: 5`. Only articles with an `ar` culture |
| `E1-articles-page2-take3.json` | E1 with `skip=3&take=3` | 200 | Items 4–6. `total` is still 8 |
| `E2-categories.json` | `filter=contentType:newsCategory` | 200 | Technology, Sports, Business (editor order) |
| `E3-by-category.json` | `+filter=category:63158b7b-…&sort=publishedDate:desc` | 200 | 3 items |
| `E4-by-tag.json` | `+filter=tags:demo&sort=publishedDate:desc` | 200 | 8 items (every seed article is tagged `demo`, `news`) |
| `E5-no-results.json` | `+filter=tags:doesnotexist` | 200 | `{"total":0,"items":[]}` |
| `E6-featured.json` | `+filter=isFeatured:1&sort=featuredOrder:asc` | 200 | featuredOrder 1, 2, 3 |
| `E7-article-detail.json` | `/item/5b8e0d5f-…` | 200 | Has a `cultures` map (`ar`, `en-US`) |
| `E8-article-detail-ar.json` | E7 with `Accept-Language: ar` | 200 | Arabic name and category (تقنية) |
| `E8-article-detail-ar-language-gap.json` | `/item/170e2282-…` with `ar` | **404** | Empty body |
| `E8-language-gap-retry-default.json` | `/item/170e2282-…` with no language header (curl) | 200 | Proves "exists, not translated" |
| `E9-not-found.json` | `/item/00000000-…` | **404** | Empty body, identical to the language-gap 404 |
| `E10-site-settings.json` / `-ar.json` | `filter=contentType:siteSettings` | 200 | Block List shape `{ items: [{ content, settings }] }` |
| `E11-about-en.json` / `-ar.json` | `filter=contentType:aboutUsPage` | 200 | |
| `E12-contact-info.json` / `-ar.json` | `filter=contentType:contactUsPage` | 200 | `mapCoordinates: "30.0444,31.2357"` |
| `E13-contact-valid.json` | `POST /api/contact` valid body | **201** | Creates one real submission in the backoffice |
| `E13-contact-invalid.json` | `POST /api/contact` invalid body | **400** | Error keys are PascalCase (`Name`, `Email`, …), as documented |
| `X-culture-query-ar.json` | E1 with `?culture=ar` (no header) | 200 | **Ignored**: 8 items, English names. The same is true on `/item/{id}?culture=ar`. Use the header |
| `X-fulltext-query.json` | `query=Marathon` | 200 | **Ignored**: all 8 returned. No free-text search |
| `X-featured-true.json` | `filter=isFeatured:true` | 200 | **Ignored**: all 8 returned. Use `isFeatured:1` |
| `X-accept-language-en.json` | E1 with `Accept-Language: en` | 200 | **`total: 0`**: the English culture is `en-US` (M6). Send `Accept-Language: en-US` |
