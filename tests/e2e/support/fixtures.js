// Canned Wikipedia content for the end-to-end tests: search results and two
// small articles in the shape of the page content service `mobile-html`.

const COMMONS = 'https://upload.wikimedia.org/wikipedia/commons'

export const IMAGES = {
  cow: `${COMMONS}/thumb/0/0c/Cow_female_black_white.jpg/500px-Cow_female_black_white.jpg`,
  cowLead: `${COMMONS}/0/0c/Cow_female_black_white.jpg`,
  cowThumb: `${COMMONS}/thumb/0/0c/Cow_female_black_white.jpg/120px-Cow_female_black_white.jpg`,
  milk: `${COMMONS}/thumb/4/4b/Milking.jpg/500px-Milking.jpg`
}

// Search term (lower case) -> results.
export const SEARCH = {
  cattle: [
    { title: 'Cattle', snippet: 'Large domesticated <span class="searchmatch">bovines</span>', thumbnail: IMAGES.cowThumb },
    { title: 'Dairy cattle', snippet: 'Cattle bred for milk' }
  ],
  'helena catt': [
    { title: 'Helena Catt', snippet: 'British racing driver' }
  ]
}

const reference = (id, number) =>
  `<sup class="mw-ref reference" id="cite_ref-${id}"><a href="./${'Cattle'}#cite_note-${id}" class="reference-link"><span class="mw-reflink-text">[${number}]</span></a></sup>`

export const ARTICLES = {
  Cattle: {
    description: 'Large domesticated bovines',
    leadImage: IMAGES.cowLead,
    lead: `<p><b>Cattle</b> are large, domesticated, bovid ungulates kept for meat and
      <a href="./Dairy_cattle" title="Dairy cattle">milk</a>.${reference('1', 1)}</p>
      <figure><span class="pcs-lazy-load-placeholder" data-src="${IMAGES.cow}" data-width="500" data-height="375"></span></figure>`,
    infobox: '<table class="infobox"><tbody><tr><th>Kingdom</th><td>Animalia</td></tr></tbody></table>',
    sections: [
      { title: 'Etymology', html: '<p>The word cattle comes from Middle English.</p>' },
      { title: 'History', html: '<p>Cattle were domesticated about 10,500 years ago.</p>' },
      { title: 'References', html: '<ol class="references"><li id="cite_note-1"><span class="mw-reference-text">Cattle reference text.</span></li></ol>' }
    ]
  },
  Dairy_cattle: {
    description: 'Cattle bred for milk',
    lead: `<p><b>Dairy cattle</b> are cattle bred for milk.</p>
      <figure><span class="pcs-lazy-load-placeholder" data-src="${IMAGES.milk}" data-width="500" data-height="375"></span></figure>`,
    sections: [
      { title: 'Breeds', html: '<p>Holstein, Jersey and Guernsey.</p>' }
    ]
  }
}

export const displayTitle = title => title.split('_').join(' ')

export const mobileHtml = (title, article) => {
  const name = displayTitle(title)
  const sections = article.sections.map((section, index) => `
    <section data-mw-section-id="${index + 1}">
      <div class="pcs-edit-section-header v2"><h2 id="${section.title}" class="pcs-edit-section-title">${section.title}</h2></div>
      ${section.html}
    </section>`).join('')

  return `<!DOCTYPE html><html><head><meta charset="utf-8">
    <meta property="mw:pageNamespace" content="0"><meta property="mw:pageId" content="1">
    <meta http-equiv="content-language" content="en">
    ${article.leadImage ? `<meta property="mw:leadImage" content="${article.leadImage}">` : ''}
    <title>${name}</title></head>
    <body dir="ltr"><div id="pcs">
      <header><div class="pcs-edit-section-header v2"><h1 class="pcs-edit-section-title">${name}</h1>
        <p id="pcs-edit-section-title-description">${article.description}</p></div></header>
      <section data-mw-section-id="0">${article.infobox || ''}${article.lead}</section>
      ${sections}
    </div></body></html>`
}

export const summary = (title, article) => ({
  titles: { canonical: title, normalized: displayTitle(title), display: displayTitle(title) },
  pageid: 1,
  namespace: { id: 0 },
  description: article.description,
  extract_html: `<p>${article.description}.</p>`,
  ...(article.leadImage ? { thumbnail: { source: IMAGES.cowThumb } } : {})
})
