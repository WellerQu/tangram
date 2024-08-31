import { FC, useMemo, useRef, useState } from 'react'
import { TangramContext, TangramEntry, TangramInstance, TangramMode } from './TangramContext'

export interface TangramProviderProps {
  minColumnWidthPercentage?: TangramInstance['minColumnWidthPercentage']
  minRowHeightPercentage?: TangramInstance['minRowHeightPercentage']
  entry: TangramEntry
  children?: React.ReactNode
}

export const TangramProvider: FC<TangramProviderProps> = ({
  entry,
  minColumnWidthPercentage = 0.1,
  minRowHeightPercentage = 0.1,
  children,
}) => {
  const [ mode, setMode ] = useState(TangramMode.readonly)
  const entryCache = useRef(entry).current

  const instance = useMemo<TangramInstance>(() => ({
    mode,
    minColumnWidthPercentage,
    minRowHeightPercentage,
    entry: entryCache,
    edit:  () => setMode(TangramMode.editable),
    read:  () => setMode(TangramMode.readonly),
  }), [ entryCache, minColumnWidthPercentage, minRowHeightPercentage, mode ])

  return (
    <TangramContext.Provider value={ instance }>
      { children }
    </TangramContext.Provider>
  )
}