# re-wikipedia

An unofficial, from-scratch **custom web UI for reading Wikipedia**, inspired by
the discontinued [Wikipedia KaiOS app](https://github.com/wikimedia/wikipedia-kaios)
by the Wikimedia Foundation. It keeps the keypad/softkey driven reading
experience of the original, and adds a modern, responsive web layout.

> **Not affiliated with Wikimedia.** This is an independent project. It is not
> endorsed by, sponsored by, or connected to the Wikimedia Foundation. It reads
> public content through the Wikipedia/Wikimedia APIs, which is available under
> [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) unless noted
> otherwise. "Wikipedia" and the Wikipedia marks belong to the Wikimedia
> Foundation.

- **Web app:** https://wiki-unofficial.vercel.app
- **Source:** https://github.com/AurielSolaris/re-wikipedia

## What this is

A hand-built rendering layer for Wikipedia: the app fetches article HTML/JSON
from the public Wikimedia APIs and renders it with its own UI instead of using
the upstream app. Highlights:

- **Reading-focused UI** built from GitHub Primer light/dark design tokens,
  WCAG AA contrast, visible focus rings and reduced-motion support.
- **Light/dark/system theme** with a manual toggle (system, light, dark) in
  Settings — no reload required.
- **Keyboard and softkey navigation** (KaiOS friendly) *plus* an optional
  **touch and click** mode so pointers work everywhere, toggleable in Settings.
- **Responsive by design**: works from a 240px KaiOS feature phone up to
  WUXGA (1920×1200) desktops. On laptops and desktops the list screens stop
  being a narrow centred strip and tile into a **multi-column card grid**
  (~92% of the viewport, 2-3 cards per row and 4 on a wide monitor), with the
  arrow keys following the grid. Apple devices supported (safe-area insets,
  `apple-mobile-web-app` meta, home-screen icon).
- **SEO and sharing**: proper meta tags, Open Graph, Twitter card, canonical
  URL, JSON-LD, `robots.txt` and `sitemap.xml`.
- **Works offline-first where possible**: cached API responses and offline
  states.

## Stack

| Concern | Choice |
| --- | --- |
| Package manager / runtime | **Bun** |
| Bundler | **Vite 8** (rolldown) + `@vitejs/plugin-legacy` |
| Legacy target | Firefox 37 (KaiOS) via the legacy plugin |
| UI | **Preact 10**, migrating incrementally to **ReScript 12 + React 19** islands |
| State | Observable preferences: ReScript store core + subscription hooks |
| Styles | **SCSS** with design tokens (no Tailwind) |
| i18n | `banana-i18n` — `en`, `hi`, `bn`, `he`, `ru`, `ja` (+ `qqq` docs) |
| Icons | Inline [Lucide](https://lucide.dev) SVGs (ISC), no icon dependency |
| Web hosting | **Vercel** (Bun build, static `dist/`) |

Cypress and webpack have been removed.

## Getting started

Requires [Bun](https://bun.sh) and (for the KaiOS device workflow) `adb`.

```sh
bun install
bun run dev        # dev server (Vite)
bun run build      # production build: modern bundle + KaiOS legacy bundle
bun run preview    # serve the built dist/ locally
```

Other useful scripts:

```sh
bun run res:watch  # ReScript compiler in watch mode
bun run stats      # cloc migration progress (Preact -> ReScript)
bun run banana     # i18n key/locale consistency check
bun run deploy     # build and push to a connected KaiOS device via adb
```

## Running in a browser

```sh
bun run dev
```

Open the printed local URL. Use the browser's responsive design mode with a
small viewport (e.g. 240×320) to approximate a KaiOS device, or a large one
(1920×1200) to see the desktop layout.

## Running on a KaiOS device

1. Connect the device over USB and enable debug mode: `*#*#33284#*#*`
2. Confirm it is visible: `adb devices`
3. Deploy: `bun run deploy`

## Touch and click support

The app is keypad-first. On pointers (mouse or touchscreen) it enables tap and
click interactions automatically on first run, and you can turn them on or off
at any time from **Settings → Touch and click**. When enabled, tapping a list
row, an in-article link, a figure or a softkey performs the same action as the
center key. The preference is stored in `localStorage`.

## Preferences, themes and state

Everything changeable in Settings (theme, touch and click) applies **immediately**
and can be changed again straight away — no reload:

- Preferences live in a small observable store (`src/utils/preference.js`) whose
  state machine is written in ReScript (`src/res/Preference.res`): cached value,
  allow-list validation, persistence and change notification.
- Components subscribe through hooks (`useTheme`, `useTouchSupport`) and
  re-render on change; the store also writes `html[data-theme]` /
  `html[data-touch]` so the styles follow along.
- Values persist in `localStorage`, with an in-memory fallback when storage is
  unavailable (private mode, quota). Preferences are a handful of bytes, so
  `localStorage` is the right store; `IndexedDB` only becomes worth its async
  complexity for large payloads such as a future offline article cache.
- Handlers that the softkey bar holds on to read the current value from the
  store, so a preference can be toggled repeatedly without going stale.

## Desktop card grid

From 900px wide, list screens (`Settings`, `Search` results, `Language`, `Tips`,
table of contents, article menu/footer) render as a card grid: one shell width of
`min(1600px, 92vw)` shared by headers and cards, with
`repeat(auto-fill, minmax(340px, 1fr))` columns and taller, bordered cards.
Navigation follows the grid — up/down move a whole row, left/right a single card
(`src/res/GridNav.res` + the `'grid'` axis in `useNavigation`). Below that width
nothing changes, so KaiOS layout and the legacy bundle are untouched.

## Deploying the web app

The web build is deployed to Vercel as a static site (`vercel.json` runs
`bun install` + `bun run build` and serves `dist/`).

```sh
bunx vercel --prod
```

## Documentation

- `MAP.txt` — file-by-file map of the repository.
- `MIGRATION.md` — Preact → ReScript migration status (via `cloc`).
- `i18n/` — translation files; `qqq.json` documents each message.
