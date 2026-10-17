# News Portal Frontend Constitution

## Core Principles

### I. Backend Contract Fidelity

- The Umbraco headless backend is fixed. The frontend MUST NOT require or include any backend change.
- Every request MUST trace to an endpoint in `docs/api/postman_collection.json` or the endpoint map
  in `TASK-frontend.md` (E1–E13). Endpoints, query parameters and response fields MUST NOT be invented.
- Response models MUST be TypeScript interfaces derived from real captured responses
  (`docs/api/samples/`), not from guesses.
- When the reference documents disagree, the request verified against the running backend wins.
  A capability that does not exist MUST be recorded as a gap, never faked with invented data.

Rationale: the backend is shared and frozen, so the frontend is only correct if it matches what the
backend actually returns.

### II. Content Comes From the CMS

- Managed content MUST NOT be hardcoded: header, footer, navigation, articles, categories, About Us
  and Contact Us details.
- Interface labels (buttons, empty-state and error messages) are not managed content. They MUST live
  in the translation files for both `en` and `ar`, never as literal strings in templates.

Rationale: editors must control the site's content, and both languages must stay complete.

### III. Bilingual and RTL by Default

- Every screen MUST work in English (default) and Arabic.
- Content requests MUST send the active language through `Accept-Language`.
- Content missing in the active language MUST NOT silently fall back to English. It MUST show an
  explicit "not available in this language" or empty state.
- The document's `lang` and `dir` MUST follow the active language (`rtl` for Arabic). Layouts MUST
  use direction-aware styling (logical properties, start/end) so they mirror correctly.
- The language preference MUST persist across reloads, with storage access guarded so failures fall
  back to English.

Rationale: Arabic is a first-class audience, not a translation added later.

### IV. Safe Rendering

- Rich text from the CMS MUST render through Angular's built-in sanitization.
- `bypassSecurityTrust*` and equivalent escapes MUST NOT be used unless a captured response proves
  they are required, and any such use MUST be documented in the plan and the phase report.
- External links MUST honor the editor's open-in-new-tab flag and use `rel="noopener noreferrer"`
  when opening a new tab.

Rationale: CMS content is not trusted input, and the browser is the last line of defence.

### V. Resilient, Accessible UI

- Every data-driven area MUST have explicit loading, error, empty and (where relevant) not-found states.
- A `200` with `items: []` is an empty state, not an error.
- A failure in one area MUST NOT break the rest of the page.
- Empty optional sections MUST be left out, not rendered blank.
- Pages MUST be keyboard-operable with visible focus, labelled form controls, errors tied to fields
  via `aria-describedby`, meaningful image alt text, and a logical reading order in both directions.
- Layouts MUST work at mobile, tablet and desktop widths with no horizontal page scroll.

Rationale: a public news site must work for everyone, including on poor connections and with
incomplete content.

### VI. Tested Data Layer

- Every data service MUST have unit tests using `HttpTestingController` that assert the URL, query
  string and headers it sends.
- Those tests MUST cover 404, 400 validation-error and empty-result handling where the endpoint can
  return them.
- The production build and the full unit test suite MUST pass before a phase is reported complete.
- Final delivery MUST include a verification table mapping every Postman request to its screen or
  behavior and the observed result.

Rationale: the API layer is where contract mistakes hide, and tests there are cheap and precise.

### VII. Follow the Project, Keep It Simple

- New code MUST follow the conventions already in this repository: Angular version and component
  style, routing, Tailwind styling, Transloco i18n, Lucide icons, folder layout, `.editorconfig` and
  Prettier settings, and the Karma/Jasmine test setup.
- Components MUST NOT build URLs or call `HttpClient` directly. All API access MUST go through the
  shared API and data services.
- A dependency MUST NOT be added unless the need is demonstrated and recorded in the plan.
- Prefer the smallest design that satisfies the spec. No speculative abstractions.

Rationale: consistency keeps the codebase reviewable, and every dependency is a long-term cost.

## Technology Constraints

- **Stack (existing):** Angular 22 with `@angular/ssr`, TypeScript ~6.0, RxJS 7.8, Tailwind CSS 4,
  Transloco (`en`, `ar`; translations under `public/i18n/`), Lucide icons, ngx-sonner toasts,
  Cairo and Montserrat fonts.
- **Backend:** Umbraco Delivery API v2 at `/umbraco/delivery/api/v2/content` (detail at
  `/content/item/{id}`) and `POST /api/contact`. Development base URL is `http://localhost:25050`,
  set through environment configuration (`apiBaseUrl`), never inlined.
- **SSR safety:** browser-only APIs (`window`, `document`, `localStorage`) MUST be accessed through
  platform checks or Angular abstractions so server rendering does not fail.
- **Reference documents:** `docs/api/` is the contract. If a required reference file is missing,
  work MUST stop and the gap MUST be reported.

## Development Workflow

- Work proceeds phase by phase as defined in `TASK-frontend.md`. At the end of each phase, work
  MUST stop with a summary of what changed (and test results where applicable) and wait for
  confirmation before the next phase. Phases MUST NOT be skipped.
- Phase 0 (discovery and response capture) MUST be completed and its plan confirmed before any
  application code is written.
- Spec Kit flow: `/speckit-specify` → `/speckit-clarify` (optional) → `/speckit-plan` →
  `/speckit-tasks` → `/speckit-implement`. Plans MUST include a Constitution Check against these
  principles.
- Every change MUST be reviewed for compliance with Principles I–VII before it is merged.

## Governance

- This constitution overrides other practices and conventions for this project. Where a plan or
  task conflicts with it, the constitution wins until it is amended.
- **Amendments** MUST be made through `/speckit-constitution` and MUST record the change in the Sync
  Impact Report, update the version, and set the Last Amended date.
- **Versioning:** semantic versioning. MAJOR for removing or redefining a principle, MINOR for adding
  a principle or section or materially expanding guidance, PATCH for clarifications and wording.
- **Compliance:** each `/speckit-plan` run MUST pass the Constitution Check, or justify each
  violation in its Complexity Tracking section. Phase reports MUST call out any deviation.

**Version**: 1.0.0 | **Ratified**: 2026-10-17 | **Last Amended**: 2026-10-17
