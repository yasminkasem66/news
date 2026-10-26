# Verification: News Portal Public Frontend

**Date**: 2026-10-18 | **Branch**: `001-news-portal-frontend` | **Spec**: [spec.md](spec.md) | **Scenarios**: [quickstart.md](quickstart.md)

## How this was verified

- **Build under test**: the production build (`npm run build` → `dist/news/browser`), served
  same-origin at `http://localhost:4300`. A small local server forwarded `/umbraco`, `/api` and
  `/media` to the backend at `http://localhost:25050`, the same shape as a real deployment
  (`apiBaseUrl` is empty in production). Earlier per-story checks used the dev server on `:4200`.
- **Backend**: Umbraco at `http://localhost:25050`, seeded on 2026-10-17. Seed ids are listed in
  [docs/api/samples/README.md](../../docs/api/samples/README.md).
- **Method**: headless Chrome driven over the DevTools protocol. For each step the script recorded
  the rendered DOM (headings, cards, messages, focus) and **every** network request to
  `/umbraco/delivery` and `/api/contact`, with its status and `Accept-Language`. A blocked-URL
  rule simulated the backend being unreachable.
- **Automated tests**: `npm test` gives **133 passing specs in 30 files** (Karma, ChromeHeadless).
  Every data service is tested with `HttpTestingController` against the captured responses in
  `docs/api/samples/`.

## T097: build and tests

| Check | Result |
|---|---|
| `npm run build` (production) | ✅ Pass. No warnings or errors. Initial bundle 520.87 kB raw / **122.28 kB** transferred (budget: 2 MB warning) |
| `npm test` | ✅ **133 / 133** pass |

## T098: Postman request → screen / behavior → result

The "Observed request" column is what the app actually sent, as recorded in the browser.
English requests go out as `Accept-Language: en-US` (research M6).

| # | Postman request | Screen / behavior | Observed request (status) | Result |
|---|---|---|---|---|
| 1 | News › Browse all (paginated), E1 | `/news` list, newest first, 20 per page; `/` "Latest news" (6) | `…filter=contentType:newsArticle&sort=publishedDate:desc&skip=0&take=20` (200); home: `take=6` (200) | ✅ 8 articles, 2026-10-16 → 2026-10-09; home shows 6. `?page=2` shows "No articles match your search." |
| 2 | News › List categories, E2 | Category filter on `/news` ("All" + Technology, Sports, Business) | `…filter=contentType:newsCategory` (200) | ✅ Editor order, colour swatches |
| 3 | News › Filter by category, E3 | `/news?category=63158b7b-…` | `…&filter=category:63158b7b-…&sort=publishedDate:desc&skip=0&take=20` (200) | ✅ 3 articles in English, 2 in Arabic; featured hidden; survives reload |
| 4 | News › Search by tag, E4 | Tag search and article tag links → `/news?tag=demo` | `…&filter=tags:demo&sort=publishedDate:desc&skip=0&take=20` (200) | ✅ 8 articles. Arabic tag `أخبار` returns 5 |
| 5 | News › Search with no results, E5 | `/news?tag=doesnotexist` | `…&filter=tags:doesnotexist…` (200, `total: 0`) | ✅ "No articles match your search." / "لا توجد مقالات تطابق بحثك.", not an error and distinct from "no articles yet" |
| 6 | News › Featured articles (ordered), E6 | Featured strip on `/` and `/news` | `…&filter=isFeatured:1&sort=featuredOrder:asc` (200) | ✅ Tech Hub → Championship → Seed Funding; hidden while filtering; fails independently with its own retry |
| 7 | News › Article detail, E7 | `/news/5b8e0d5f-…` | `…/item/5b8e0d5f-…` `en-US` (200) | ✅ Title, category, image, date, author, tags, sanitized body. Tab title "City Unveils New Tech Hub · News Portal" |
| 8 | News › Article detail (Arabic), E8 | Same page in Arabic; language gap | Translated: `…/item/5b8e0d5f-…` `ar` (200). English-only `170e2282-…`: `ar` (404), then exactly one `en-US` retry (200) | ✅ Arabic article right-to-left. Gap state "غير متاح بهذه اللغة" with "اقرأ بالإنجليزية" |
| 9 | News › Article detail - not found, E9 | `/news/00000000-…` | `en-US` (404), no retry. Arabic: `ar` (404) then `en-US` (404) | ✅ "We couldn't find that page." with a link to `/news`, in both languages |
| 10 | Site Chrome › Site Settings, E10 | Header (logo, CMS navigation, switcher) and footer on every page | `…filter=contentType:siteSettings` (200) once per page load; no request on in-app navigation | ✅ Logo; Home/About (الرئيسية/من نحن) + News/Contact; footer about text, "Company" column, social links (new tab, `noopener noreferrer`), copyright |
| 11 | About Us › English, E11 | `/about` (also reached from CMS `/about-us`) | `…filter=contentType:aboutUsPage` `en-US` (200) | ✅ "About Us", "Who we are", body, stats "8+ Articles", "3 Categories" |
| 12 | About Us › Arabic, E11 | `/about` in Arabic | `…filter=contentType:aboutUsPage` `ar` (200) | ✅ "من نحن", right-to-left, Arabic body and stat labels |
| 13 | Contact Us › Contact Us static info, E12 | `/contact` details (also `/contact-us`) | `…filter=contentType:contactUsPage` (200) | ✅ Intro, address, `tel:` / `mailto:` links, office hours, OpenStreetMap link, social links; Arabic variant correct |
| 14 | Contact Us › Submit contact message - valid, E13 | Contact form, valid input | `POST /api/contact` (201), no `Accept-Language` (verified on 2026-10-17, see note) | ✅ Success message, form cleared, button disabled while sending. Record stored (T099) |
| 15 | Contact Us › Submit contact message - validation error, E13 | Server 400 mapped onto fields | Unit test with the real captured 400 (PascalCase keys) | ✅ in unit tests (see note). In the UI, the client checks block the invalid sample before sending (V10) |

