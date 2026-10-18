import { cachedFetch } from 'utils'

// Most-read articles for the project, from the Wikimedia pageviews REST API
// (stable and CORS-enabled). Replaces the retired on-wiki KaiOS trending page.
export const getTrendingArticles = (lang, country) => {
  const date = new Date(Date.now() - 24 * 60 * 60 * 1000) // yesterday (UTC)
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  const url = `https://wikimedia.org/api/rest_v1/metrics/pageviews/top/${lang}.wikipedia/all-access/${year}/${month}/${day}`

  return cachedFetch(url, data => {
    const articles = (data && data.items && data.items[0] && data.items[0].articles) || []
    return articles
      .map(item => item.article)
      .filter(title => title && title.indexOf(':') === -1 && title !== 'Main_Page' && title !== '-')
      .slice(0, 5)
  })
}
