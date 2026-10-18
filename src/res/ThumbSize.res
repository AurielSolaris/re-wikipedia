// Standard Wikimedia thumbnail widths ($wgThumbnailSteps).
//
// The CDN rejects any other width with HTTP 400 ("Use thumbnail sizes listed on
// https://w.wiki/GHai"), so every thumbnail URL the app builds has to round up
// to one of these steps - exactly like the imageinfo API does.
// https://www.mediawiki.org/wiki/Common_thumbnail_sizes

let steps = [20, 40, 60, 120, 250, 330, 500, 960, 1280, 1920, 3840]

// Largest step, without indexing into the array.
let largest = {
  let result = ref(0)
  Array.forEach(steps, step => result := step)
  result.contents
}

// Rounds a width up to the smallest standard step (clamping to the largest).
let snap = (width: int): int => {
  let result = ref(-1)
  Array.forEach(steps, step =>
    if result.contents < 0 && step >= width {
      result := step
    }
  )
  result.contents < 0 ? largest : result.contents
}