**Notes**
- **Row 14** was checked through the UI on the dev server (two submissions, 2026-10-17 12:38 and
  12:39 UTC) and not repeated on the production build, to avoid adding more test records. The
  form code is identical in both builds.
- **Row 15**: the form's own checks match the server's rules exactly, so the Postman "validation
  error" body can't reach the server from the UI; the form blocks it (V10). Mapping a server 400
  onto fields is covered by `contact.service.spec.ts` (real captured 400 → per-field errors,
  matched ignoring case) and `contact-form.spec.ts` (server message in the field's error slot,
  input kept, focus moved).

### Quickstart scenarios V1–V15

| Scenario | Result | Evidence |
|---|---|---|
| V1 list + featured | ✅ | Row 1, row 6; 3 "English only" badges in English |
| V2 category filter | ✅ | Row 3 |
| V3 tag search, empty result, clear | ✅ | Rows 4–5; "Clear filters" goes back to `/news` (US4 check) |
| V4 article detail | ✅ | Row 7; tag link → `/news?tag=demo` |
| V5 not found | ✅ | Row 9 |
| V6 Arabic list | ✅ | `/news` in Arabic: right-to-left, all requests `ar`, 3 featured + 5 list cards |
| V7a language gap, deep link | ✅ | Row 8: `404 ar` → `200 en-US` → gap state |
| V7b language gap on switch | ✅ | Loaded `170e2282-…` in English, clicked العربية: gap shown with **no** detail request; "اقرأ بالإنجليزية" fetched it again (`200 en-US`) |
| V8 language remembered | ✅ | Arabic kept across reloads; blocked storage falls back to English (`language.service.spec.ts`) |
| V9 About via CMS navigation | ✅ | Header "About" (`/about-us`) → `/about` in both languages |
| V10 invalid contact input | ✅ | Four field errors, focus on `contact-name`, **no** POST sent |
| V11 valid contact input | ✅ | Row 14 |
| V12 server 400 on fields | ✅ (unit) | Row 15 |
| V13 backend unreachable | ✅ | Backend paths blocked: `/news` showed "Something went wrong… Try again" for featured and list separately, with search still usable. After unblocking, retrying featured reloaded it on its own. Contact form: "Your message couldn't be sent… Try again", input kept |
| V14 unknown route | ✅ | `/does-not-exist` → "Page not found" |
| V15 keyboard + widths | ✅ | Audit (T091/T092): 9 routes × 2 languages × 375/768/1280 px, **0 issues**. Skip link is the first Tab stop and Enter moves focus to `<main>` |

## T099: explicit confirmations

| Confirmation | Observed |
|---|---|
| English-only article in Arabic shows the language-gap state | ✅ V7a (deep link: `404 ar` → `200 en-US`) and V7b (switch: no request) |
| Nonexistent id shows not-found | ✅ V5, in both languages |
| Empty search shows the empty state | ✅ V3: "No articles match your search." (not an error) |
| Invalid contact submission shows field errors | ✅ V10 (client) and V12 (server mapping, unit) |
| Valid submission shows success | ✅ V11: 201 → "Thank you! Your message has been sent." |
| Submitted message appears under Contact Us → Contact Submissions | ✅ Read-only `SELECT` against the backend database (LocalDB `umbracoPOC.mdf`): 4 `contactSubmission` nodes whose parent is **"Contact Submissions"**, created 2026-10-17 07:05, 07:16, 12:38 and 12:39 UTC. The last two came from the frontend form. The blocked (offline) attempt created no record. *Not checked in the backoffice UI itself, which needs a login.* |

