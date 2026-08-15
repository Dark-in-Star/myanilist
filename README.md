# MyAniList Web

A responsive Next.js (App Router, TypeScript) client for browsing, searching, and tracking anime and manga through [myanilist-server](../myanilist-server), a wrapper around the official MyAnimeList API v2.

## Features

- Anime and manga rankings (airing, upcoming, top, popularity, favorites, and more) with tab filters and load-more pagination
- Season archive: browse anime by year/season, like MyAnimeList's own archive
- Search across anime and manga
- Anime/manga detail pages with synopsis, info panel, related titles, and recommendations
- Real multi-user login with MyAnimeList (OAuth2 + PKCE) — each visitor logs in with their own account; the app never shares one hardcoded account
- My Anime List / My Manga List with inline status, score, and progress editing (backed by Server Actions)
- Profile page with account stats
- Light/dark theme toggle
- Responsive layout for mobile, tablet, and desktop, including a collapsible mobile nav

## Authentication

Login lives entirely in this app, not in myanilist-server. `/auth/login` starts an OAuth2 + PKCE flow against MAL directly; `/auth/callback` exchanges the code for tokens and stores them in an httpOnly session cookie; `/auth/logout` clears it. `proxy.ts` (Next.js's Proxy/Middleware convention) proactively refreshes a near-expiry access token before it reaches a page render. Every authenticated call to myanilist-server carries the current visitor's own token via `Authorization: Bearer <token>` — see [myanilist-server](../myanilist-server)'s README for the other half of this.

## Getting Started

1. Make sure [myanilist-server](../myanilist-server) is running (`pnpm dev` from that directory, default port `3000`).
2. Register an app on MyAnimeList (*Profile Settings → API*), type **"other"** (PKCE public client). Set the redirect URI to `http://localhost:3001/auth/callback` — this app's callback, not the server's.
3. Configure this app's environment:
   ```bash
   cp .env.example .env.local
   # MAL_API_BASE_URL defaults to http://localhost:3000
   # MAL_CLIENT_ID: same client ID as myanilist-server's .env
   ```
4. Install dependencies and start the dev server (runs on port `3001` to avoid clashing with the server):
   ```bash
   pnpm install
   pnpm dev
   ```
5. Open [http://localhost:3001](http://localhost:3001) and log in with MyAnimeList from the nav bar.

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
- **E2E tests** ([Playwright](https://playwright.dev)) live in `e2e/`. `playwright.config.ts` boots an in-memory mock of myanilist-server (`e2e/mock-server.mjs`) plus this app, run against a production build, so tests never touch a real MyAnimeList account. Tests run across desktop, mobile (Pixel 7), and tablet (iPad Mini) viewports. `e2e/auth-helpers.ts`'s `loginAs()` simulates a logged-in visitor by setting the session cookie directly, since driving the real MAL OAuth redirect isn't possible in automated e2e.

## Project Structure

```text
src/
├── app/            # App Router routes (anime, manga, archive, search, mylist, profile, auth/*)
├── components/     # UI components (cards, grids, nav, list editors, account menu, ...)
├── lib/            # API client, Server Actions, MAL OAuth helpers, session, types, formatting
└── test/           # Vitest setup and mocks
src/proxy.ts        # Proactive session token refresh (Next.js "Proxy"/middleware convention)
e2e/                # Playwright specs, mock server, and auth test helpers
```
