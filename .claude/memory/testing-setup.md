# Testing setup

- **Unit tests** ([Vitest](https://vitest.dev)): `pnpm test`, colocated as `src/**/*.test.ts(x)`.
  `src/lib/api.ts` calls are tested with `fetch` and `./session` mocked (see `api.test.ts`) —
  `process.env.MAL_CLIENT_ID` must be set in `beforeEach` for any test that exercises an
  unauthenticated `apiGet` call, since `authHeaders()` throws if it's missing.
- **E2E tests** ([Playwright](https://playwright.dev)): `pnpm test:e2e`, specs in `e2e/`.
  `playwright.config.ts` boots two servers: `e2e/mock-server.mjs` (a tiny in-memory stand-in for
  the real MyAnimeList API, on port 3900) and this app built for production (`pnpm build && pnpm
  start`, with `MAL_API_BASE_URL` pointed at the mock) — so e2e never touches a real MAL account.
  `e2e/auth-helpers.ts`'s `loginAs()` sets the session cookie directly rather than driving the
  real OAuth redirect.

## Known caveat: shared mock-server state under parallel workers

`e2e/mock-server.mjs` holds its anime/manga list state in one process-wide in-memory `Map`,
shared across **every** test that hits it. `playwright.config.ts` sets `workers: 1` in CI
(serial — safe) but leaves it `undefined` locally (parallel, typically one per CPU core). Running
the full suite locally with default parallelism can produce cross-test data races on the shared
mock ids (1000–1004 for anime, 2000+ for manga) — e.g. one test's status-change mutates an entry
another test is mid-assertion on, producing failures that don't reproduce serially and aren't
reproducible in CI.

**How to apply:** if a local e2e run shows failures in `mylist.spec.ts` / `anime.spec.ts` that
don't make sense (an entry missing, a count wrong, a click landing on stale state), re-run with
`npx playwright test --workers=1` before concluding it's a real bug — that matches CI and
eliminates the race as a cause.
