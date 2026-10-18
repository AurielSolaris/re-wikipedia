import { canonicalizeTitle } from 'utils'

const defautParams = {
  format: 'json',
  formatversion: 2,
  origin: '*'
}

export const buildMwApiUrl = (lang, params) => {
  params = Object.assign({}, defautParams, params)
  const baseUrl = `https://${lang}.wikipedia.org/w/api.php`
  return baseUrl + '?' + Object.keys(params).map(p => {
    return `${p}=${encodeURIComponent(params[p])}`
  }).join('&')
}

export const buildMwOrgApiUrl = params => {
  params = Object.assign({}, defautParams, params)
  const baseUrl = 'https://www.mediawiki.org/w/api.php'
  return baseUrl + '?' + Object.keys(params).map(p => {
    return `${p}=${encodeURIComponent(params[p])}`
  }).join('&')
}

export const buildWpMobileWebUrl = (lang, title) => {
  const page = encodeURIComponent(canonicalizeTitle(title))
  return `https://${lang}.m.wikipedia.org/w/index.php?title=${page}`
}

export const buildPcsUrl = (lang, title, endpoint) => {
  const base = `https://${lang}.wikipedia.org`
  const path = `api/rest_v1/page/${endpoint}`
  const page = encodeURIComponent(canonicalizeTitle(title))
  return `${base}/${path}/${page}`
}

// Current, CORS-enabled Wikimedia Core REST API (api.wikimedia.org). Used as a
// fallback for article HTML when the legacy PCS `mobile-html` endpoint is
// unavailable, and for other v1 reads.
export const buildCoreRestUrl = (lang, title, endpoint = 'html') => {
  const base = `https://api.wikimedia.org/core/v1/wikipedia/${lang}`
  const page = encodeURIComponent(canonicalizeTitle(title))
  return `${base}/page/${page}/${endpoint}`
}

