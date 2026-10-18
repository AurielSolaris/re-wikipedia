import { h } from 'preact'
import { memo } from 'preact/compat'
import { ReactIsland } from './ReactIsland'
import { make as ResLoading } from '../res/Loading.res.mjs'

// ReScript + React implementation lives in src/res/Loading.res; it is mounted
// here through the Preact <-> React island bridge during the incremental
// Preact -> React migration.
export const Loading = memo(({ message }) => (
  <ReactIsland component={ResLoading} props={{ message: message || '' }} />
))
