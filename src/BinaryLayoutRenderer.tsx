import { FC, ReactNode, useContext } from 'react'
import classnames from 'classnames'

import { TangramContext, TangramMode } from './TangramContext'
import { Direction, LayoutNode, Node, NodeType } from './node'

export interface BinaryLayoutRendererProps {
  root: Node | undefined
}

export const BinaryLayoutRenderer: FC<BinaryLayoutRendererProps> = ({ root }) => {
  const { entry } = useContext(TangramContext)

  if (root && root.type === NodeType.content) {
    const Component = entry[root.registry]
    return Component && (
      <FullLayoutRenderer>
        <Component />
      </FullLayoutRenderer>
    )
  }

  if (root && root.direction === Direction.horizontal) {
    return (
      <HorizontalLayoutRenderer
        proportion={ root.proportion }
      >
        <BinaryLayoutRenderer root={ root.children?.[0] } />
        <BinaryLayoutRenderer root={ root.children?.[1] } />
      </HorizontalLayoutRenderer>
    )
  }

  if (root && root.direction === Direction.vertical) {
    return (
      <VerticalLayoutRenderer
        proportion={ root.proportion }
      >
        <BinaryLayoutRenderer root={ root.children?.[0] } />
        <BinaryLayoutRenderer root={ root.children?.[1] } />
      </VerticalLayoutRenderer>
    )
  }

  return null
}

interface HorizontalLayoutRendererProps {
  proportion: LayoutNode['proportion']
  children: [ReactNode, ReactNode]
}

const HorizontalLayoutRenderer: FC<HorizontalLayoutRendererProps> = ({ proportion, children }) => {
  const { mode } = useContext(TangramContext)

  return (
    <div className='horizontal flex flex-row flex-nowrap w-full h-full'>
      <div className='min-w-0' style={ { flex: `${proportion[0]} ${proportion[0]} auto` } }>{ children[0] }</div>
      <div className={ classnames('tg-handle basis-1.5 bg-slate-500', {
        'cursor-col-resize': mode === TangramMode.editable,
      }) }
      />
      <div className='min-w-0' style={ { flex: `${proportion[1]} ${proportion[1]} auto` } }>{ children[1] }</div>
    </div>
  )
}

interface VerticalLayoutRendererProps {
  proportion: LayoutNode['proportion']
  children: [ReactNode, ReactNode]
}

const VerticalLayoutRenderer: FC<VerticalLayoutRendererProps> = ({ proportion, children }) => {
  const { mode } = useContext(TangramContext)

  return (
    <div className='vertical flex flex-col flex-nowrap w-full h-full'>
      <div className='min-h-0' style={ { flex: `${proportion[0]} ${proportion[0]} auto` } }>{ children[0] }</div>
      <div className={ classnames('tg-handle basis-1.5 bg-slate-500', {
        'cursor-row-resize': mode === TangramMode.editable,
      }) }
      />
      <div className='min-h-0' style={ { flex: `${proportion[1]} ${proportion[1]} auto` } }>{ children[1] }</div>
    </div>
  )
}

interface FullLayoutRendererProps {
  children: ReactNode
}

export const FullLayoutRenderer: FC<FullLayoutRendererProps> = ({ children }) => {
  const { mode } = useContext(TangramContext)

  return (
    <div className={ classnames('single-full w-full h-full', {
      'cursor-grab ': mode === TangramMode.editable,
    }) }
    >{ children }</div>
  )
}