# CSS cascade layers gotcha

`globals.css` once had a plain top-level rule:

```css
* {
  border-color: var(--border);
}
```

This silently defeated **every** `border-*` color utility in the entire app (`border-accent`,
`border-danger`, `hover:border-accent`, ...) regardless of specificity or source order. Tailwind
v4's utilities live inside native CSS `@layer` blocks; per the CSS Cascade Layers spec, an
unlayered rule always beats a layered one at equal specificity, no matter which comes later in
the file. The correctly-layered equivalent already existed in `@layer base { * { @apply
border-border ...} } }` — the top-level rule was pure dead weight actively breaking things.

**Why this matters:** a bug like this doesn't show up as a build error or a lint warning — a
component can look completely correct in JSX/Tailwind classes and still render the wrong color,
because something else entirely (a few hundred lines away, in a different file) is winning the
cascade. It cost real debugging time to trace before the fix.

**How to apply:** never add a bare `selector { ... }` rule to `globals.css` outside a
`@layer` block. If you need a global default, put it in `@layer base`. If you're debugging a
Tailwind color/utility class that "isn't working" despite looking correct in the DOM inspector's
class list, check computed styles for a rule with no layer — it will out-rank the utility every
time.
