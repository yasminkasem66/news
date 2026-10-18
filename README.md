# News Portal — Angular frontend

The public, bilingual (English / العربية) website for the News Portal Demo. All content comes from the
Umbraco headless backend's Content Delivery API. The site covers:

- home page and news list (category filter, tag search, featured articles)
- article detail pages
- About Us
- Contact Us, with a message form

The spec, plan and validation scenarios are in [specs/001-news-portal-frontend/](specs/001-news-portal-frontend/).
The quickstart is [quickstart.md](specs/001-news-portal-frontend/quickstart.md).

## Prerequisites

- Node.js 20+ and `npm install`.
- The Umbraco backend running and seeded at `http://localhost:25050`. From the backend folder, run
  `dotnet run --launch-profile Umbraco.Web.UI`. The backend allows browser requests from
  `http://localhost:4200`. To check it's up:

  ```bash
  curl "http://localhost:25050/umbraco/delivery/api/v2/content?filter=contentType:siteSettings"
  ```

## Run, test, build

```bash
npm start        # dev server → http://localhost:4200
npm test         # Karma/Jasmine unit tests
npm run build    # production build → dist/news/browser
```

The backend URL is `apiBaseUrl` in `src/environments/`. Development uses `http://localhost:25050`.
Production leaves it empty, which means same-origin: serve the app and proxy `/umbraco`, `/api` and
`/media` to the backend, or set the URL at deploy time.

## How it fits together

- Data access is in `src/app/services/` (`NewsService`, `SiteSettingsService`, `PageService`,
  `ContactService`), built on `core/api/api.service.ts`. Components never build URLs themselves.
- Language:
  - `LanguageService` keeps `en` / `ar`, remembers the choice in `localStorage`, and sets `<html lang dir>`.
  - `acceptLanguageInterceptor` sends `Accept-Language: en-US` or `ar` on every Delivery API request.
- Interface labels are in `public/i18n/{en,ar}.json` (Transloco). CMS content is never translated
  in the frontend.
- Real backend responses captured from the running backend are in `docs/api/samples/`. Unit tests
  use them as fixtures.

## Known backend gaps

These are tracked in [research.md](specs/001-news-portal-frontend/research.md).

- **G2: free-text search doesn't work.** `query=` is ignored, so only exact tag search (`filter=tags:`) is offered.
- **M5: `?culture=ar` is ignored.** Use the `Accept-Language` header.
- **M6: `Accept-Language: en` returns nothing.** The English culture is `en-US`.
- **Content gap: the CMS navigation has no News or Contact links.** The header adds them until editors do.
