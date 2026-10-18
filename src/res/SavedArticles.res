// Articles saved for offline reading.
//
// The parsed article (sections, contents, references, ...) is kept in
// IndexedDB; its images go into a Cache Storage bucket that the service worker
// (sw.js) answers image requests from when there is no network. Used through
// src/utils/savedArticles.js.

let dbName = "wikipedia-saved"
let dbVersion = 1
let storeName = "articles"
// Must match SAVED_IMAGE_CACHE in sw.js.
let imageCacheName = "saved-article-images"

// --- Article shape (only the fields read here) -----------------------------

// The footer section carries `imageUrl: false`.
@unboxed type imageField = Url(string) | Flag(bool)

type section = {
  title?: string,
  description?: string,
  content?: string,
  imageUrl?: imageField,
}

type article = {
  sections: array<section>,
  infobox?: Nullable.t<string>,
}

type record = {
  key: string,
  lang: string,
  title: string,
  displayTitle: string,
  description: string,
  imageUrl: string,
  imageUrls: array<string>,
  savedAt: float,
  article?: article,
}

// --- Pure helpers ------------------------------------------------------------

// `String.replaceAll` compiles to JS `replaceAll`, which KaiOS (Gecko 48) lacks.
let replaceAll = (text, search, replacement) =>
  text->String.split(search)->Array.join(replacement)

let normalizeTitle = title => replaceAll(title, "_", " ")

let keyFor = (lang, title) => `${lang}/${normalizeTitle(title)}`

@new external makeUrl: (string, string) => {"href": string} = "URL"
@val @scope(("window", "location")) external locationHref: string = "href"

let resolveUrl = src =>
  if src == "" || String.startsWith(src, "data:") {
    None
  } else {
    try {
      Some(makeUrl(replaceAll(src, "&amp;", "&"), locationHref)["href"])
    } catch {
    | _ => None
    }
  }

let imgSrc = RegExp.fromString(`<img\\b[^>]*?\\ssrc="([^"]+)"`, ~flags="g")

let srcsIn = html => {
  let found = []
  RegExp.setLastIndex(imgSrc, 0)
  let rec loop = () =>
    switch RegExp.exec(imgSrc, html) {
    | Some(result) =>
      switch RegExp.Result.matches(result) {
      | [Some(src)] => Array.push(found, src)
      | _ => ()
      }
      loop()
    | None => ()
    }
  loop()
  found
}

// Every image the saved copy displays: the lead image and the <img> tags in
// the section bodies and the infobox, de-duplicated.
let imageUrlsOf = (article: article) => {
  let seen = Set.make()
  let urls = []
  let add = src =>
    switch resolveUrl(src) {
    | Some(url) if !Set.has(seen, url) =>
      Set.add(seen, url)
      Array.push(urls, url)
    | _ => ()
    }
  Array.forEach(article.sections, section => {
    switch section.imageUrl {
    | Some(Url(url)) => add(url)
    | _ => ()
    }
    switch section.content {
    | Some(html) => Array.forEach(srcsIn(html), add)
    | None => ()
    }
  })
  switch article.infobox {
  | Some(infobox) =>
    switch Nullable.toOption(infobox) {
    | Some(html) => Array.forEach(srcsIn(html), add)
    | None => ()
    }
  | None => ()
  }
  urls
}

let summaryOf = (~lang, ~title, ~article: article, ~now) => {
  let lead = Array.get(article.sections, 0)
  let leadTitle = Option.flatMap(lead, s => s.title)
  let leadDescription = Option.flatMap(lead, s => s.description)
  let leadImage = switch Option.flatMap(lead, s => s.imageUrl) {
  | Some(Url(url)) => url
  | _ => ""
  }
  {
    key: keyFor(lang, title),
    lang,
    title: normalizeTitle(title),
    displayTitle: Option.getOr(leadTitle, normalizeTitle(title)),
    description: Option.getOr(leadDescription, ""),
    imageUrl: leadImage,
    imageUrls: imageUrlsOf(article),
    savedAt: now,
    article,
  }
}

// --- Change notification ----------------------------------------------------

let listeners: ref<array<unit => unit>> = ref([])

