# News Portal Demo — Angular Frontend

Build the public Angular frontend for the News Portal Demo against the existing Umbraco headless backend. Execute this brief phase by phase. At the end of every phase, stop, summarize what changed, and wait before starting the next phase.

## Required reference files (must exist before Phase 0)

Place these inside this Angular project under `docs/api/`:

| File | Purpose |
|---|---|
| `docs/api/postman_collection.json` | Source of truth for every endpoint, query string, header, and example request body |
| `docs/api/delivery-api-reads.md` | Contract for all read (GET) endpoints |
| `docs/api/contact-submission.md` | Contract for the contact form POST |
| `docs/api/data-model.md` | Field names (aliases), types, mandatory rules, and length limits |

If any file is missing, stop and report it. Never invent an endpoint, query parameter, or response field that is not in these files or in a real response captured from the running backend.

## Ground rules

1. **The backend is fixed.** Do not modify the backend. If a needed endpoint or field does not exist, record it in the Phase 0 report as a gap — do not work around it with invented data.
2. **No hardcoded content.** Header, footer, About Us, Contact Us info, categories, and articles all come from the API.
3. **Follow the existing project.** Detect the Angular version, component style (standalone vs. NgModule), state approach, styling approach, folder layout, lint/format config, and test setup in Phase 0, and follow them. Add a dependency only when the project clearly needs it.
4. **Typed end to end.** Every API response is modeled with a TypeScript interface derived from a real captured response, not from guesses.
5. **Security.** Render rich-text article bodies through Angular's built-in sanitization. Do not bypass it (`bypassSecurityTrust*`) unless a captured response proves it is required, and report it if so.
6. One phase at a time. No skipping ahead.

## Backend facts (from the reference files)

