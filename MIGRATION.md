# Migration tracker — Preact (JS) → ReScript + React

This file tracks the incremental migration of the app from Preact/JavaScript to
ReScript + React (see `rescript.json`, `src/res/`). Update the snapshot whenever
meaningful conversion work lands.

## How to measure

```sh
bun run stats
```

This runs `cloc` over `src/`, excluding generated ReScript output (`*.res.mjs`),
so the numbers reflect hand-written source only.

## Snapshot — 2026-10-18 (after saved articles / PWA)

| Area                        | Language | Files | Code lines |
| --------------------------- | -------- | ----- | ---------- |
| `src/components`            | JS       | 41    | 2431       |
| `src/hooks`                 | JS       | 24    | 1017       |
| `src/utils`                 | JS       | 31    | 908        |
| `src/api`                   | JS       | 10    | 392        |
| `src/reducers`              | JS       | 2     | 62         |
| `src/contexts`              | JS       | 6     | 15         |
| `src/index.js` (entry)      | JS       | 1     | 32         |
| **Remaining (JS)**          |          | 115   | 4857       |
| **Converted (`src/res`)**   | ReScript | 6     | 420        |
| **Total `src`**             |          | 121   | 5277       |

Progress: ~8.0% converted (420 / 5277 code lines). The offline-reading feature
was written ReScript-first: its store (298 lines) is new ReScript, while the JS
it needed (the Saved screen, a hook, a 15-line wrapper and the Article/Search/
menu wiring) stays in Preact until the views move over.

## Largest files still to convert

| Code lines | File                                        |
| ---------- | ------------------------------------------- |
| 282        | `components/Article.js`                     |
| 217        | `hooks/useArticleLinksNavigation.js`        |
| 199        | `utils/consent.js`                          |
| 196        | `components/icons.js`                       |
| 178        | `api/getArticle.js`                         |
| 158        | `components/Search.js`                      |
| 135        | `components/Feedback.js`                    |
| 132        | `components/ArticleMenu.js`                 |
| 127        | `components/Tips.js`                        |
| 125        | `components/Gallery.js`                     |
| 121        | `utils/languages.js`                        |

## Done so far

- `src/res/Hello.res` (+ generated `Hello.res.mjs`) — first ReScript component,
  mounted into the Preact tree through `src/components/ReactIsland.js`
  (React `createRoot` island), hosted by `src/components/AboutApp.js`.
- `src/res/Loading.res` — the loading indicator (moon/earth/galaxy + message),
  re-implemented in ReScript + React and wrapped by `src/components/Loading.js`
  through the same island bridge.
- `src/res/ThumbSize.res` — standard Wikimedia thumbnail widths and the rounding
  used for every image URL (`src/utils/fixImgSrc.js` re-exports it).
- `src/res/Preference.res` — generic observable preference store (cache,
  allow-list validation, persistence, notification) used by
  `src/utils/preference.js`, `utils/theme.js` and `utils/touchSupport.js`.
- `src/res/GridNav.res` — pure grid navigation maths (column count, step, wrap)
  used by `src/hooks/useNavigation.js` for the desktop card grid.
- `src/res/SavedArticles.res` — the offline article store: IndexedDB bindings
  (`open`/`transaction`/`put`/`get`/`count`/`getAll`/`delete`) for the article
  text, Cache Storage bindings for its images, change subscriptions, image URL
  collection from the article HTML and the rows of the Saved screen
  (`listItemOf`). `src/utils/savedArticles.js` only re-exports it. Uses
  ReScript 12 `async`/`await`, an `@unboxed` variant for the
  `imageUrl: string | false` field and optional record fields.
