import { h } from 'preact'
import { memo } from 'preact/compat'
import { LinkIcon } from './icons'

/**
 * The containerRef is suggested to be used together with the hooks useNavigation
 * without the containerRef, the view won't scroll to the selected row
 *
 * Items may carry an optional `icon` (a component) and an optional boolean
 * `switch` to render a toggle indicator (and expose switch semantics).
 */
export const ListView = memo(({ items = [], header, containerRef, empty }) => {
  return (
    <div class='listview'>
      { header && <div class='header'>{header}</div> }
      <div class='list' ref={containerRef}>
        {
          items.length
            ? items.map(item => {
              const isSwitch = typeof item.switch === 'boolean'
              return (
                <div
                  class='item'
                  dir={item.dir}
                  data-selectable
                  data-title={item.title}
                  data-selected-key={item.title}
                  key={item.title}
                  role={isSwitch ? 'switch' : undefined}
                  aria-checked={isSwitch ? (item.switch ? 'true' : 'false') : undefined}
                  tabIndex={isSwitch ? 0 : undefined}
              >
                  { item.icon && <div class='icon'><item.icon /></div> }
                  <div class='info'>
                    <bdi class='title' dangerouslySetInnerHTML={{ __html: item.displayTitle || item.title }} />
                    { item.description && <bdi class={`description${item.imageUrl ? ' withImg' : ''}`} dangerouslySetInnerHTML={{ __html: item.description }} /> }
                  </div>
                  { item.imageUrl && <div class='img' style={{ backgroundImage: `url(${item.imageUrl})` }} /> }
                  { isSwitch && <div class='switch-container'><div class={`switch${item.switch ? ' on' : ''}`} /></div> }
                  { item.link && <div class='link'><LinkIcon /></div> }
                </div>
              )
            })
            : <div class='empty'>{empty}</div>
        }
      </div>
    </div>
  )
})
