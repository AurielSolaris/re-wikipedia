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
