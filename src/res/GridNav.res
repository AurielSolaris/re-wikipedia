// Grid navigation maths for useNavigation.
//
// On desktop the list screens lay their rows out as a card grid
// (responsive.scss), so "next" has to mean "the card below", not "the card
// after". These helpers are pure: the hook reads `grid-template-columns` from
// the DOM and hands the string over.

// The browser reports one token per rendered column ("360px 360px 360px") and
// "none" when the element is not a grid at all - which is the mobile single
// column case, so 1 is the right answer there too.
let columns = (gridTemplateColumns: string): int => {
  let template = String.trim(gridTemplateColumns)
  if template === "" || template === "none" {
    1
  } else {
    let count = ref(0)
    Array.forEach(String.split(template, " "), token =>
      if token !== "" {
        count := count.contents + 1
      }
    )
    count.contents > 0 ? count.contents : 1
  }
}

// How far the selection moves for an axis: a single card for a row (or for a
// horizontal list), a whole row for a grid.
let step = (~axis: string, ~columns: int): int =>
  switch axis {
  | "x" => 1
  | "grid" => columns
  | _ => 1
  }

// Keeps the index inside the list, wrapping around at either end.
let wrap = (~index: int, ~delta: int, ~length: int): int =>
  if length <= 0 {
    0
  } else {
    let next = (index + delta) % length
    next < 0 ? next + length : next
  }

// Moves the selection through a list whose first `offset` elements sit above
// the card grid, one per row (the search input on the home screen). Without
// that, a press on the input would jump a whole row of cards, or land back on
// the input. Leaving the grid upwards returns to the last of those elements,
// and going past the last card wraps to the top, like `wrap` does.
let move = (~index: int, ~delta: int, ~length: int, ~offset: int): int =>
  if length <= 0 {
    0
  } else if offset <= 0 || offset >= length {
    wrap(~index, ~delta, ~length)
  } else if index < offset {
    wrap(~index, ~delta=delta > 0 ? 1 : -1, ~length)
  } else {
    let next = index + delta
    if next < offset {
      offset - 1
    } else if next >= length {
      0
    } else {
      next
    }
  }