let subscribe = listener => {
  Array.push(listeners.contents, listener)
  () => listeners := Array.filter(listeners.contents, l => l !== listener)
}

let notify = () => Array.forEach(Array.copy(listeners.contents), listener => listener())

// --- IndexedDB bindings -----------------------------------------------------

type factory
type db
type openRequest
type transaction
type store
type request<'a>
type nameList

// Reading `indexedDB` can itself throw (sandboxed frames, blocked storage).
let getFactory: unit => Nullable.t<factory> = %raw(`function () {
  try { return typeof indexedDB === 'undefined' ? null : indexedDB } catch (e) { return null }
}`)

@send external openDb: (factory, string, int) => openRequest = "open"
@get external openResult: openRequest => db = "result"
@set external onUpgradeNeeded: (openRequest, unit => unit) => unit = "onupgradeneeded"
@set external onOpenSuccess: (openRequest, unit => unit) => unit = "onsuccess"
@set external onOpenError: (openRequest, unit => unit) => unit = "onerror"
@set external onOpenBlocked: (openRequest, unit => unit) => unit = "onblocked"

@get external objectStoreNames: db => nameList = "objectStoreNames"
@send external contains: (nameList, string) => bool = "contains"
@send external createObjectStore: (db, string, {"keyPath": string}) => unit = "createObjectStore"
@send external transaction: (db, string, string) => transaction = "transaction"

@send external objectStore: (transaction, string) => store = "objectStore"
@set external onComplete: (transaction, unit => unit) => unit = "oncomplete"
@set external onTxError: (transaction, unit => unit) => unit = "onerror"
@set external onAbort: (transaction, unit => unit) => unit = "onabort"

@get external result: request<'a> => 'a = "result"
@send external put: (store, record) => request<string> = "put"
@send external getRecord: (store, string) => request<Nullable.t<record>> = "get"
@send external count: (store, string) => request<int> = "count"
@send external getAll: store => request<array<record>> = "getAll"
@send external deleteRecord: (store, string) => request<unit> = "delete"

let isSupported = () => Nullable.toOption(getFactory())->Option.isSome

let fail = message => Promise.reject(JsError.make(message)->JsError.toJsExn->JsExn)

let connection: ref<option<promise<db>>> = ref(None)

let connect = () =>
  switch connection.contents {
  | Some(pending) => pending
  | None =>
    let pending = switch Nullable.toOption(getFactory()) {
    | None => fail("IndexedDB is not available")
    | Some(factory) =>
      Promise.make((resolve, reject) => {
        let request = openDb(factory, dbName, dbVersion)
        request->onUpgradeNeeded(() => {
          let db = openResult(request)
          if !contains(objectStoreNames(db), storeName) {
            createObjectStore(db, storeName, {"keyPath": "key"})
          }
        })
        request->onOpenSuccess(() => resolve(openResult(request)))
        request->onOpenError(() => reject(JsError.make("Could not open saved articles")))
        request->onOpenBlocked(() => reject(JsError.make("Saved articles are blocked")))
      })
    }
    // A failed open (e.g. a private window) is retried on the next call.
    let guarded = pending->Promise.catch(error => {
      connection := None
      Promise.reject(error)
    })
    connection := Some(guarded)
    guarded
  }

