# Mobile navigation architecture

Desktop and mobile use deliberately different navigation, not just responsive variants of the
same markup:

- **`src/components/nav-links.ts`** — `NAV_LINKS` (Home/Browse/Archive/My List) and
  `isNavLinkActive()`, shared by the desktop inline nav (`NavBar.tsx`) and the mobile
  `BottomNav.tsx`. Keep this the single source of truth for that 4-item set.
- **`BottomNav.tsx`** — fixed bottom bar, `lg:hidden`, icons from `lucide-react` keyed by href.
  There is intentionally no separate "Search" entry here: Browse's own search bar
  (`/browse?q=...`) covers it, and desktop's top nav has no Search link either for the same
  reason. Don't re-add a Search tab without removing Browse's built-in search first.
- **`NavBar.tsx`** — desktop: full inline nav + inline search box (`sm:block`, hidden on
  mobile) + `AccountMenu` dropdown (`lg:block`). Mobile: no hamburger — just the logo and
  `MobileProfileSheet`'s avatar/login button. There used to be a hamburger menu and a
  mobile-only search icon/overlay in the header; both were removed in favor of `BottomNav.tsx`
  and Browse's built-in search bar. If you're tempted to re-add either, check
  `known-e2e-gaps.md` first — the e2e suite still has stale specs asserting the old behavior.
- **`MobileProfileSheet.tsx`** — full-screen account sheet portaled to `document.body` (see
  `fixed-backdrop-filter-gotcha.md` for why). Logged out, it's just a login icon/link, no sheet.
- **`/search` no longer exists** — it was merged into `/browse` (`?q=` switches Browse from
  showing rankings to showing search results, same page, same header). `SearchBar.tsx` always
  navigates to `/browse?q=...`.
