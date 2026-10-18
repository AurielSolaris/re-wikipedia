import {
  cachedFetch, buildPcsUrl, buildCoreRestUrl, canonicalizeTitle, fixImgSrc, thumbUrl
} from 'utils'

// Bounded image widths. The lead image is used as the article hero (a full-width
// band on desktop, a cover background on KaiOS) and is shared with page
// previews; in-content images render inside the article column. `thumbUrl`
// rounds these up to a standard Wikimedia thumbnail step, which is required
// since non-standard widths now 400.
const CONTENT_IMAGE_WIDTH = 500
const LEAD_IMAGE_WIDTH = 960
// The hero band is up to `min( 1040px, 78vw )` wide, and may be shown at a 2x
// device pixel ratio, so wide viewports ask for the next step up.
const LEAD_IMAGE_WIDTH_WIDE = 1280

/**
 * Requested width for the lead/hero image. The summary endpoint only ships a
 * ~330px thumbnail, so anything that keeps that URL as-is ends up stretched and
 * blurry; every lead image is re-built at this width instead.
 */
export const leadImageWidth = () => {
  const width = typeof window === 'undefined' ? 0 : window.innerWidth
  if (width >= 1200) {
    return LEAD_IMAGE_WIDTH_WIDE
  }
  return width >= 900 ? LEAD_IMAGE_WIDTH : 500
}

const isSvgSource = url => /\.svg(\?|$|\/)/i.test(String(url || ''))

// Wikimedia already hands us valid, standard-size thumbnails: `data-src` on the
// PCS lazy-load placeholders and the `srcset` candidates. Only fall back to
// building a thumbnail (at a standard size) when there is nothing better.
const pickImageSrc = (node, lang, width) => {
  const srcset = node.getAttribute('srcset')
  const smallest = srcset && srcset.split(',')
    .map(part => part.trim().split(/\s+/)[0])
    .filter(Boolean)[0]

  const source = node.getAttribute('data-src') || smallest || node.getAttribute('src')
  if (!source) {
    return ''
  }

  // Inline icons and logos ship as SVG; keep the rendition the API provided
  // instead of rasterising them at a full content width.
  if (isSvgSource(source)) {
    return fixImgSrc(source, lang)
  }

  return thumbUrl(source, width, lang)
}

