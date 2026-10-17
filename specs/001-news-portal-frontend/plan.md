# Implementation Plan: News Portal Public Frontend

**Branch**: `001-news-portal-frontend` | **Date**: 2026-10-17 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-news-portal-frontend/spec.md`, brief `TASK-frontend.md`

## Summary

Build the public, bilingual (English/Arabic, RTL) Angular site for the News Portal Demo on the
fixed Umbraco headless backend:
- Home, news list (category filter, tag search, featured), article detail, About Us, and Contact
  Us with a validated form.
- Header and footer driven by Site Settings.

Discovery against the running backend (brief Phase 0, done in this planning run) captured every
endpoint into `docs/api/samples/`. All requests were **re-captured on 2026-10-17** after the backend
was re-seeded. The backend's reference is now in `docs/api/05-api-reference.md`.
- **G1 is resolved**: `sort=publishedDate:desc` works, so lists use server-side sort and paging
  exactly as in Postman.
- **G2 remains**: full-text search does not work, so only tag search ships.
- The language-gap state uses the `cultures` map when it is known (list or switch). On a deep-link
  404 it retries the request with no language header, the backend's documented approach.

## Technical Context

**Language/Version**: TypeScript ~6.0 (strict), Angular 22 (standalone components, zone.js change detection)

**Primary Dependencies**:
- Already installed: `@angular/router`, `@angular/forms` (reactive), `@angular/common/http`,
  Transloco 8, Tailwind CSS 4, `@lucide/angular`, ngx-sonner, RxJS 7.8.
- **No new runtime dependencies.**

**Storage**: Browser `localStorage` for the language preference only (key `news.lang`, guarded)

**Testing**: Karma + Jasmine (`ng test`). `HttpTestingController` for services. Fixtures from `docs/api/samples/`

**Target Platform**: Modern evergreen browsers, client-rendered SPA served by `ng serve` (dev, :4200)

**Project Type**: Single-project web frontend (the backend is a separate, fixed system)

**Performance Goals**: Main content visible within 2 s on broadband (SC-004). Language switch re-render within 2 s (SC-005)

**Constraints**:
- No backend changes.
- Only endpoints E1–E13.
- No hardcoded CMS content.
- Sanitized rich text.
- Initial bundle under the existing 2 MB warning budget.
- Component styles under 4 kB (existing budget), so Tailwind utilities go in templates.

**Scale/Scope**:
- Content: 8 English articles, 5 Arabic, 3 categories (seed). Server paging means the archive size doesn't affect the frontend.
- 6 routes plus 2 redirects, about 15 components, 5 services.

## Constitution Check

*GATE: checked before Phase 0 research and re-checked after Phase 1 design.*

| Principle | Status | Evidence |
|---|---|---|
| I. Backend Contract Fidelity | ✅ Pass | Every service method maps to E1–E13 ([contracts/data-services.md](contracts/data-services.md)). Models come from real captures ([docs/api/samples/](../../docs/api/samples/README.md)). The open gap G2 and mismatches M2/M4/M5 are recorded, not faked ([research.md](research.md#gaps-and-mismatches-report-to-the-backend-owner-not-worked-around-with-invented-data)) |
| II. Content Comes From the CMS | ✅ Pass | Header, footer, pages and articles come from the API. Interface labels live in `public/i18n/{en,ar}.json` |
| III. Bilingual and RTL by Default | ✅ Pass | Interceptor sends `Accept-Language`. No English fallback in lists. Language-gap state. `lang`/`dir` sync. Tailwind logical utilities (`ms-`/`me-`/`ps-`/`pe-`/`start-`/`end-`, `rtl:` variants) |
| IV. Safe Rendering | ✅ Pass | `[innerHTML]` with the default sanitizer. Captures show plain markup, so no `bypassSecurityTrust*` is used. New-tab links get `rel="noopener noreferrer"` |
| V. Resilient, Accessible UI | ✅ Pass | `LoadState<T>` per section. Featured and list fail independently. Empty optional sections are left out. Form ARIA and focus rules. Responsive pass in Phase 8 |
| VI. Tested Data Layer | ✅ Pass | One spec per service asserting URL, query string and headers, plus 404/400/empty/network cases. Build and tests pass at each phase |
| VII. Follow the Project, Keep It Simple | ✅ Pass | Standalone components, signals, Transloco, Tailwind, Lucide. No new dependencies. Server-side sort and paging (G1 fixed) remove the earlier client-side workaround |

**Post-design re-check**: ✅ Still passes. The design adds no dependency and no backend access
outside the services. The language-gap retry is the backend's documented approach.

## Project Structure

### Documentation (this feature)

```text
specs/001-news-portal-frontend/
├── plan.md              # This file
├── research.md          # Phase 0: discovery findings, decisions, gaps G1 (resolved)/G2, M1–M5
├── data-model.md        # Phase 1: TypeScript models from captured responses
├── quickstart.md        # Phase 1: run + validation scenarios V1–V15
├── contracts/
│   ├── data-services.md # Service method → backend request mapping
│   └── ui-routes.md     # Public routes, query params, screen states
├── checklists/requirements.md
└── tasks.md             # Created by /speckit-tasks
docs/api/samples/        # Captured responses (fixtures), with README index
```

### Source Code (repository root)

```text
src/
├── environments/
│   ├── environment.ts                 # apiBaseUrl: 'http://localhost:25050'
│   └── environment.production.ts      # apiBaseUrl: '' (set at deploy); fileReplacements in angular.json
├── app/
│   ├── app.ts / app.html / app.config.ts / app.routes.ts   # shell: header + outlet + footer; interceptor; lazy routes
│   ├── core/
│   │   ├── api/
│   │   │   ├── api.service.ts               # base URL + query building (repeatable `filter`), get/post
│   │   │   ├── accept-language.interceptor.ts
│   │   │   └── load-state.ts                # LoadState<T>, toLoadState() operator, error classification
│   │   ├── i18n/language.service.ts         # lang signal, persistence, <html lang/dir>, Transloco sync
│   │   └── util/                            # mediaUrl(), blocks(), isInternalLink(), parseCoordinates()
│   ├── models/                              # delivery-api, article, category, site-settings, about-page, contact-page, contact
│   ├── services/                            # news, site-settings, page, contact (+ .spec.ts each)
│   ├── shared/                              # media-url pipe, cms-link, rich-text, state blocks (loading/empty/error), article-card, pagination
│   ├── layout/                              # header, footer, language-switcher
│   └── features/
│       ├── home/home.page.ts
│       ├── news/news-list.page.ts, article-detail.page.ts, category-filter, tag-search, featured-strip
│       ├── about/about.page.ts
│       ├── contact/contact.page.ts, contact-form
│       └── not-found/not-found.page.ts
public/i18n/en.json, ar.json                  # UI labels only
```

**Structure Decision**: Single Angular project at the repository root (existing layout). Code is
grouped into `core` (cross-cutting), `models`, `services` (one per backend area, as the brief's
Phase 2 requires), `shared`, `layout` and lazy-loaded `features`. Components are standalone and
use signals; feature routes use `loadComponent`.

## Delivery phases (mirrors TASK-frontend.md; stop and report after each)

| Phase | Scope | Key outputs | Exit check |
|---|---|---|---|
| 0 | Discovery and plan | **Done in this run**: samples, research, data model, contracts | Plan confirmed by the user |
| 1 | Foundation | environments + `fileReplacements`, models, `ApiService`, `LanguageService`, interceptor, `LoadState`/error classification, `lang`/`dir`, fixed `app.spec.ts`, i18n key skeleton | build + tests pass |
| 2 | Data services | `NewsService` (server paging, plus the language-gap retry with `SKIP_LANGUAGE`), `SiteSettingsService`, `PageService`, `ContactService` with `HttpTestingController` specs | all service specs pass |
| 3 | Shell | header (logo, nav, switcher, mobile menu), footer (optional parts), shared settings per language, CMS link handling | V6, V9 (nav part) |
| 4 | News list | `/news`, cards, pagination, category filter, tag search, URL sync, featured strip, empty/error states | V1–V3, V6 |
| 5 | Article detail | `/news/:id`, sanitized body, gallery, tag links, title, notFound / languageGap (from `cultures` or the retry) | V4, V5, V7a, V7b |
| 6 | About | `/about` + `/about-us` redirect | V9 |
| 7 | Contact | info + map link, reactive form, counter, server error mapping, a11y focus | V10–V13 |
| 8 | Home + polish | `/`, final routes + wildcard, lazy loading, RTL/a11y/responsive pass | V14, V15 |
| 9 | Verification | build + tests, Postman → UI table, DoD confirmations | quickstart all green |

## Open questions for confirmation (non-blocking: defaults chosen)

1. **Free-text search (G2)**: none is shipped. Tag search only.
2. **`?culture=` (M5)**: the backend doc says it works, but it is ignored. The frontend uses the header only. Report this to the backend owner so the doc gets fixed.
3. **Production `apiBaseUrl`**: left empty (same-origin) as a placeholder until a deploy target exists.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| One extra detail request on a deep-link 404 in Arabic (language-gap retry) | FR-015 requires telling "not in this language" apart from "not found", and both are identical empty 404s | It's the backend's documented workaround (`05-api-reference.md`). The `cultures` map covers every case except deep links |
