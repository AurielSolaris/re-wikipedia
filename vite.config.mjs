import { defineConfig } from 'vite'
import fs from 'node:fs'
import crypto from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import preact from '@preact/preset-vite'
import legacy from '@vitejs/plugin-legacy'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const manifestFile = process.env.MANIFEST_FILE || './manifest.webapp'
const resolvedManifestFile = path.resolve(__dirname, manifestFile)
const manifest = JSON.parse(fs.readFileSync(resolvedManifestFile))

// Copies static assets that are referenced by relative URL from the markup
// (images/...) as well as the manifest into the build output, so that the
// contents of dist/ form a complete, installable KaiOS app.
const copyStatic = () => ({
  name: 'copy-static',
  closeBundle () {
    fs.cpSync(path.resolve(__dirname, 'images'), path.resolve(__dirname, 'dist/images'), { recursive: true })
    fs.copyFileSync(resolvedManifestFile, path.resolve(__dirname, 'dist/manifest.webapp'))
    // Crawler / SEO files and the web app manifest, served from the
    // deployment root.
    for (const file of ['robots.txt', 'sitemap.xml', 'manifest.webmanifest']) {
      const src = path.resolve(__dirname, file)
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, path.resolve(__dirname, 'dist', file))
      }
    }
    writeServiceWorker()
  }
})

const listFiles = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
  const full = path.join(dir, entry.name)
  return entry.isDirectory() ? listFiles(full) : [full]
})

// Writes dist/sw.js from pwa/sw.js with the app shell to precache: index.html,
// the web app manifest, the modern chunks and images/. The legacy (Firefox 37 /
// KaiOS) chunks are left out, since browsers that run service workers never
// load them.
const SHELL_FILES = ['index.html', 'manifest.webmanifest']

const writeServiceWorker = () => {
  const dist = path.resolve(__dirname, 'dist')
  const files = listFiles(dist)
    .map(file => path.relative(dist, file).split(path.sep).join('/'))
    .filter(file => SHELL_FILES.includes(file) || /^(assets|images)\//.test(file))
    .filter(file => !/-legacy[-.]/.test(file) && !file.endsWith('.map'))
    .sort()

  const hash = crypto.createHash('sha1')
  for (const file of files) {
    hash.update(file)
    if (file === 'index.html') {
      hash.update(fs.readFileSync(path.join(dist, file)))
    }
  }
  const version = hash.digest('hex').slice(0, 12)

  const template = fs.readFileSync(path.resolve(__dirname, 'pwa/sw.js'), 'utf8')
  const sw = template
    .replace("'__VERSION__'", JSON.stringify(version))
    .replace('= __PRECACHE__', '= ' + JSON.stringify(['./'].concat(files), null, 2))
  fs.writeFileSync(path.join(dist, 'sw.js'), sw)
}

export default defineConfig({
  // KaiOS packages load from a relative origin (`app://...`), while the web
  // deployment (Vercel) needs an absolute base so client-side routes such as
  // `/article/Foo` still resolve `/assets/*` after a hard refresh.
  base: process.env.VITE_BASE || './',
  publicDir: false,
  plugins: [
    // The React aliases are disabled so that ReScript + React code resolves the
    // real `react`/`react-dom` (see src/res) while the existing Preact code keeps
    // importing `preact`/`preact/compat` explicitly.
    preact({ babel: {}, reactAliasesEnabled: false }),
    legacy({
      targets: ['Firefox >= 37'],
      renderLegacyChunks: true
    }),
    copyStatic()
  ],
  resolve: {
    alias: {
      api: path.resolve(__dirname, 'src/api'),
      components: path.resolve(__dirname, 'src/components'),
      contexts: path.resolve(__dirname, 'src/contexts'),
      hooks: path.resolve(__dirname, 'src/hooks'),
      reducers: path.resolve(__dirname, 'src/reducers'),
      utils: path.resolve(__dirname, 'src/utils'),
      i18n: path.resolve(__dirname, 'i18n')
    }
  },
  define: {
    APP_VERSION: JSON.stringify(manifest.version),
    CIRCLE_SHA1: JSON.stringify(process.env.CIRCLE_SHA1 || '-'),
    INSTRUMENTATION: JSON.stringify(!!parseInt(process.env.INSTRUMENTATION)),
    RANDOM: JSON.stringify(!!parseInt(process.env.RAND)),
    TARGET_STORE: JSON.stringify(process.env.TARGET_STORE || 'kai'),
    DISABLE_REQUEST_HEADER: JSON.stringify(!!parseInt(process.env.DISABLE_REQUEST_HEADER))
  },
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'legacy-js-api']
      }
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'vendor-preact',
              test: /[\\/]node_modules[\\/](preact|preact-router|history)[\\/]/,
              priority: 30
            },
            {
              name: 'vendor-i18n',
              test: /[\\/]node_modules[\\/](banana-i18n|intl-pluralrules)[\\/]/,
              priority: 20
            },
            // `react`/`react-dom` are intentionally not grouped: they are only
            // reachable from the ReScript island, so they split into their own
            // lazily-loaded chunk instead of the initial payload.
            {
              name: 'vendor-react',
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              priority: 15
            }
          ]
        }
      }
    }
  },
  server: {
    host: '127.0.0.1',
    port: 8080
  }
})
