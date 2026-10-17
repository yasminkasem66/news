# Feature Specification: News Portal Public Frontend

**Feature Branch**: `001-news-portal-frontend`

**Created**: 2026-10-17

**Status**: Draft

**Input**: User description: "D:\studying\news\TASK-frontend.md" — build the public, bilingual (English/Arabic) website for the News Portal Demo on top of the existing, fixed content backend: news list with category filter, tag search and featured articles, article detail, About Us, Contact Us with a message form, and a site-wide header/footer driven entirely by managed content.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse the latest news (Priority: P1)

A visitor opens the news section and sees published articles, newest first, as cards showing the featured image, title, category, summary, published date and author (when present). They can page through the full archive 20 articles at a time. Featured articles appear in their editorial order above the list.

**Why this priority**: Reading news is the core purpose of the portal. With only this story, the site already delivers value.

**Independent Test**: With seeded articles, open the news page and confirm the newest article is first, the cards show the required fields, paging reaches every article, and the featured section matches the editors' featured order.

**Acceptance Scenarios**:

1. **Given** more than 20 published articles, **When** the visitor opens the news page, **Then** the 20 newest are shown newest first, with a way to move to the next page.
2. **Given** some articles are marked featured with an order, **When** the news page loads, **Then** those articles appear above the list in that order.
3. **Given** no articles are marked featured, **When** the news page loads, **Then** the featured section is hidden entirely and is not filled with other articles.
4. **Given** no articles have been published, **When** the news page loads, **Then** a clear "no articles yet" message is shown, not an error.
5. **Given** the featured content fails to load but the list loads, **When** the page is shown, **Then** the list is still fully usable.

---

### User Story 2 - Read a full article (Priority: P1)

A visitor opens an article and reads its title, category, featured image, published date, author, tags, formatted body and photo gallery (when present). Tags lead back to the list of articles with that tag.

**Why this priority**: Without the detail page, the list cannot lead anywhere.

**Independent Test**: Open an article by its address and confirm all fields render, the browser tab shows the article title, and selecting a tag shows the tag-filtered list.

**Acceptance Scenarios**:

1. **Given** a published article, **When** the visitor opens it, **Then** every available field is shown, and the body keeps its formatting without running unsafe content.
2. **Given** an article address that does not exist, **When** the visitor opens it, **Then** a "not found" message with a link back to the news list is shown.
3. **Given** an article with tags, **When** the visitor selects a tag, **Then** the news list opens filtered by that tag.
4. **Given** an article with no gallery or no author, **When** it is shown, **Then** those parts are left out, not shown empty.

---

### User Story 3 - Read the site in Arabic (Priority: P1)

A visitor switches between English and العربية. The whole site (header, footer, lists, pages) reloads in the chosen language, the layout flows right-to-left for Arabic, and the choice is remembered on their next visit. Content that has no Arabic version is not shown in Arabic lists. If the visitor is on an article that has no Arabic version, they see a "not available in this language" message with an option to switch back.

**Why this priority**: Bilingual support is required by the definition of done and affects every page.

**Independent Test**: Switch to Arabic on each page and confirm the right-to-left layout, Arabic content, a remembered choice after reload, and the language-gap message on an English-only article.

**Acceptance Scenarios**:

1. **Given** the visitor is on any page, **When** they switch to Arabic, **Then** the page content, header and footer reload in Arabic and the layout becomes right-to-left.
2. **Given** the visitor chose Arabic, **When** they reload or come back later on the same browser, **Then** the site opens in Arabic.
3. **Given** an article published only in English, **When** the visitor views it in Arabic, **Then** a "not available in this language" message appears with an action to switch to English, distinct from the "not found" message.
4. **Given** no articles are published in Arabic, **When** the visitor views the Arabic news list, **Then** the empty-state message is shown, not an error.

---

### User Story 4 - Narrow the news by category or tag (Priority: P2)

A visitor picks a category (or "All") from a list of the editors' categories, or searches by tag keyword, to see only matching articles. The selected filter and page appear in the page address, so the view can be shared and survives a reload. Clearing the filters brings back the full list.

**Why this priority**: Useful for finding articles, but the site can still be read without it.

**Independent Test**: Select a category, copy the address into a new tab and confirm the same filtered page appears. Search a tag with no matches and confirm the "no results" message.

