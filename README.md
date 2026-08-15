# MyAniList Web

A responsive Next.js (App Router, TypeScript) client for browsing, searching, and tracking anime and manga through [myanilist-server](../myanilist-server), a wrapper around the official MyAnimeList API v2.

## Features

- Anime and manga rankings (airing, upcoming, top, popularity, favorites, and more) with tab filters and load-more pagination
- Search across anime and manga
- Anime/manga detail pages with synopsis, info panel, related titles, and recommendations
- My Anime List / My Manga List with inline status, score, and progress editing (backed by Server Actions)
- Profile page with account stats
- Responsive layout for mobile, tablet, and desktop, including a collapsible mobile nav

## Getting Started

1. Make sure [myanilist-server](../myanilist-server) is running (`pnpm dev` from that directory, default port `3000`) with a valid `MAL_ACCESS_TOKEN` for list/profile features.
2. Configure this app's environment:
   ```bash
   cp .env.example .env.local
   # MAL_API_BASE_URL defaults to http://localhost:3000
   ```
3. Install dependencies and start the dev server (runs on port `3001` to avoid clashing with the server):
   ```bash
   pnpm install
   pnpm dev
   ```
4. Open [http://localhost:3001](http://localhost:3001).

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

- **Unit tests** ([Vitest](https://vitest.dev) + React Testing Library) live alongside source files as `*.test.ts(x)` under `src/`. They cover formatting helpers, components, and the API client (with `fetch` mocked).
- **E2E tests** ([Playwright](https://playwright.dev)) live in `e2e/`. `playwright.config.ts` boots both `myanilist-server` and this app automatically and runs against a production build. Tests run across desktop, mobile (Pixel 7), and tablet (iPad Mini) viewports. Since the server talks to a real MyAnimeList account with no sandbox mode, tests that mutate list state clean up after themselves, and tests touching account-specific pages tolerate either real data or the "not connected" empty state.

## Project Structure

```text
src/
├── app/            # App Router routes (anime, manga, search, mylist, profile)
├── components/     # UI components (cards, grids, nav, list editors, ...)
├── lib/            # API client, Server Actions, types, formatting helpers
└── test/           # Vitest setup and mocks
e2e/                # Playwright specs
```
