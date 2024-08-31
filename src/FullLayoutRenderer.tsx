import { ReactNode, FC, useContext } from 'react'
import classnames from 'classnames'

import { TangramContext, TangramMode } from './TangramContext'


export interface FullLayoutRendererProps {
  children: ReactNode
}

export const FullLayoutRenderer: FC<FullLayoutRendererProps> = ({ children }) => {
  const { mode } = useContext(TangramContext)

  return (
    <div className={ classnames('single-full w-full h-full overflow-auto', {
      'cursor-move': mode === TangramMode.editable,
    }) }
    >{ children }</div>
  )
}