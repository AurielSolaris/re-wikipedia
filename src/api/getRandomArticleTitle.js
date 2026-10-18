import { buildMwApiUrl, cachedFetch } from 'utils'

export const getRandomArticleTitle = lang => {
  const params = {
    action: 'query',
    list: 'random',
    rnnamespace: 0,
    rnlimit: 1
  }
  const url = buildMwApiUrl(lang, params)

  return cachedFetch(url, data => data.query.random[0].title, false)
}
