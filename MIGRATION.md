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

## Snapshot — 2026-10-18

| Area                        | Language | Files | Code lines |
| --------------------------- | -------- | ----- | ---------- |
| `src/components`            | JS       | 40    | 2279       |
| `src/hooks`                 | JS       | 23    | 925        |
| `src/utils`                 | JS       | 30    | 894        |
| `src/api`                   | JS       | 10    | 386        |
| `src/reducers`              | JS       | 2     | 62         |
| `src/contexts`              | JS       | 6     | 15         |
| `src/index.js` (entry)      | JS       | 1     | 23         |
| **Remaining (JS)**          |          | 112   | 4584       |
| **Converted (`src/res`)**   | ReScript | 5     | 122        |
| **Total `src`**             |          | 117   | 4706       |

Progress: ~2.6% converted (122 / 4706 code lines).

## Largest files still to convert

| Code lines | File                                        |
| ---------- | ------------------------------------------- |
| 257        | `components/Article.js`                     |
| 214        | `hooks/useArticleLinksNavigation.js`        |
| 199        | `utils/consent.js`                          |
| 185        | `components/icons.js`                       |
| 172        | `api/getArticle.js`                         |
| 154        | `components/Search.js`                      |
| 135        | `components/Feedback.js`                    |
| 127        | `components/Tips.js`                        |
| 125        | `components/Gallery.js`                     |
| 121        | `utils/languages.js`                        |
| 115        | `hooks/useNavigation.js`                    |

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
