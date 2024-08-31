import { FC, useMemo, useRef, useState } from 'react'
import { TangramContext, TangramEntry, TangramInstance, TangramMode } from './TangramContext'

export interface TangramProviderProps {
  entry: TangramEntry
  children?: React.ReactNode
}

export const TangramProvider: FC<TangramProviderProps> = ({ entry,  children }) => {
  const [ mode, setMode ] = useState(TangramMode.readonly)
  const entryCache = useRef(entry).current

  const instance = useMemo<TangramInstance>(() => ({
    mode,
    entry: entryCache,
    edit:  () => setMode(TangramMode.editable),
    read:  () => setMode(TangramMode.readonly),
  }), [ entryCache, mode ])

  return (
    <TangramContext.Provider value={ instance }>
      { children }
    </TangramContext.Provider>
  )
}