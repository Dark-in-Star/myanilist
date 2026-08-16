# Never wire a state-mutating route to a `<Link href>`

Logout used to be a plain GET Route Handler (`/auth/logout/route.ts`) that deleted the
`mal_session` cookie and redirected to `/`, linked from the nav via `<Link href="/auth/logout">`
in three places (`AccountMenu.tsx`, `MobileProfileSheet.tsx`, `profile/page.tsx`).

This silently logged users out shortly after a successful login. `next/link` **prefetches** the
RSC payload for any `href` it renders (viewport-enter in production, no click needed), by issuing
a real GET request to that path. Since the logout route was a Route Handler, that prefetch GET
executed the handler for real — clearing the session cookie via its `Set-Cookie` response header
— even though the user never clicked anything. Because the logout link lives in the nav, it
renders (and gets prefetched) on essentially every authenticated page, so the bug looked like
"login works once, then the session randomly disappears on the next navigation."

**Why this matters:** the bug is invisible in the code path you'd normally suspect (session
cookie options, OAuth token exchange) — everything about session *storage* was already correct.
The break was that a safe-looking `<Link>` pointed at an unsafe (mutating) GET endpoint.

**How to apply:** logout (and any other state-mutating action) must be a Server Action invoked
via `<form action={...}>` or a direct call from a client event handler — never a GET route
reachable through `<Link href>` or a plain `<a>`. See `logoutAction` in `src/lib/authActions.ts`.
If you ever need a route-based (non-Action) mutation endpoint, make it POST-only and trigger it
from a `<form>`/`fetch`, never from something Next's Link prefetcher or a crawler could hit with
a bare GET.
