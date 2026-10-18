import {
  isProd, appVersion, sendErrorLog,
  isRequestHeaderDisabled, setUserCountry
} from 'utils'

// todo: Implement a real cache that keeps
// the last N requests to keep memory usage
// under control.
const requestCache = {}
const noopAbort = () => {}

// `url` may be a single URL or an ordered list of fallback URLs. The first one
// that succeeds wins, which lets callers degrade gracefully (e.g. legacy PCS
// `mobile-html` -> Core REST `html`).
export const cachedFetch = (url, transformFn, cache = true, format = 'json', header = {}) => {
  const urls = Array.isArray(url) ? url : [url]
  const cacheKey = urls[0]

  if (cache && requestCache[cacheKey]) {
    return [Promise.resolve(requestCache[cacheKey]), noopAbort]
  }

  let currentXhr = null

  const attempt = index => new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest({ mozSystem: true })
    currentXhr = xhr
    xhr.responseType = format
    xhr.open('GET', urls[index])

    if (!isRequestHeaderDisabled()) {
      // `Api-User-Agent` is the header Wikimedia expects from browser clients and
      // is in the CORS allow-list. `User-Agent`/`Referer` are forbidden header
      // names in browsers (silently ignored) but valid under KaiOS' mozSystem
      // XHR, so they are set defensively.
      try {
        xhr.setRequestHeader('Api-User-Agent', `WikipediaApp/${appVersion()} (unofficial rewrite)`)
      } catch (e) {}

      try {
        xhr.setRequestHeader('User-Agent', `WikipediaApp/${appVersion()} ${navigator.userAgent}`)
        xhr.setRequestHeader('Referer', 'https://www.wikipedia.org')
      } catch (e) {}

      if (Object.keys(header).length) {
        for (const key in header) {
          xhr.setRequestHeader(key, header[key])
        }
      }
    }

    const fail = () => {
      if (index + 1 < urls.length) {
        resolve(attempt(index + 1))
      } else {
        reject(new Error('XHR Error: ' + xhr.status))
      }
    }

    xhr.addEventListener('load', () => {
      // Accept all of 2xx and 3xx
      if (xhr.status >= 200 && xhr.status < 400) {
        resolve(transformFn(xhr.response))

        // set user located country
        const GeoIP = xhr.getAllResponseHeaders().match(/GeoIP=(\w+)/)
        const userCountry = GeoIP && GeoIP[1]
        if (userCountry) {
          // in device, there is always user country set in response header
          // in desktop, it is always null
          setUserCountry(userCountry)
        }
      } else {
        sendLogWhenError(xhr, urls[index])
        fail()
      }
    })

    xhr.addEventListener('error', () => {
      sendLogWhenError(xhr, urls[index])
      fail()
    })

    xhr.send()
  })

  const promise = attempt(0).then(result => {
    if (cache) {
      requestCache[cacheKey] = result
    }
    return result
  })

  const abort = () => {
    if (currentXhr) {
      currentXhr.abort()
    }
  }

  return [promise, abort]
}

const sendLogWhenError = ({ status, response }, url) => {
  if (!isProd()) {
    return
  }

  if (response && response.error) {
    sendErrorLog({ message: response.error.info, url })
  } else if (status >= 500 && status < 600) {
    sendErrorLog({ message: `${status} ${url}`, url })
  }
}
