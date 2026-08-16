# MyAniList

A responsive Next.js (App Router, TypeScript) client for browsing, searching, and tracking anime and manga, talking directly to the official MyAnimeList API v2 from its own server-side code (Server Components and Server Actions) — no separate backend to run or deploy.

## Features

- Anime and manga rankings (airing, upcoming, top, popularity, favorites, and more) with tab filters and load-more pagination
- Season archive: browse anime by year/season, like MyAnimeList's own archive
- Search across anime and manga, built into the Browse page
- Anime/manga detail pages with synopsis, info panel, related titles, and recommendations
- Real multi-user login with MyAnimeList (OAuth2 + PKCE) — each visitor logs in with their own account; the app never shares one hardcoded account
- My Anime List / My Manga List with inline status, score, and progress editing (backed by Server Actions)
- Profile page with account stats
- Light/dark theme toggle
- Responsive layout for mobile, tablet, and desktop, including a bottom nav and profile sheet on mobile

## Architecture

Everything runs inside this one app. `/auth/login` starts an OAuth2 + PKCE flow against MAL directly; `/auth/callback` exchanges the code for tokens and stores them in an httpOnly session cookie; `/auth/logout` clears it. `proxy.ts` (Next.js's Proxy/Middleware convention) proactively refreshes a near-expiry access token before it reaches a page render.

`src/lib/api.ts` and `src/lib/actions.ts` call `https://api.myanimelist.net/v2` directly — public endpoints (search, ranking, season, detail without a caller) authenticate with the app's own `X-MAL-CLIENT-ID`; authenticated endpoints (lists, profile, mutations) forward the current visitor's own token via `Authorization: Bearer <token>`. Both files are `server-only`/`"use server"`, so none of this is reachable as a public HTTP endpoint — there's no `/api/anime`, `/api/users/@me`, etc. to curl; MAL calls only ever happen during SSR or inside a Server Action invoked by this app's own pages.

## Getting Started

1. Register an app on MyAnimeList (*Profile Settings → API*), type **"other"** (PKCE public client). Set the redirect URI to `http://localhost:3001/auth/callback`.
2. Configure this app's environment:
   ```bash
   cp .env.example .env.local
   # MAL_CLIENT_ID: from your MAL app registration
   ```
3. Install dependencies and start the dev server:
   ```bash
   pnpm install
   pnpm dev
   ```
4. Open [http://localhost:3001](http://localhost:3001) and log in with MyAnimeList from the nav bar.

## Scripts

| Script                | Description                                    |
| ---------------------- | ----------------------------------------------- |
| `pnpm dev`              | Run the dev server on port 3001                 |
| `pnpm build`            | Production build                                |
| `pnpm start`            | Run the production build (port 3001)            |
| `pnpm typecheck`        | Type-check with `tsc --noEmit`                  |
| `pnpm lint`             | Lint with ESLint                                |
| `pnpm test`             | Run unit tests once (Vitest)                    |
| `pnpm test:watch`       | Run unit tests in watch mode                     |
| `pnpm test:coverage`    | Run unit tests with coverage                     |
| `pnpm test:e2e`         | Run the Playwright e2e suite                     |
| `pnpm test:e2e:ui`      | Run the Playwright e2e suite in UI mode          |

## Testing

- **Unit tests** ([Vitest](https://vitest.dev) + React Testing Library) live alongside source files as `*.test.ts(x)` under `src/`. They cover formatting helpers, components, and the API client (with `fetch` and the session module mocked).
- **E2E tests** ([Playwright](https://playwright.dev)) live in `e2e/`. `playwright.config.ts` boots an in-memory mock of the MyAnimeList API (`e2e/mock-server.mjs`, pointed at via `MAL_API_BASE_URL`) plus this app, run against a production build, so tests never touch a real MyAnimeList account. Tests run across desktop, mobile (Pixel 7), and tablet (iPad Mini) viewports. `e2e/auth-helpers.ts`'s `loginAs()` simulates a logged-in visitor by setting the session cookie directly, since driving the real MAL OAuth redirect isn't possible in automated e2e.

## Project Structure

```text
src/
├── app/            # App Router routes (anime, manga, archive, browse, mylist, profile, auth/*)
├── components/     # UI components (cards, grids, nav, list editors, account menu, ...)
├── lib/            # API client, Server Actions, MAL OAuth helpers, session, types, formatting
└── test/           # Vitest setup and mocks
src/proxy.ts        # Proactive session token refresh (Next.js "Proxy"/middleware convention)
e2e/                # Playwright specs, mock server, and auth test helpers
```
