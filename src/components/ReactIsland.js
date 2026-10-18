import { h } from 'preact'
import { useEffect, useRef } from 'preact/hooks'
import { createElement } from 'react'
import { createRoot } from 'react-dom/client'

// Bridges the two runtimes during the incremental Preact -> React migration.
// It mounts a real React subtree into its own DOM container, rendered from
// within the existing Preact tree. Remove once Preact has been fully replaced.
export const ReactIsland = ({ component, props }) => {
  const containerRef = useRef(null)
  const rootRef = useRef(null)

  useEffect(() => {
    const root = createRoot(containerRef.current)
    rootRef.current = root
    return () => {
      rootRef.current = null
      root.unmount()
    }
  }, [])

  useEffect(() => {
    if (rootRef.current) {
      rootRef.current.render(createElement(component, props || null))
    }
  })

  return <div ref={containerRef} />
}