export const getArticle = (lang, title) => {
  const fallbackTitle = canonicalizeTitle(title)
  // Prefer the legacy PCS `mobile-html` document (the shape this parser was
  // written against); fall back to the supported Wikimedia Core REST `html`
  // endpoint so the app keeps working if PCS is retired.
  const urls = [
    buildPcsUrl(lang, title, 'mobile-html'),
    buildCoreRestUrl(lang, title)
  ]

  return cachedFetch(urls, data => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(data, 'text/html')
    const toc = []
    const sections = []
    const references = {}

    const getMeta = (prop, key = 'property') => {
      const metaNode = doc.querySelector('head > meta[' + key + '="' + prop + '"]')
      return metaNode && metaNode.getAttribute('content')
    }

    const lead = doc.querySelector('header')
    const section0 = doc.querySelector('section')
    if (!section0) {
      return {
        contentLang: getMeta('content-language', 'http-equiv'),
        namespace: 0,
        id: getMeta('mw:pageId'),
        sections: [],
        infobox: null,
        toc: [],
        references: {},
        dir: 'ltr'
      }
    }

    const infoboxNode = section0.querySelector('.infobox')
    const infobox = infoboxNode && modifyHtmlText(infoboxNode.outerHTML, lang)
    const pcsTableContainer = section0.querySelector('.pcs-collapse-table-container')
    pcsTableContainer && pcsTableContainer.remove()

    const h1 = lead && lead.querySelector('h1')
    const leadParagraph = lead && lead.querySelector('p')
    const firstImage = section0.querySelector('img')
    const articleTitle = (h1 && h1.textContent) || doc.title || fallbackTitle
    const articleDescription =
      (leadParagraph && leadParagraph.textContent) ||
      getMeta('description') ||
      undefined
    const leadImageMeta = getMeta('mw:leadImage')
    const leadImage = leadImageMeta
      ? thumbUrl(leadImageMeta, leadImageWidth(), lang)
      : (firstImage ? pickImageSrc(firstImage, lang, leadImageWidth()) : '')

    sections.push({
      imageUrl: leadImage || undefined,
      title: articleTitle,
      anchor: canonicalizeTitle(articleTitle),
      description: articleDescription,
      content: modifyHtmlText(section0.outerHTML, lang)
    })

    toc.push({
      level: 1,
      line: articleTitle,
      anchor: canonicalizeTitle(articleTitle),
      sectionIndex: 0
    })

    Array.from(doc.querySelectorAll('section')).forEach((section, index) => {
      if (index === 0) {
        return
      }
      const titleNode = section.querySelector('h1, h2, h3, h4, h5')
      if (!titleNode) {
        return
      }
      const title = titleNode.textContent
      const anchor = titleNode.id || canonicalizeTitle(title)
      const level = parseInt(titleNode.tagName.charAt(1)) - 1
      const sectionHeader = section.querySelector('.pcs-edit-section-header')

      const content = '<div>' + modifyHtmlText(section.innerHTML, lang) + '</div>'

      // new section when toclevel 1
      if (level === 1) {
        if (sectionHeader) {
          sectionHeader.remove()
        }
        sections.push({ title, anchor, content })
      }

      // build toc structure (level 1 to 3)
      level <= 3 && toc.push({
        level,
        line: title,
        anchor,
        sectionIndex: sections.length - 1
      })
    })

    // build references list
    const refNodes = doc.querySelectorAll('li[id^="cite_"]')
    for (const refNode of refNodes) {
      const [id, ref] = extractReference(refNode)
      references[id] = ref
    }

    const body = doc.querySelector('body')
    const result = {
      contentLang: getMeta('content-language', 'http-equiv'),
      namespace: parseInt(getMeta('mw:pageNamespace'), 10),
      id: getMeta('mw:pageId'),
      sections,
      infobox,
      toc,
      references,
      dir: (body && body.getAttribute('dir')) || 'ltr'
    }

    return result
  }, true, 'text', { 'X-Analytics': 'pageview=1' })
}

const modifyHtmlText = (text, lang) => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(text, 'text/html')

  // enable section
  const sectionNodes = doc.querySelectorAll('section')
  for (const sectionNode of sectionNodes) {
    sectionNode.style.removeProperty('display')
  }

  // enable lazyload image
  const imageSpanNodes = doc.querySelectorAll('span.pcs-lazy-load-placeholder')
  for (const imageSpanNode of imageSpanNodes) {
    const source = pickImageSrc(imageSpanNode, lang, CONTENT_IMAGE_WIDTH)
    if (source) {
      const image = doc.createElement('img')
      image.setAttribute('src', source)
      image.setAttribute('loading', 'lazy')
      image.setAttribute('decoding', 'async')
      imageSpanNode.parentNode.appendChild(image)

      if (!imageSpanNode.parentNode.classList.contains('image')) {
        imageSpanNode.parentNode.classList += ' image'
      }
    }
    imageSpanNode.remove()
  }

  // fix image node: normalise the URL, downscale to a thumbnail and drop the
  // responsive candidates so the browser can't pick a huge variant.
  const imageNodes = doc.querySelectorAll('img')
  for (const imageNode of imageNodes) {
    const url = pickImageSrc(imageNode, lang, CONTENT_IMAGE_WIDTH)
    if (url) {
      imageNode.setAttribute('src', url)
    } else {
      imageNode.removeAttribute('src')
    }
    imageNode.removeAttribute('srcset')
    imageNode.removeAttribute('sizes')
    imageNode.removeAttribute('data-src')
    imageNode.removeAttribute('data-height')
    imageNode.setAttribute('loading', 'lazy')
    imageNode.setAttribute('decoding', 'async')
  }

  return doc.body.innerHTML
}

const extractReference = refNode => {
  const id = refNode.getAttribute('id')
  const [, number] = id.match(/.*?-(\d+)/)
  const refContentNode = refNode.querySelector('.mw-reference-text')
  const content = refContentNode ? refContentNode.outerHTML : ''
  return [id, { number, content }]
}