**Acceptance Scenarios**:

1. **Given** categories exist, **When** the visitor selects one, **Then** only that category's articles are listed and the address reflects the selection.
2. **Given** a shared filtered address, **When** someone opens it, **Then** the same filter and page are shown.
3. **Given** a tag keyword with no matching articles, **When** the visitor searches, **Then** a "no results match your search" message is shown, distinct from "no articles yet".
4. **Given** active filters, **When** the visitor clears them, **Then** the full newest-first list returns.

---

### User Story 5 - Contact the organization (Priority: P2)

A visitor opens the Contact Us page, sees the organization's address, phone, email, office hours, a map link and social links, and sends a message (name, email, subject, message). The form checks their input as they go, tells them exactly which field is wrong, and confirms when the message is sent.

**Why this priority**: The site's only interactive write path. It matters, but it sits outside the core reading experience.

**Independent Test**: Submit a valid message and confirm the success message and that the message is visible to editors in the back office. Submit invalid input and confirm per-field messages while the typed values stay in place.

**Acceptance Scenarios**:

1. **Given** valid input, **When** the visitor submits, **Then** a success confirmation is shown, the form is cleared, and repeated clicks while sending do not create duplicates.
2. **Given** input that breaks the rules (name 2–100 characters, valid email, subject 3–150 characters, message 10–2000 characters), **When** the visitor tries to submit, **Then** each invalid field shows its message next to it and focus moves to the first invalid field.
3. **Given** input that passes the form's checks but is rejected by the server, **When** the response arrives, **Then** each server message appears next to its field in the same way, and the typed values stay in place.
4. **Given** a network failure, **When** the visitor submits, **Then** a general error with a retry option is shown and the typed values stay in place.
5. **Given** the message field, **When** the visitor types, **Then** a character counter shows progress toward the 2000-character limit.
6. **Given** some contact details are not filled in by editors, **When** the page shows, **Then** those details are left out.

---

### User Story 6 - Learn about the organization (Priority: P3)

A visitor opens About Us and sees the page title, hero text and image, formatted body, and key statistics (label + value), in the chosen language.

**Why this priority**: Supporting content with a single, simple page.

**Independent Test**: Open About Us in both languages and confirm all filled sections render and empty ones are left out.

**Acceptance Scenarios**:

1. **Given** the About Us content exists, **When** the visitor opens the page, **Then** title, hero, body and statistics are shown, and empty optional sections are left out.
2. **Given** no About Us content exists in the chosen language, **When** the visitor opens the page, **Then** a friendly "content not available" message is shown.

---

### User Story 7 - Navigate the site through managed header, footer and home page (Priority: P2)

On every page, the visitor sees a header with the logo, the editors' navigation menu and the language switcher, and a footer with about text, link columns, social links and copyright, all managed by editors. The home page shows featured articles and the latest few articles with a link to the full news list. Unknown addresses show a not-found page.

**Why this priority**: Ties the pages together. Pages can still be reached directly without it, so it ranks below reading.

**Independent Test**: Change a navigation item in the back office, reload and confirm it appears. Confirm internal links stay in the site, external links open as set, and an unknown address shows the not-found page.

**Acceptance Scenarios**:

1. **Given** editors defined navigation items, **When** any page loads, **Then** the header shows them, internal links navigate within the site, and items marked "open in new tab" open in a new tab.
2. **Given** a footer section has no content, **When** the page loads, **Then** that section is left out rather than shown blank.
3. **Given** the visitor opens the home page, **When** it loads, **Then** featured articles and the latest articles are shown, with a link to the full list.
4. **Given** an unknown site address, **When** the visitor opens it, **Then** a not-found page with navigation back is shown.

---

### Edge Cases

- Site Settings, About Us or Contact Us content is missing (no item returned): the page shows a friendly fallback, and the header and footer degrade gracefully instead of breaking the page.
- The backend is unreachable: each area shows its own error state with a retry option. A failure in one area (e.g. featured) does not blank the rest of the page.
- The visitor switches language while on a page whose content does not exist in the new language: the "not available in this language" state is shown, not a crash.
- A filtered address names a category that no longer exists, or a page number past the end: an empty or "no results" state is shown, not an error.
- Article body or footer text contains formatting or embedded markup: it is displayed formatted, and anything unsafe is removed.
- Images have no alternative text: a sensible fallback (e.g. the article title) is used so screen readers still announce something meaningful.
- Several articles share the same featured order: they still appear in a stable, repeatable order.
- The visitor's saved language preference cannot be read or stored (private mode, blocked storage): the site falls back to English and keeps working.

