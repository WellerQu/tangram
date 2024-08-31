import { FC } from 'react'
import classnames from 'classnames'

export interface DisabledPointerEventsProps {
  active: boolean
  children: React.ReactNode
}

export const DisabledPointerEvents: FC<DisabledPointerEventsProps> = ({ active, children }) => {
  return (
    <div className={ classnames('disabled-pointer-events size-full', {
      'pointer-events-none': active,
      'select-none':         active,
    }) }
    >
      { children }
    </div>
  )
}