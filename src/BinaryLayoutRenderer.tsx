import { FC, ReactNode, useContext } from 'react'
import { TangramContext } from './TangramContext'
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
  return (
    <div className='horizontal flex flex-row flex-nowrap w-full h-full'>
      <div className='min-w-0' style={ { flex: `${proportion[0]} ${proportion[0]} auto` } }>{ children[0] }</div>
      <div className='tg-handle cursor-col-resize basis-1.5 bg-slate-500'></div>
      <div className='min-w-0' style={ { flex: `${proportion[1]} ${proportion[1]} auto` } }>{ children[1] }</div>
    </div>
  )
}

interface VerticalLayoutRendererProps {
  proportion: LayoutNode['proportion']
  children: [ReactNode, ReactNode]
}

const VerticalLayoutRenderer: FC<VerticalLayoutRendererProps> = ({ proportion, children }) => {
  return (
    <div className='vertical flex flex-col flex-nowrap w-full h-full'>
      <div className='min-h-0' style={ { flex: `${proportion[0]} ${proportion[0]} auto` } }>{ children[0] }</div>
      <div className='tg-handle cursor-row-resize basis-1.5 bg-slate-500'></div>
      <div className='min-h-0' style={ { flex: `${proportion[1]} ${proportion[1]} auto` } }>{ children[1] }</div>
    </div>
  )
}

interface FullLayoutRendererProps {
  children: ReactNode
}

export const FullLayoutRenderer: FC<FullLayoutRendererProps> = ({ children }) => {
  return (
    <div className='single-full cursor-grab w-full h-full'>{ children }</div>
  )
}