# Fixed-position + backdrop-filter gotcha

`MobileProfileSheet.tsx`'s full-screen account sheet is rendered via `createPortal(..., document.body)`
instead of directly in the component tree. This isn't a stylistic choice — without it, the sheet
was broken.

**The bug:** the sheet used `position: fixed; inset: 0` to cover the viewport, but it lived
inside `<header>`, which has `backdrop-blur` (a `backdrop-filter`). A `backdrop-filter` value
other than `none` makes an element a **containing block** for its `position: fixed` descendants
— the same list of properties as `transform`, `filter`, `perspective`, and `will-change`. So
`inset: 0` resolved against the header's own small box (~56–64px tall), not the viewport. The
sheet's content still rendered (flex-column, not clipped), so it *looked* like a layout bug —
a short opaque strip at the top with the rest of the page showing through underneath — rather
than an obviously-broken fixed overlay.

**How to apply:** any `position: fixed` full-screen overlay (modal, sheet, popover content that
needs true viewport coverage) that might render inside an ancestor with `backdrop-filter`,
`filter`, `transform`, `perspective`, or `will-change` set should be portaled to `document.body`
via `createPortal`, not left in place. `Dialog`/`Popover` from Radix already portal their content
by default (see `ui/dialog.tsx`, `ui/popover.tsx`) — this only bites hand-rolled fixed-position
elements like `MobileProfileSheet`'s sheet. Contrast with an `absolute`-positioned overlay
deliberately scoped to its own container (e.g. a search box expanding within the header row) —
that one is meant to be contained, so it should *not* be portaled the same way.
