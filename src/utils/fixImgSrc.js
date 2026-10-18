
// Wikimedia image URL helpers.
//
// Since the 2025/2026 CDN change, upload.wikimedia.org rejects *any* thumbnail
// width that is not one of the standard steps ($wgThumbnailSteps) with HTTP 400
// ("Use thumbnail sizes listed on https://w.wiki/GHai"). The supported way to
// get an arbitrary size is the imageinfo API (iiurlwidth), which rounds up to
// the next step; here we do the same rounding ourselves so constructed URLs are
// always acceptable.
// https://www.mediawiki.org/wiki/Common_thumbnail_sizes

import { steps, snap } from '../res/ThumbSize.res.mjs'

// Standard Wikimedia thumbnail widths, in pixels. The step list and the
// rounding live in ReScript (src/res/ThumbSize.res).
export const THUMB_STEPS = steps

/** Rounds a width up to the smallest standard thumbnail step. */
export const snapToThumbStep = snap

// upload.wikimedia.org or thumb.wikimedia.org, with the /wikipedia/<repo>/
// prefix and optional /thumb/ plus size segment, so both originals and already
// thumbnailed URLs can be re-pointed at another standard size.
const UPLOAD_URL = /^(https?:\/\/[^/]*?\.?wikimedia\.org)(\/wikipedia\/[^/]+\/)(?:thumb\/)?([0-9a-f])\/([0-9a-f]{2})\/([^/]+?)(?:\/\d+px-[^/]+)?$/i

const NEEDS_PNG_THUMB = /\.(svg|tiff?)$/i

export const fixImgSrc = (originalSrc, lang) => {
  if (!originalSrc) {
    return ''
  }
  let src = String(originalSrc).trim()
  if (!src) {
    return ''
  }

  // protocol relative path
  if (src.startsWith('//')) {
    src = 'https:' + src
  }

  // extensions relative path
  src = src.replace(/^\/w\/extensions\//gi, `https://${lang}.wikipedia.org/w/extensions/`)

  return src
}

/**
 * Rewrites a Wikimedia file URL to a thumbnail at the next standard size that
 * fits `width`. Returns the normalised original when the file cannot be
 * thumbnailed, so the result is always safe to use as an image source.
 */
export const thumbUrl = (originalSrc, width, lang) => {
  const src = fixImgSrc(originalSrc, lang)
  if (!src || !width) {
    return src
  }

  const withoutQuery = src.split('?')[0]
  const match = withoutQuery.match(UPLOAD_URL)
  if (!match) {
    return src
  }

  const [, host, repoPath, first, second, fileName] = match

  // Animated GIFs and unknown extensions are left untouched: thumbnails are
  // either static or unsupported for them.
  if (!/\.(jpe?g|png|webp|svg|tiff?)$/i.test(fileName)) {
    return src
  }

  const size = snapToThumbStep(width)
  const thumbName = NEEDS_PNG_THUMB.test(fileName) ? `${fileName}.png` : fileName
  return `${host}${repoPath}thumb/${first}/${second}/${fileName}/${size}px-${thumbName}`
}
