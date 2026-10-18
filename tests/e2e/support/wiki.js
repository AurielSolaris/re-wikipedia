import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { ARTICLES, SEARCH, mobileHtml, summary } from './fixtures.js'

// A fake Wikipedia: every request the app makes to Wikimedia hosts is answered
// from ./fixtures.js, so the tests run offline and never depend on live
// content. Anything that is not mocked gets a 404 and is recorded in
// `unhandled`, which the tests check is empty.

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
const PNG = fs.readFileSync(path.join(root, 'images/56px.png'))

const WIKIMEDIA = /^https:\/\/([a-z0-9-]+\.)*(wikipedia|wikimedia|mediawiki)\.org\//

const json = body => ({ status: 200, contentType: 'application/json', body: JSON.stringify(body) })
const notFound = { status: 404, contentType: 'application/json', body: '{"title":"Not found."}' }
// Wikimedia sends CORS headers on everything the app reads.
const cors = { 'access-control-allow-origin': '*' }

const pageTitle = url => decodeURIComponent(url.pathname.split('/').pop())

const searchResponse = term => {
  const results = SEARCH[term.trim().toLowerCase()] || []
  if (!results.length) {
    return { batchcomplete: true }
  }
  return {
    batchcomplete: true,
    query: {
      search: results.map((result, index) => ({ ns: 0, title: result.title, pageid: index + 1, snippet: result.snippet })),
      pages: results.map((result, index) => ({
        pageid: index + 1,
        ns: 0,
        title: result.title,
        ...(result.thumbnail ? { thumbnail: { source: result.thumbnail, width: 120, height: 90 } } : {})
      }))
    }
  }
}

const apiResponse = params => {
  if (params.get('list') === 'search') {
    return searchResponse(params.get('srsearch') || '')
  }
  if (params.get('list') === 'random') {
    return { query: { random: [{ title: 'Cattle' }] } }
  }
  if (params.get('prop') === 'langlinks') {
    return { query: { pages: [{ title: params.get('titles') }] } }
  }
  if ((params.get('gsrsearch') || '').startsWith('morelike:')) {
    return { query: { pages: [{ pageid: 2, ns: 0, title: 'Dairy cattle', description: 'Cattle bred for milk' }] } }
  }
  if (params.get('prop') === 'imageinfo') {
    return { query: { pages: [] } }
  }
  return null
}

const restResponse = url => {
  // Wikimedia Core REST, the app's fallback for article HTML.
  const core = url.hostname === 'api.wikimedia.org' && url.pathname.match(/\/page\/([^/]+)\/html$/)
  if (core) {
    const title = decodeURIComponent(core[1])
    return ARTICLES[title]
      ? { status: 200, contentType: 'text/html; charset=utf-8', body: mobileHtml(title, ARTICLES[title]) }
      : notFound
  }
  const match = url.pathname.match(/\/api\/rest_v1\/page\/([a-z-]+)\//)
  if (!match) {
    return null
  }
  const title = pageTitle(url)
  const article = ARTICLES[title]
  if (!article) {
    return notFound
  }
  switch (match[1]) {
    case 'mobile-html':
      return { status: 200, contentType: 'text/html; charset=utf-8', body: mobileHtml(title, article) }
    case 'summary':
      return json(summary(title, article))
    case 'media-list':
      return json({ items: [] })
    default:
      return null
  }
}

const respond = url => {
  if (/(^|\.)upload\.wikimedia\.org$/.test(url.hostname)) {
    return { status: 200, contentType: 'image/png', body: PNG }
  }
  if (/^intake-|beacon/.test(url.hostname + url.pathname)) {
    return { status: 204, body: '' }
  }
  if (url.hostname === 'wikimedia.org' && url.pathname.includes('/pageviews/top/')) {
    return json({ items: [{ articles: [{ article: 'Cattle' }, { article: 'Dairy_cattle' }] }] })
  }
  if (url.pathname === '/w/api.php') {
    const body = apiResponse(url.searchParams)
    return body && json(body)
  }
  return restResponse(url)
}

// Returns `{ unhandled, setOffline }`. Routes answer even when the browser is
// offline, so going offline has to go through `setOffline`, which also makes
// the fake Wikipedia unreachable.
export const mockWikipedia = async context => {
  const unhandled = []
  let offline = false
  await context.route(WIKIMEDIA, route => {
    if (offline) {
      return route.abort('internetdisconnected')
    }
    const request = route.request()
    if (request.method() === 'OPTIONS') {
      return route.fulfill({
        status: 204,
        headers: { ...cors, 'access-control-allow-headers': '*', 'access-control-allow-methods': 'GET, POST' }
      })
    }
    const url = new URL(request.url())
    const response = respond(url)
    if (!response) {
      unhandled.push(request.url())
      return route.fulfill({ ...notFound, headers: cors })
    }
    return route.fulfill({ ...response, headers: { ...cors, ...response.headers } })
  })
  const setOffline = async value => {
    offline = value
    await context.setOffline(value)
  }
  return { unhandled, setOffline }
}
