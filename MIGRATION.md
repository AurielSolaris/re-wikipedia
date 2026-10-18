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
| `src/components`            | JS       | 39    | 2046       |
| `src/hooks`                 | JS       | 21    | 839        |
| `src/utils`                 | JS       | 27    | 677        |
| `src/api`                   | JS       | 10    | 328        |
| `src/reducers`              | JS       | 2     | 62         |
| `src/contexts`              | JS       | 6     | 15         |
| `src/index.js` (entry)      | JS       | 1     | 21         |
| **Remaining (JS)**          |          | 106   | 3988       |
| **Converted (`src/res`)**   | ReScript | 1     | 6          |
| **Total `src`**             |          | 107   | 3994       |

Progress: ~0.2% converted (6 / 3994 code lines).

## Largest files still to convert

| Code lines | File                                        |
| ---------- | ------------------------------------------- |
| 257        | `components/Article.js`                     |
| 199        | `utils/consent.js`                          |
| 190        | `hooks/useArticleLinksNavigation.js`        |
| 154        | `components/Search.js`                      |
| 135        | `components/Feedback.js`                    |
| 126        | `components/Tips.js`                        |
| 125        | `components/Gallery.js`                     |
| 121        | `utils/languages.js`                        |
| 115        | `api/getArticle.js`                         |
| 99         | `components/ArticleMenu.js`                 |
| 98         | `hooks/useTracking.js`                      |

## Done so far

- `src/res/Hello.res` (+ generated `Hello.res.mjs`) — first ReScript component,
  mounted into the Preact tree through `src/components/ReactIsland.js`
  (React `createRoot` island), hosted by `src/components/AboutApp.js`.