// Runs one request in its own transaction and resolves once it has committed.
let run = async (mode, operation: store => request<'a>): 'a => {
  let db = await connect()
  await Promise.make((resolve, reject) => {
    let tx = transaction(db, storeName, mode)
    let request = operation(objectStore(tx, storeName))
    tx->onComplete(() => resolve(result(request)))
    tx->onTxError(() => reject(JsError.make("Saved articles transaction failed")))
    tx->onAbort(() => reject(JsError.make("Saved articles transaction aborted")))
  })
}

// --- Cache Storage bindings (images) ------------------------------------------

type cache
type response

let hasCaches: unit => bool = %raw(`function () { return typeof caches !== 'undefined' }`)

@val @scope("caches") external openCache: string => promise<cache> = "open"
@send external cacheMatch: (cache, string) => promise<Nullable.t<response>> = "match"
@send external cachePut: (cache, string, response) => promise<unit> = "put"
@send external cacheDelete: (cache, string) => promise<bool> = "delete"
@val external fetch: (string, {"mode": string, "credentials": string}) => promise<response> = "fetch"
@get external ok: response => bool = "ok"

let fetchForCache = async url =>
  switch await fetch(url, {"mode": "cors", "credentials": "omit"}) {
  | response if ok(response) => response
  // Hosts without CORS headers still give an opaque response an <img> can show.
  | _ => await fetch(url, {"mode": "no-cors", "credentials": "omit"})
  | exception _ => await fetch(url, {"mode": "no-cors", "credentials": "omit"})
  }

let cacheOne = async (cache, url) =>
  try {
    switch Nullable.toOption(await cacheMatch(cache, url)) {
    | Some(_) => ()
    | None => await cachePut(cache, url, await fetchForCache(url))
    }
  } catch {
  | _ => ()
  }

// Best effort, four downloads at a time: a missing image never fails a save.
let cacheImages = async urls =>
  if hasCaches() && Array.length(urls) > 0 {
    try {
      let cache = await openCache(imageCacheName)
      let queue = Array.copy(urls)
      let rec worker = async () =>
        switch Array.shift(queue) {
        | Some(url) =>
          await cacheOne(cache, url)
          await worker()
        | None => ()
        }
      let _ = await Promise.all([worker(), worker(), worker(), worker()])
    } catch {
    | _ => ()
    }
  }

let uncacheImages = async (urls, ~keep: Set.t<string>) =>
  if hasCaches() {
    try {
      let cache = await openCache(imageCacheName)
      let _ = await Promise.all(
        urls
        ->Array.filter(url => !Set.has(keep, url))
        ->Array.map(url => cacheDelete(cache, url)),
      )
    } catch {
    | _ => ()
    }
  }

// --- Public API ---------------------------------------------------------------

let save = async (lang, title, article) => {
  let record = summaryOf(~lang, ~title, ~article, ~now=Date.now())
  let _ = await run("readwrite", store => put(store, record))
  notify()
  await cacheImages(record.imageUrls)
  record
}

let get = async (lang, title) =>
  Nullable.toOption(await run("readonly", store => getRecord(store, keyFor(lang, title))))

let isSaved = async (lang, title) =>
  try {
    (await run("readonly", store => count(store, keyFor(lang, title)))) > 0
  } catch {
  | _ => false
  }

// Newest first, without the article bodies.
let list = async () =>
  try {
    let records = await run("readonly", getAll)
    let summaries = Array.map(records, record => {...record, article: ?None})
    // `toSorted` is too new for KaiOS and older Safari.
    Array.sort(summaries, (a, b) => b.savedAt -. a.savedAt)
    summaries
  } catch {
  | _ => []
  }

let remove = async (lang, title) => {
  let key = keyFor(lang, title)
  let removed = Nullable.toOption(await run("readonly", store => getRecord(store, key)))
  let _ = await run("readwrite", store => deleteRecord(store, key))
  notify()
  switch removed {
  | None => ()
  | Some(record) =>
    // Images can be shared between saved articles: keep the ones another saved
    // article still shows.
    let keep = Set.make()
    Array.forEach(await list(), other => Array.forEach(other.imageUrls, url => Set.add(keep, url)))
    await uncacheImages(record.imageUrls, ~keep)
  }
}

// --- List screen --------------------------------------------------------------

type listItem = {
  title: string,
  description: string,
  imageUrl?: string,
}

// ListView renders descriptions as HTML; saved descriptions are plain text.
let escapeHtml = text =>
  text
  ->replaceAll("&", "&amp;")
  ->replaceAll("<", "&lt;")
  ->replaceAll(">", "&gt;")

// The row for one saved article. Articles from another language than the app's
// are tagged with their language code.
let listItemOf = (record: record, ~appLang) => {
  let parts = []
  if record.lang != appLang {
    Array.push(parts, String.toUpperCase(record.lang))
  }
  if record.description != "" {
    Array.push(parts, escapeHtml(record.description))
  }
  {
    title: record.displayTitle,
    description: Array.join(parts, " · "),
    imageUrl: ?(record.imageUrl == "" ? None : Some(record.imageUrl)),
  }
}
