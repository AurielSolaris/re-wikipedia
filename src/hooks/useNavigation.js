import { useState, useEffect } from 'preact/hooks'
import { useSoftkey } from 'hooks'
import { useTouchSupport } from './useTouchSupport'

export const useNavigation = (origin, containerRef, listRef, axis, elementsSelector = '[data-selectable]') => {
  const [current, setCurrent] = useState({ type: null, index: 0, key: null })
  const [touchSupport] = useTouchSupport()

  const getAllElements = () => containerRef.current.querySelectorAll(elementsSelector)

  const getSelectedElement = () => containerRef.current.querySelector('[nav-selected=true]')

  const getTheIndexOfTheSelectedElement = () => {
    const element = getSelectedElement()
    return element ? parseInt(element.getAttribute('nav-index')) : 0
  }

  const setNavigation = index => selectElement(getAllElements()[index] || document.body)

  const navigatePrevious = () => {
    const allElements = getAllElements()
    const currentIndex = getTheIndexOfTheSelectedElement()

    const setIndex = (currentIndex === 0) ? allElements.length - 1 : currentIndex - 1
    return selectElement(allElements[setIndex] || allElements[0], setIndex)
  }

  const navigateNext = () => {
    const allElements = getAllElements()
    const currentIndex = getTheIndexOfTheSelectedElement()

    const setIndex = (currentIndex + 1 > allElements.length - 1) ? 0 : currentIndex + 1
    return selectElement(allElements[setIndex] || allElements[0], setIndex)
  }

  const selectElement = (selectElement, setIndex = 0) => {
    if (selectElement) {
      [].forEach.call(getAllElements(), (element, index) => {
        const selectThisElement = element === selectElement
        element.setAttribute('nav-selected', selectThisElement)
        element.setAttribute('nav-index', index)
        if (element.nodeName === 'INPUT' || element.nodeName === 'TEXTAREA') {
          if (selectThisElement) {
            element.focus()
            element.selectionStart = element.selectionEnd = element.value.length
          } else {
            element.blur()
          }
        }
      })
      setCurrent({ type: selectElement.tagName, index: setIndex, key: selectElement.getAttribute('data-selected-key') })
    } else {
      setNavigation(0)
    }
  }

  const getCurrent = () => {
    const element = getSelectedElement()
    return {
      type: element.tagName,
      index: parseInt(element.getAttribute('nav-index'), 10),
      key: element.getAttribute('data-selected-key')
    }
  }

  const previousKey = axis === 'x' ? 'onKeyArrowLeft' : 'onKeyArrowUp'
  const nextKey = axis === 'x' ? 'onKeyArrowRight' : 'onKeyArrowDown'
  useSoftkey(origin, {
    [previousKey]: navigatePrevious,
    [nextKey]: navigateNext
  })

  useEffect(() => {
    if (!listRef.current) return
    const element = getSelectedElement()
    if (!element) return
    if (element.tagName === 'INPUT') return

    // todo: cache the next line since it doesn't change
    const containerRect = listRef.current.getBoundingClientRect()
    const rect = element.getBoundingClientRect()
    if (rect.bottom > containerRect.bottom) {
      // scroll down
      listRef.current.scrollTop += (rect.bottom - containerRect.bottom)
    }
    if (rect.top < containerRect.top) {
      // scroll up
      listRef.current.scrollTop -= (containerRect.top - rect.top)
    }
  })

  // Touch / click support: tapping a selectable element selects it and then
  // triggers the very same action as the center key. We do that by dispatching
  // a synthetic Enter keydown, which the <Softkey> bar already routes to the
  // current view's onKeyCenter handler.
  useEffect(() => {
    if (!touchSupport || !containerRef.current) {
      return
    }
    const node = containerRef.current
    const onClick = event => {
      const target = event.target
      if (!target || typeof target.closest !== 'function') return
      if (target.nodeName === 'INPUT' || target.nodeName === 'TEXTAREA' || target.isContentEditable) return

      const element = target.closest(elementsSelector)
      if (!element || !node.contains(element)) return

      const allElements = getAllElements()
      const index = Array.prototype.indexOf.call(allElements, element)
      if (index < 0) return

      event.preventDefault()
      selectElement(element, index)

      if (typeof KeyboardEvent !== 'undefined') {
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
      }
    }
    node.addEventListener('click', onClick)
    return () => node.removeEventListener('click', onClick)
  }, [touchSupport, elementsSelector])

  return [current, setNavigation, getCurrent, getAllElements, navigateNext, navigatePrevious]
}