## Requirements *(mandatory)*

### Functional Requirements

**Content source and integrity**

- **FR-001**: The site MUST take all visible content (header, footer, navigation, articles, categories, About Us, Contact Us details) from the existing content backend. No site content may be fixed in the frontend.
- **FR-002**: The site MUST use only the 13 backend capabilities listed in the brief's endpoint map (E1–E13), and every one of them MUST be used by at least one screen.
- **FR-003**: The backend MUST NOT be changed. Any needed capability the backend lacks MUST be recorded as a gap, not worked around with invented data.

**News list, filtering and featured**

- **FR-004**: The news page MUST list published articles newest first, 20 per page, with paging across the full archive.
- **FR-005**: Each article card MUST show featured image, title, category, summary and published date, plus author when present.
- **FR-006**: Visitors MUST be able to filter the list by one category chosen from the editor-managed category list, including an "All" option.
- **FR-007**: Visitors MUST be able to search articles by tag keyword. Free-text search MAY be added only if confirmed working against the running backend. Otherwise it is recorded as a gap.
- **FR-008**: The active category, tag and page MUST be reflected in the page address, and opening that address MUST reproduce the same view.
- **FR-009**: The site MUST tell "no articles exist yet" apart from "no articles match your filters" and MUST NOT present either as an error.
- **FR-010**: Featured articles MUST appear in editor-defined order above the list, MUST be hidden when there are none, and MUST NOT be backfilled with non-featured articles.
- **FR-011**: Each content area MUST show its own loading and error state, and the failure of one area MUST NOT block the others.

**Article detail**

- **FR-012**: The article page MUST show title, category, featured image, published date, author, tags, formatted body and gallery, leaving out empty optional parts.
- **FR-013**: Formatted body text MUST be displayed with unsafe content removed. Any exception to this MUST be justified by real backend content and reported.
- **FR-014**: A missing article MUST show a not-found state with a link back to the news list.
- **FR-015**: An article that exists only in another language MUST show a "not available in this language" state with an action to switch language, distinct from not-found.
- **FR-016**: Each tag on an article MUST link to the news list filtered by that tag.
- **FR-017**: The browser tab title MUST reflect the article title.

**Language**

- **FR-018**: Visitors MUST be able to switch between English (default) and Arabic from the header on every page.
- **FR-019**: The language choice MUST be remembered across visits on the same browser and MUST fall back to English if it cannot be stored.
- **FR-020**: All content requests MUST be made in the chosen language. Switching language MUST reload the current page's content, header and footer.
- **FR-021**: Arabic MUST display right-to-left, and the document's declared language and direction MUST match the chosen language.
- **FR-022**: Content not published in the chosen language MUST NOT be shown in its place in another language (no silent fallback to English).

**Site chrome and navigation**

- **FR-023**: The header MUST show the editor-managed logo, primary navigation and language switcher. The footer MUST show about text, link columns, social links and copyright, leaving out empty sections.
- **FR-024**: Header and footer content MUST be loaded once per language and shared across all pages.
- **FR-025**: Navigation links MUST stay within the site for internal destinations, open as normal links for external ones, and honor the editor's "open in new tab" setting.
- **FR-026**: The site MUST provide these pages: Home, News list, Article detail, About Us, Contact Us, and a not-found page for unknown addresses.
- **FR-027**: The home page MUST show featured articles and a short list of the latest articles with a link to the full list.

**About Us**

- **FR-028**: About Us MUST show title, hero text, hero image, formatted body and statistics, leaving out empty optional sections, and MUST show a friendly message when the page content is missing.

**Contact Us**

