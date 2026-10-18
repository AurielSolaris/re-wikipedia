import { h } from 'preact'
import { lazy, Suspense } from 'preact/compat'
import { Router, route } from 'preact-router'
import { createHashHistory } from 'history'
import { Loading } from './Loading'
import { onboarding } from 'utils'

// Loads a named export as a lazily evaluated route component. Each route is
// emitted as its own chunk so the initial payload only contains the app shell.
const lazyComponent = (loader, name) =>
  lazy(() => loader().then(module => ({ default: module[name] })))

const Onboarding = lazyComponent(() => import('./Onboarding'), 'Onboarding')
const Search = lazyComponent(() => import('./Search'), 'Search')
const Settings = lazyComponent(() => import('./Settings'), 'Settings')
const Tips = lazyComponent(() => import('./Tips'), 'Tips')
const Article = lazyComponent(() => import('./Article'), 'Article')
const Language = lazyComponent(() => import('./Language'), 'Language')

export const Routes = ({ onRouteChange }) => {
  const onChange = ({ url }) => {
    if (!onboarding.isDone()) {
      route('/onboarding')
    }
    onRouteChange(url)
  }
  return (
    <Suspense fallback={<Loading />}>
      <Router history={createHashHistory()} onChange={onChange}>
        <Onboarding path='/onboarding' />
        <Search path='/' />
        <Settings path='/settings' />
        <Tips path='/tips' />
        <Article path='/article/:lang/:title/:anchor?' />
        <Language path='/language' />
      </Router>
    </Suspense>
  )
}
