# Quickstart & Validation: News Portal Public Frontend

## Prerequisites

- Node 20+ with dependencies installed (`npm install`).
- The Umbraco backend running at `http://localhost:25050` and seeded. Check with:
  `curl -s "http://localhost:25050/umbraco/delivery/api/v2/content?filter=contentType:siteSettings"`, which should print `{"total":1,…}`.
- CORS for `http://localhost:4200` (already configured on the backend).

## Run

```bash
npm start          # ng serve → http://localhost:4200
npm test           # Karma/Jasmine unit tests (data services + component states)
npm run build      # production build
```

## Validation scenarios

These scenarios become the Phase 9 verification table (one row per Postman request). Seed ids
come from [docs/api/samples/](../../docs/api/samples/README.md) (re-captured 2026-10-17). They change
whenever the backend is re-seeded, so re-check them there before testing.

| # | Steps | Expected | Spec |
|---|---|---|---|
| V1 | Open `/news` | 8 articles, starting "City Unveils New Tech Hub" (published 2026-10-16) and ending "Youth League…" (2026-10-09). Featured strip above shows Tech Hub → Championship → Seed Funding. "Regional Bank", "New Data Centre" and "Youth League" carry the "English only" badge | US1, FR-004, FR-010 |
| V2 | Pick category "Technology" | 3 articles: Tech Hub, AI Adoption, New Data Centre. URL has `?category=63158b7b-56d6-4fea-a957-262ec4fad8a3`. Reload keeps the filter | US4, FR-008 |
| V3 | Search tag `demo`, then `doesnotexist` | 8 results, then "no results match your search" (not an error). Clear restores the full list | US4, FR-009 |
| V4 | Open `/news/5b8e0d5f-b1a4-4518-816d-371f1300bbf9` | Title, category, image, date, author, tags, body. Tab title = article title. Click tag `news` → `/news?tag=news` | US2 |
| V5 | Open `/news/00000000-0000-0000-0000-000000000000` | Not-found state with a link to `/news` | FR-014 |
| V6 | Switch to العربية on `/news` | RTL layout, Arabic header and footer, 5 articles only | US3, FR-020–022 |
| V7a | In Arabic, open `/news/170e2282-6ae0-4f0d-b6f1-b080d6c10d2f` directly (deep link) | "Not available in this language" with a "Read in English" action, distinct from V5. The network tab shows a 404 followed by one retry with no `Accept-Language` | US3, FR-015 |
| V7b | In English, open that same article, then switch to العربية | The language-gap state appears immediately, from `cultures`, with no extra detail request | US3, FR-015 |
| V8 | Reload in Arabic | Still Arabic. In a private window with storage blocked, the site falls back to English without errors | FR-019 |
| V9 | Header nav "About" (`/about-us`) | Lands on `/about`: hero, body, stats "8+ Articles", "3 Categories" | US6, US7 |
| V10 | `/contact`, submit `J` / `not-an-email` / `Hi` / `short` | Client errors on all 4 fields, focus on Name, no request sent | US5, FR-030, FR-034 |
| V11 | Submit valid data (e.g. Jane Doe / jane@example.com / Hello there / 10+ char message) | Success message, form cleared, button disabled while sending. The record appears in the backoffice under Contact Us → Contact Submissions | US5, FR-031 |
| V12 | Get past client validation and receive a server 400 (e.g. temporarily relax a validator in dev tools, or use the service unit test) | Server messages appear under the matching fields, input kept | FR-032 |
| V13 | Stop the backend, submit the form | General error with Retry, input kept. List pages show error states with Retry | FR-011, FR-033 |
| V14 | Visit `/does-not-exist` | Not-found page | FR-026 |
| V15 | Keyboard-only pass of every page in both languages, at 375 / 768 / 1280 px widths | Visible focus, logical order, no horizontal scroll | FR-035, FR-036 |

## Definition-of-done checks

- `npm run build` and `npm test` pass.
- `grep` the templates for hardcoded content: only Transloco keys and CMS fields appear.
- `git status` shows no backend files changed (the backend lives outside this repository).