- **FR-029**: Contact Us MUST show title and intro, address, phone, email, office hours, a map link built from the stored coordinates (no paid map key) and social links, leaving out empty fields.
- **FR-030**: The contact form MUST collect name, email, subject and message, and check them before sending against the same rules the server uses: name 2–100 characters, valid email, subject 3–150 characters, message 10–2000 characters. The message field MUST show a character counter.
- **FR-031**: On success, the form MUST show a confirmation and clear itself. While sending, it MUST block duplicate submissions.
- **FR-032**: On a server validation rejection, each server message MUST appear next to its field, styled the same as the form's own checks, and the visitor's input MUST be kept.
- **FR-033**: On a network or unexpected failure, the form MUST show a general error with a retry option and keep the visitor's input.
- **FR-034**: The form MUST be accessible: every field labelled, error messages tied to their fields for assistive technology, and focus moved to the first invalid field on a failed submit.

**Quality**

- **FR-035**: Every page MUST be usable by keyboard, show visible focus, provide image alternative text, and keep a logical reading order in both languages.
- **FR-036**: Every page MUST lay out correctly at mobile, tablet and desktop widths.
- **FR-037**: Each backend capability the site uses MUST have automated tests that confirm the requests it sends and how it handles responses, including not-found, validation-error and empty-result cases.
- **FR-038**: Delivery MUST end with a verification table mapping every request in the reference collection to the screen or behavior that uses it and the observed result.

### Key Entities

- **Article**: A news item. Has title, URL slug, category (one), summary, formatted body, featured image, optional gallery, published date, optional author, tags, a featured flag and a featured order. Exists separately per language.
- **Category**: An editor-managed grouping of articles. Has a name and optional icon and colour, and is ordered by editors.
- **Site Settings**: The single, site-wide configuration for header and footer: logo, primary navigation items (label, link, open-in-new-tab), footer about text, footer link columns (title + links), social links (platform, URL) and copyright text.
- **About Page**: The single About Us content: title, hero text, hero image, body and statistics (label + value).
- **Contact Page**: The single Contact Us content: title, intro, address, phone, email, office hours, map coordinates ("lat,lng") and social links.
- **Contact Message**: A visitor's submission (name, email, subject, message). It can be sent but never read back through the site.
- **Language**: The visitor's chosen language (English or Arabic). It sets which content is shown and the layout direction.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of the 13 endpoint-map capabilities are used by at least one screen, and 100% of visible content comes from the backend (zero fixed content strings outside interface labels).
- **SC-002**: Every request in the reference collection appears in the verification table with a passing result.
- **SC-003**: A visitor can reach any article from the home page in 3 or fewer interactions.
- **SC-004**: On a typical broadband connection, the news list and article pages show their main content within 2 seconds of opening.
- **SC-005**: Switching language updates the page content, header, footer and layout direction within 2 seconds, with no full error screen for missing translations.
- **SC-006**: In testing, 100% of invalid contact submissions show a message next to each offending field, and 100% of valid submissions show success and appear in the back office.
- **SC-007**: Each of the five named situations shows its own distinct, non-error message: English-only article viewed in Arabic, non-existent article, search with no results, invalid contact form, valid contact form.
- **SC-008**: All pages pass a keyboard-only walkthrough and render without horizontal scrolling at mobile, tablet and desktop widths in both languages.
- **SC-009**: The production build succeeds and all automated tests pass.

## Assumptions

- The content backend described in the reference files under `docs/api/` is running locally, seeded with content in both languages, and already allows requests from the local frontend. No access key is needed for reading.
- When the brief and the reference documents disagree (e.g. the featured filter value and tie-break order), the request in the reference collection that was checked against a running backend is the source of truth. This is confirmed during discovery.
- Tag search is the supported search. Free-text search is out of scope unless discovery shows it works.
- A "not available in this language" case is detected by checking whether the same article exists in the other language after a not-found result. The exact method is confirmed during planning.
- Whether an article's category arrives with its name or only as a reference is confirmed from real responses during discovery.
- Interface labels (button text, empty-state and error messages) are not managed content. They are provided by the site in both languages and are allowed under FR-001.
- Work is delivered in the phases set out in the brief, with a review stop after each phase. Discovery (capturing real backend responses and confirming the plan) comes before any building.
- The site is public. There are no visitor accounts, sign-in or personalization beyond the language preference.
- The existing frontend project's conventions (structure, styling, testing, translation setup) are followed. New dependencies are added only when clearly needed.
