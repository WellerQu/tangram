import { FC, useMemo, useRef, useState } from 'react'
import { TangramContext, TangramEntry, TangramInstance, TangramMode } from './TangramContext'

export interface TangramProviderProps {
  minColumnWidthPercentage: TangramInstance['minColumnWidthPercentage']
  entry: TangramEntry
  children?: React.ReactNode
}

export const TangramProvider: FC<TangramProviderProps> = ({
  entry,
  minColumnWidthPercentage,
  children,
}) => {
  const [ mode, setMode ] = useState(TangramMode.readonly)
  const entryCache = useRef(entry).current

  const instance = useMemo<TangramInstance>(() => ({
    mode,
    minColumnWidthPercentage,
    entry: entryCache,
    edit:  () => setMode(TangramMode.editable),
    read:  () => setMode(TangramMode.readonly),
  }), [ entryCache, minColumnWidthPercentage, mode ])

  return (
    <TangramContext.Provider value={ instance }>
      { children }
    </TangramContext.Provider>
  )
}