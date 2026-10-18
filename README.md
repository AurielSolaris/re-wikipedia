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
  (~92% of the viewport, 3 cards per row at 1440px and 4 on a wide monitor),
  with the arrow keys following the grid. Apple devices supported (safe-area
  insets, `apple-mobile-web-app` meta, home-screen icon).
- **Glass desktop chrome** over a soft tinted backdrop: headers, list cards,
  the article card, popups and the pinned softkey bar are translucent panels.
  Only the softkey bar and popups (the surfaces content scrolls under) carry a
  real 16px `backdrop-filter` blur, which keeps scrolling smooth; KaiOS gets no
  glass at all. Motion is limited to short colour fades: no card lift, no
  animated shadows, and the loading spinner is the only keyframe animation.
- **Article hero image**: the lead image is a bounded, `object-fit: cover` band
  above the reading card on desktop (a full-screen cover background on KaiOS),
  always requested at a standard Wikimedia thumbnail step (up to 1280px) so it
  is never upscaled or blurry.
- **SEO and sharing**: proper meta tags, Open Graph, Twitter card, canonical
  URL, JSON-LD, `robots.txt` and `sitemap.xml`.
- **Save articles for offline reading**: a **Save** button next to the
  article's Contents/Gallery actions (also in the article's Options menu)
  stores the article in IndexedDB and its images in the browser cache. Saved
  articles are listed under **Settings → Saved articles** and, when there is no
  connection, from the home screen.
- **Installable PWA**: a web app manifest and a service worker cache the app
  itself, so it opens and shows saved articles with no internet at all.

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
  `localStorage` is the right store; `IndexedDB` is used for the large
  payloads: the saved articles (below).
- Handlers that the softkey bar holds on to read the current value from the
  store, so a preference can be toggled repeatedly without going stale.

## Saved articles and offline use

Articles can be saved individually and read later without internet:

- **Save**: on an article, press the bookmark **Save** action beside Contents
  (or Options → *Save for offline*). It turns into **Saved**; press it again to
  remove the article. Saved articles show up under **Settings → Saved
  articles**, where *Read* opens one and *Remove* deletes it.
- **Storage**: the parsed article (sections, contents, references, infobox)
  goes into IndexedDB (`wikipedia-saved` / `articles`). Its images (lead image,
  figures, infobox) are downloaded into the `saved-article-images` Cache
  Storage bucket in the background, four at a time; an image that fails never
  blocks the save. Removing an article drops its images unless another saved
  article still uses them. The logic is ReScript (`src/res/SavedArticles.res`)
  behind a thin JS wrapper (`src/utils/savedArticles.js`).
- **Reading offline**: when the browser is offline, `useArticle` opens the
  saved copy straight away; online, it falls back to the saved copy if the
  requests fail. The home screen's offline panel shows an *N saved articles*
  shortcut.
- **PWA**: `manifest.webmanifest` makes the web app installable, and the
  service worker (`pwa/sw.js`, written to `dist/sw.js` at build time with the
  list of files to cache) caches the app shell. Pages are network-first with
  the cached shell as the offline fallback, hashed assets are cache-first, and
  Wikimedia images are answered from the saved-image cache. It is registered
  only on http(s) production builds; the KaiOS package is already installed
  locally and skips it. Saving still works on KaiOS (IndexedDB), but images are
  only kept offline on the web build.

Things not available offline: search, links to articles that are not saved,
the gallery's image details and the language list.

## Desktop card grid

From 900px wide, list screens (`Settings`, `Search` results, `Language`, `Tips`,
table of contents, article menu/footer) render as a card grid: one shell width of
`min(1600px, 92vw)` shared by headers and cards, with
`repeat(auto-fill, minmax(340px, 1fr))` columns and taller, bordered cards.
Navigation follows the grid — up/down move a whole row, left/right a single card
(`src/res/GridNav.res` + the `'grid'` axis in `useNavigation`). Below that width
nothing changes, so KaiOS layout and the legacy bundle are untouched.

The same breakpoint switches the article from the KaiOS hero (full-screen cover
background with the intro card at its bottom, pushed there by
`components/Article.js`) to normal document flow: a real `<img class='article-hero'>`
band, then the reading card. The softkey bar becomes `position: fixed` so it
stays put instead of landing mid-article, and the document gets matching bottom
padding. In-content figures grow from their 135px KaiOS thumbnails to up to
420px.

## Glassmorphic chrome

`style/mixin.scss` defines two materials; the tokens live in
`style/tokens.scss` (`--w-glass-bg`, `--w-glass-border`, `--w-glass-shadow`,
`--w-glass-blur`, `--w-backdrop-*`).

- `glass`: translucent tint, hairline border and inset highlight, no blur. Used
  for cards, headers, the article card and the search field. They sit over the
  static backdrop, and blurring a smooth gradient looks the same as not
  blurring it, so they skip the cost.
- `glass-overlay`: `glass` plus `backdrop-filter` blur. Used only for the
  pinned softkey bar and popups, which page content scrolls underneath.

The tinted wash is a fixed, non-animated `body::before` on its own compositor
layer in `style/responsive.scss`, so it only exists from 600px up and scrolling
never repaints it. KaiOS never pays for `backdrop-filter`. Hover and selection
only fade colours (`background-color` / `border-color`, 120ms): nothing moves
and no shadow animates. `prefers-reduced-motion` turns off all transitions and
animations.

Arrow-key navigation (`hooks/useNavigation.js`) writes `nav-selected` /
`nav-index` only on the cards whose value changes, and re-measures scroll
position only when the selection changes, so moving through a large grid
restyles two cards per keypress instead of all of them.

## Deploying the web app

The web build is deployed to Vercel as a static site (`vercel.json` runs
`bun install` + `bun run build` and serves `dist/`). `sw.js` is served with
`Cache-Control: no-cache` so new deployments reach installed copies.

To try the production build locally with the same request settings as Vercel:

```sh
bun run build:ci && bun run preview
```

```sh
bunx vercel --prod
```

## Documentation

- `MAP.txt` — file-by-file map of the repository.
- `MIGRATION.md` — Preact → ReScript migration status (via `cloc`).
- `i18n/` — translation files; `qqq.json` documents each message.