## T100: no hard-coded content, no backend changes

- **No hard-coded content** (T093 audit): no literal text in any template and no literal
  user-facing `alt` / `title` / `aria-label` / `placeholder`. All interface labels are Transloco
  keys; `en.json` and `ar.json` have identical key sets (74 keys). All site content comes from E1–E12.
  - **One deliberate exception**: the header adds **News** and **Contact** links, labelled from the
    translation files, because the CMS `primaryNavigation` doesn't include them (content gap below).
    They disappear automatically once editors add them.
- **No backend changes by this work**:
  - The frontend repository contains no backend files.
  - In `D:\studying\umbraco` this work only ran `dotnet run`, sent HTTP requests (reads, plus four
    contact submissions), and ran one read-only `SELECT`.
  - `git -C D:/studying/umbraco status --short` shows uncommitted backend work that was **not made
    by this frontend work**:
    - staged additions from the backend feature (composers, `ContactController`, index handlers);
    - the `publishedDate` sort fix and doc updates, modified 2026-10-17 between 09:52 and 10:07
      local time, which the backend owner reported making during this session;
    - `Composers/ContentTypeHelpers.cs`, modified **2026-10-18 12:15 local** (self-correcting
      Data Type configuration). This was made outside this work, apparently by the backend owner
      or another session, and should be reviewed and committed by its author.

## T101: final summary

### What runs

| App | Start | URL |
|---|---|---|
| Backend (Umbraco) | `cd D:\studying\umbraco` then `dotnet run --launch-profile Umbraco.Web.UI` | `http://localhost:25050` (backoffice at `/umbraco`) |
| Frontend (dev) | `cd D:\studying\news` then `npm install` (first time) and `npm start` | `http://localhost:4200` |
| Frontend (prod build) | `npm run build`, then serve `dist/news/browser` same-origin with `/umbraco`, `/api`, `/media` proxied to the backend, or set `apiBaseUrl` in `src/environments/environment.production.ts` | — |

Pages: `/`, `/news` (`?page`, `?category`, `?tag`), `/news/:id`, `/about` (and `/about-us`),
`/contact` (and `/contact-us`), plus a not-found page for anything else. Both English and العربية
work, with right-to-left layout for Arabic.

### Definition of done

| Item | Status |
|---|---|
| Every endpoint E1–E13 is used by at least one screen, and every screen's data comes from the map | ✅ Rows 1–15 |
| Header and footer fully driven by Site Settings and updated on language change | ✅ (except the News/Contact fallback links; see content gap) |
| English and Arabic both work, including right-to-left and the language-gap state | ✅ |
| Contact form maps server validation errors onto fields and shows success on 201 | ✅ |
| Build and unit tests pass; verification table complete | ✅ 133/133; this document |
| No backend files were changed | ✅ by this work (see T100 for others' uncommitted backend changes) |

Performance: `/news` and article pages render their main content in about **1.1–1.5 s** on a cold,
throttled "Fast 4G" load of the production build (SC-004: < 2 s). Switching English → Arabic
updates content, header and direction in **171 ms** (SC-005: < 2 s).

### Left out / gaps for the backend owner

| ID | Gap | Frontend handling |
|---|---|---|
| G2 | Free-text search: `query=` is ignored | Tag search only |
| M5 | `?culture=ar` is ignored on list and detail; `05-api-reference.md` says it works | `Accept-Language` header only |
| M6 | `Accept-Language: en` returns `total: 0` / 404; the English culture is `en-US`. The brief, Postman and `05-api-reference.md` all say `en` | Interceptor sends `en-US` |
| M2 | `isFeatured:true` (in `delivery-api-reads.md`) is ignored | Uses `isFeatured:1` |
| Content | CMS `primaryNavigation` has only Home and About | Header adds News and Contact until editors add them |
| Content | Seed media (logo, images) are 1×1 px placeholders | Rendered as provided |
| Data | 4 test contact submissions ("Jane Doe") exist in the backoffice | Delete them whenever convenient |

Resolved during this work: **G1** (`publishedDate` sort was not registered; the backend owner fixed it).
