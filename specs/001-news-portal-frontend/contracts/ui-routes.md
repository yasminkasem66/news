# Contract: Public Routes and Screen States

The URLs the site exposes to visitors. They are shareable and survive reload.

| Route | Component (lazy) | Query params | Data (endpoint) | States shown |
|---|---|---|---|---|
| `/` | `HomePage` | none | `getFeatured()` (E6), `getArticles({ page: 1, pageSize: 6 })` (E1) | Featured hidden when empty. Latest: loading / empty / error. "View all news" → `/news` |
| `/news` | `NewsListPage` | `page` (int ≥ 1, default 1), `category` (category id), `tag` (string) | `getCategories()` (E2), `getFeatured()` (E6, only when no filter is active), `getArticles()` (E1/E3/E4/E5) | Loading; error with retry per section; **empty-no-content** (no filters, total 0); **empty-no-match** (filters active, total 0); page out of range → empty-no-match. In English, cards without an `ar` culture show an "English only" badge |
| `/news/:id` | `ArticleDetailPage` | none | `getArticle(id)` (E7/E8/E9) | Loading; ok; **notFound** (link to `/news`); **languageGap** (button "Read in English" / "اقرأ بالعربية" switches the language), shown instantly from the loaded `cultures` when switching language, or after the no-header retry on a deep link; error with retry |
| `/about` | `AboutPage` | none | `getAbout()` (E11) | Loading; ok; empty ("content not available"); error |
| `/contact` | `ContactPage` | none | `getContactInfo()` (E12), `submit()` (E13) | Info: loading / ok / empty / error, independent of the form. Form: idle / submitting / success / validation / failure |
| `/about-us` | redirect → `/about` | | | Matches CMS navigation paths (research §10) |
| `/contact-us` | redirect → `/contact` | | | |
| `**` | `NotFoundPage` | | | Static not-found with links to `/` and `/news` |

## Shell (every route)

- **Header**: logo (→ `/`), `primaryNavigation` links, language switcher (`English` / `العربية`, `aria-pressed` on the current one). Mobile: a menu toggle button with `aria-expanded`.
- **Footer**: about text (rich text), link columns, social links, copyright. Each part is left out when empty.
- Settings in a loading or error state never block the `<router-outlet>`. On error the header falls back to the logo-less site name from translations and a language switcher.

## Document-level behavior

- `<html lang>` is `en` or `ar`. `<html dir>` is `ltr` or `rtl`. Both update on every switch.
- `document.title`: article title on `/news/:id`, otherwise the translated page name followed by "· News Portal".
- Interface labels come from `public/i18n/{en,ar}.json` (Transloco). CMS content is never translated client-side.

## Link handling (CMS-supplied URLs)

- `url` starts with `/` and not `//` → `routerLink`.
- Otherwise → `<a href>`.
- `openInNewTab: true` → `target="_blank" rel="noopener noreferrer"`.
- Social links are always external.
