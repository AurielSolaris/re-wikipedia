import {
  isSupported, save, get, isSaved, list, remove, subscribe
} from '../res/SavedArticles.res.mjs'

// Articles saved for offline reading. The store (IndexedDB for the text, Cache
// Storage for the images) lives in ReScript: src/res/SavedArticles.res.
export const savedArticles = {
  isSupported,
  save,
  get,
  isSaved,
  list,
  remove,
  subscribe
}