- Base URL: `{{baseUrl}}` = `http://localhost:25050` (confirm against the backend's `launchSettings.json`). Browser CORS is already allowed for `http://localhost:4200`.
- All reads are `GET` under `/umbraco/delivery/api/v2/content`. No API key is required (public access is on).
- Detail route is `/umbraco/delivery/api/v2/content/item/{id}` — not `/content/{id}`.
- Language is selected with the `Accept-Language` header: `en` (default) or `ar`. Content not published for the requested culture is **not returned** and detail requests for it return **404** — there is no fallback to English.
- A list with no matches returns **200** with `total: 0` and `items: []` — not an error.
- Site Settings, About Us, and Contact Us are singletons: take `items[0]`.
- The only write is `POST /api/contact` (JSON). Success is `201 { status: "success", submittedAt }`. Validation failure is `400 { status: "validationError", errors: { <field>: [messages] } }`.
- Submitted contact messages are never readable through the API.

## Endpoint map (every task in this brief traces to one of these)

| # | Feature | Method | Path + query | Postman request |
|---|---|---|---|---|
| E1 | Article list, paginated, newest first | GET | `/umbraco/delivery/api/v2/content?filter=contentType:newsArticle&sort=publishedDate:desc&skip=0&take=20` | News > Browse all (paginated) |
| E2 | Category list | GET | `/umbraco/delivery/api/v2/content?filter=contentType:newsCategory` | News > List categories |
| E3 | Articles by category | GET | `…?filter=contentType:newsArticle&filter=category:{categoryId}` | News > Filter by category |
| E4 | Articles by tag (search) | GET | `…?filter=contentType:newsArticle&filter=tags:{keyword}` | News > Search by tag |
| E5 | Empty result handling | GET | `…&filter=tags:doesnotexist` | News > Search with no results |
| E6 | Featured articles, ordered | GET | `…?filter=contentType:newsArticle&filter=isFeatured:1&sort=featuredOrder:asc` | News > Featured articles (ordered) |
| E7 | Article detail | GET | `/umbraco/delivery/api/v2/content/item/{articleId}` | News > Article detail |
| E8 | Article detail in Arabic / language gap | GET | same as E7 with `Accept-Language: ar` | News > Article detail (Arabic) |
| E9 | Article not found | GET | `/content/item/00000000-0000-0000-0000-000000000000` → 404 | News > Article detail - not found |
| E10 | Site Settings (header + footer) | GET | `…?filter=contentType:siteSettings` | Site Chrome > Site Settings |
| E11 | About Us | GET | `…?filter=contentType:aboutUsPage` (+ `Accept-Language: ar` variant) | About Us > English / Arabic |
| E12 | Contact Us static info | GET | `…?filter=contentType:contactUsPage` | Contact Us > Contact Us static info |
| E13 | Submit contact message | POST | `/api/contact` | Contact Us > Submit … valid / validation error |

Notes that must be resolved in Phase 0 rather than assumed:
- The Postman collection and `delivery-api-reads.md` differ slightly on the featured filter (`isFeatured:1` vs `isFeatured:true`) and the featured tie-break sort (`createDate:asc`). The Postman request was verified against a running instance — use it, and confirm by calling it.
- `delivery-api-reads.md` mentions a built-in full-text `query=` parameter, but no Postman request exercises it. Treat **tag search (E4) as the verified search**. Only add free-text search if the parameter is proven to work against the running backend; otherwise report it as a gap.
- Whether the article's `category` arrives expanded or as a reference must be confirmed from a real response (an `expand` parameter may be needed).

---

## Phases

### Phase 0 — Discovery, response capture, and plan

1. Inspect this project (Angular version, structure, conventions, routing, styling, test runner, existing environment files) and report what you found.
2. Confirm all four reference files exist under `docs/api/`.
3. With the backend running, call **every** request in the endpoint map (E1–E13) and save the real responses as fixtures under `docs/api/samples/` (one file per endpoint, plus `E8` and `E11` in Arabic). Record status codes, including 404 and 400 cases.
4. From the captured responses, record: the response envelope shape, how Name/route/id appear, how properties are nested, how media (logo, featuredImage, gallery, heroImage) is represented and whether URLs are relative, how rich text (`body`, `footerAboutText`) is represented, how Block List values (navigation, footer columns, social links, stats) are represented, and how `category` and `tags` appear.
5. List gaps and mismatches between the contracts and real responses.
6. Output a full step-by-step plan: route table, component/service tree, interface list, and open questions.

**Stop. Do not write application code until the plan is confirmed.**

### Phase 1 — Foundation

1. Add environment configuration with `apiBaseUrl` (development: `http://localhost:25050`; production: placeholder to be set at deploy time).
2. Create typed models in a `models/` area from the captured fixtures: the Delivery API envelope, article, category, site settings (including Block List item types), about page, contact page, and the contact request/response/validation-error types.
3. Create an `ApiService` (or equivalent) wrapping `HttpClient` with the base URL and query-string building so no component builds URLs by hand.
4. Add a language service holding the current language (`en` | `ar`), persisted across reloads (wrap storage access in try/catch), and an HTTP interceptor that sends `Accept-Language` on every Delivery API request.
5. Add a global error-handling approach that distinguishes 404, 400, and network failures.
6. Apply language direction: set `lang` and `dir` (`rtl` for Arabic) on the document whenever the language changes.

**Stop. Report what changed.**

### Phase 2 — Data services (one per backend area)

Each service uses only endpoints from the endpoint map, returns typed models, and has unit tests using `HttpTestingController` that assert URL, query string, and headers.

1. **NewsService** — `getArticles({ skip, take, categoryId?, tag? })` (E1, E3, E4, E5), `getFeatured()` (E6), `getArticle(id)` (E7, E8, E9), `getCategories()` (E2).
2. **SiteSettingsService** — `getSettings()` (E10), returning `items[0]`; handle the missing-singleton case.
3. **PageService** — `getAbout()` (E11) and `getContactInfo()` (E12), each returning `items[0]`.
4. **ContactService** — `submit(message)` (E13), mapping a `201` to a success result and a `400` to a typed per-field error object.

**Stop. Report what changed and test results.**

### Phase 3 — Application shell (header, footer, language switcher)

Source: **E10**.

1. Header: logo (from `logo`), primary navigation (from `primaryNavigation`; each item has a label, a link, and an open-in-new-tab flag), and a language switcher (English / العربية).
2. Footer: `footerAboutText`, `footerLinkColumns` (column title + links), `socialLinks`, and `copyrightText`. Omit any optional section that is empty rather than rendering a blank block.
3. Load Site Settings once per language and share it across the app; re-fetch when the language changes.
4. Switching language re-fetches data for the current page. If the current content does not exist in the new language, show the "not available in this language" state from Phase 4, not a crash.
5. Navigation links from the backend must route correctly: internal links through the Angular router, external links as normal anchors honoring open-in-new-tab.

**Stop. Report what changed.**

### Phase 4 — News list, category filter, tag search, featured

Sources: **E1–E6**.

1. `/news` page lists articles newest first with pagination (`skip`/`take`, page size 20). Each card shows featured image, title, category, summary, published date, and author if present.
2. Category filter built from E2, with an "All" option. Selecting a category calls E3; the selection and page are reflected in the URL query string so it can be shared and survives reload.
3. Tag search input calls E4. Clearing the filters restores the full list.
4. Empty states (a `200` with `items: []`) show a clear message for "no articles yet" vs. "no results match your search" and are not treated as errors.
5. Featured section (E6) shown above the list in featured order, hidden entirely when empty — never auto-filled with other articles.
6. Loading and error states for every request; the page stays usable if the featured request fails independently of the list.
7. In Arabic, the list contains only articles published in Arabic; an empty Arabic list shows the empty state, not an error.

**Stop. Report what changed.**

### Phase 5 — Article detail

Sources: **E7, E8, E9**.

1. `/news/:id` loads E7 and shows title, category, featured image, published date, author, tags, body (rich text, sanitized), and gallery if present.
2. A `404` shows a not-found state with a link back to `/news`.
3. A `404` that occurs only because the article has no Arabic version (the same id succeeds in English) shows a "not available in this language" message with an action to switch language — distinguish it from a truly missing article where practical, and report in the plan how that is detected.
4. Tags link back to the list filtered by that tag.
5. Set the document title from the article title.

**Stop. Report what changed.**

### Phase 6 — About Us

Source: **E11**.

1. `/about` renders the page name (title), `heroText`, `heroImage`, `body` (sanitized rich text), and `stats` (label + value blocks). Omit empty optional sections.
2. Works in both languages; handle the empty-singleton case with a friendly message.

**Stop. Report what changed.**

### Phase 7 — Contact Us (info + form)

Sources: **E12, E13**.

1. `/contact` shows the page title/intro, address, phone, email, office hours, map coordinates (a link or embed derived from `"lat,lng"` — no API key required), and social links. Omit empty fields.
2. Contact form with fields `name`, `email`, `subject`, `message`, with client-side validation mirroring the server: name 2–100 chars, valid email, subject 3–150 chars, message 10–2000 chars. Show a character counter on the message field.
3. On submit, call E13:
   - `201` → show a success confirmation, reset the form, and prevent duplicate submits while the request is in flight.
   - `400` → map each entry in `errors` onto its field and display the server's message next to it. Keep what the user typed.
   - Network/other failure → a general error message and a way to retry, with the form values preserved.
4. Server errors never replace client validation; both are shown the same way.
5. The form is accessible: labels, `aria-describedby` for errors, focus moved to the first invalid field.

**Stop. Report what changed.**

### Phase 8 — Home page and routing polish

1. `/` home page: featured articles (E6) and the latest articles (E1, small page size) with a link to `/news`.
2. Finalize the route table: `/`, `/news`, `/news/:id`, `/about`, `/contact`, and a wildcard not-found route. Lazy-load feature areas if the project's conventions support it.
3. Accessibility and RTL review of every page in both languages: reading order, `dir` handling, focus states, image alt text, keyboard navigation.
4. Responsive layout check at mobile, tablet, and desktop widths.

**Stop. Report what changed.**

### Phase 9 — Verification

1. Run the production build and the full unit test suite; fix failures.
2. With the backend running and seeded, walk through every request in `postman_collection.json` and confirm the corresponding UI behavior. Produce a table: Postman request → screen/behavior → result.
3. Confirm explicitly: English-only article in Arabic (language-gap state), nonexistent id (not-found state), empty search (empty state), invalid contact submission (field errors), valid contact submission (success), and that a submitted message appears in the backoffice under Contact Us → Contact Submissions.
4. Confirm no content is hardcoded and no backend change was made.
5. Final summary: what is runnable, how to start both apps, URLs to open, and anything left out or any backend gaps found.

## Definition of done

- Every endpoint E1–E13 is used by at least one screen, and every screen's data comes from an endpoint in the map.
- Header and footer are fully driven by Site Settings and update on language change.
- English and Arabic both work, including RTL layout and the language-gap state.
- The contact form maps server validation errors onto fields and shows success on `201`.
- Build and unit tests pass; the Phase 9 verification table is complete.
- No backend files were changed.
