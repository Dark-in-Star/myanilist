# Responsive modal pattern: fullscreen on mobile, dialog on desktop

Several modals (`AnimeListEditModal.tsx`, `MangaListEditModal.tsx`, `ListFilterModal.tsx`) need
to be a full-screen sheet below the `sm` breakpoint and a centered, rounded dialog above it. This
is done with one `DialogContent` className, not two separate components or a runtime
media-query branch:

```tsx
<DialogContent
  showCloseButton={false}
  className="inset-0 top-0 left-0 flex h-full max-h-full w-full max-w-full translate-x-0
    translate-y-0 flex-col gap-0 overflow-y-auto rounded-none border-0 p-0
    sm:inset-auto sm:top-1/2 sm:left-1/2 sm:h-auto sm:max-h-[85vh] sm:w-full sm:max-w-md
    sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:border"
>
```

Below `sm`: pinned to all four viewport edges, full height, square corners, no border — reads as
a full-screen page, not a floating dialog. At `sm` and up: the classic centered-dialog transform
(`top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`), capped width, rounded corners, a border,
and a max-height with its own scroll.

Pair this with a manual header row (back/close button + title, optionally a right-aligned action
like "Save" or "Clear") instead of the default `DialogContent` close button — `showCloseButton={false}`
and build the header yourself so it can hold more than just a close icon.

**How to apply:** reuse this exact className recipe for any new modal that should behave this
way, rather than inventing a variant. If a modal genuinely only needs to exist on desktop or only
on mobile, that's a different, simpler case — don't force this pattern onto it.
