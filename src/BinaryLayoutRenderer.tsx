import { FC, ReactNode, useCallback, useContext, useEffect, useLayoutEffect, useRef } from 'react'
import { fromEvent, map, merge, repeat, switchMap, take, takeUntil, tap, throwError } from 'rxjs'
import classnames from 'classnames'

import { TangramContext, TangramInstance, TangramMode } from './TangramContext'
import { Direction, LayoutNode, Node, NodeType } from './node'
import { DisabledPointerEvents } from './DisabledPointerEvents'

export interface BinaryLayoutRendererProps {
  root: Node | undefined
  onRootChange?: (root: Node | undefined) => void
}

export const BinaryLayoutRenderer: FC<BinaryLayoutRendererProps> = ({
  root,
  onRootChange,
}) => {
  const { entry, mode, minColumnWidthPercentage = 0.1 } = useContext(TangramContext)

  const handleProportionChange = useCallback((proportion: LayoutNode['proportion']) => {
    if (root?.type === NodeType.layout) {
      onRootChange?.({
        ...root,
        proportion,
      })
    }
  }, [ onRootChange, root ])

  if (root && root.type === NodeType.content) {
    const Component = entry[root.registry]
    return Component && (
      <FullLayoutRenderer>
        <DisabledPointerEvents active={ mode === TangramMode.editable }>
          <Component />
        </DisabledPointerEvents>
      </FullLayoutRenderer>
    )
  }

  if (root && root.direction === Direction.horizontal) {
    return (
      <HorizontalLayoutRenderer
        proportion={ root.proportion }
        minColumnWidthPercentage={ minColumnWidthPercentage }
        onProportionChange={ handleProportionChange }
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
  minColumnWidthPercentage: TangramInstance['minColumnWidthPercentage']
  children: [ReactNode, ReactNode]

  onProportionChange?: (proportion: LayoutNode['proportion']) => void
}

const HorizontalLayoutRenderer: FC<HorizontalLayoutRendererProps> = ({
  proportion,
  minColumnWidthPercentage,
  children,
  onProportionChange,
}) => {
  const { mode } = useContext(TangramContext)

  const containerRef = useRef<HTMLDivElement>(null)
  const handleRef = useRef<HTMLDivElement>(null)
  const child0Ref = useRef<HTMLDivElement>(null)
  const child1Ref = useRef<HTMLDivElement>(null)

  const proportionChangeRef = useRef(onProportionChange)
  useLayoutEffect(() => {
    proportionChangeRef.current = onProportionChange
  }, [ onProportionChange ])

  useEffect(() => {
    const container = containerRef.current
    if (!container) {
      return
    }

    const handle = handleRef.current
    if (!handle) {
      return
    }

    const child0 = child0Ref.current
    const child1 = child1Ref.current
    if (!child0 || !child1) {
      return
    }


    const mousedown$ = fromEvent<MouseEvent>(handle, 'mousedown')
      .pipe(
        tap(() => container.classList.add('cursor-col-resize')),
      )
    const mousemove$ = fromEvent<MouseEvent>(container, 'mousemove')
    const mouseup$ = fromEvent<MouseEvent>(container, 'mouseup')
    const mouseleave$ = fromEvent<MouseEvent>(container, 'mouseleave')
    const mousefinish$ = merge(mouseup$, mouseleave$)
      .pipe(
        tap(() => container.classList.remove('cursor-col-resize')),
      )

    const resize$ = mousedown$
      .pipe(
        switchMap(mousedownEvent => {
          const proportion0 = child0.dataset['proportion']
          const proportion1 = child1.dataset['proportion']
          if (!proportion0 || !proportion1) {
            return throwError(() => new Error('proportion not found'))
          }

          const child0Proportion = +proportion0
          const child1Proportion = +proportion1
          if (isNaN(child0Proportion) || isNaN(child1Proportion)) {
            return throwError(() => new Error('proportion is not a number'))
          }

          const totalWidth = container.offsetWidth - handle.offsetWidth
          const child0Width = totalWidth * (child0Proportion / (child0Proportion + child1Proportion))
          const child1Width = totalWidth * (child1Proportion / (child0Proportion + child1Proportion))

          const minWidth = totalWidth * minColumnWidthPercentage

          return mousemove$
            .pipe(
              map(mousemoveEvent => {
                const offsetX = mousemoveEvent.clientX - mousedownEvent.clientX

                const nextChild0Width = child0Width + offsetX * 1
                const nextChild1Width = child1Width + offsetX * -1
                if (nextChild0Width <= minWidth) {
                  const limitChild0Width = minWidth
                  const limitChild1Width = totalWidth - minWidth
                  const nextChild0Proportion = limitChild0Width / minWidth
                  const nextChild1Proportion = limitChild1Width / minWidth
                  return [ nextChild0Proportion, nextChild1Proportion ] as const
                }
                if (nextChild1Width <= minWidth) {
                  const limitChild0Width = totalWidth - minWidth
                  const limitChild1Width = minWidth
                  const nextChild0Proportion = limitChild0Width / minWidth
                  const nextChild1Proportion = limitChild1Width / minWidth
                  return [ nextChild0Proportion, nextChild1Proportion ] as const
                }

                const min = Math.min(nextChild0Width, nextChild1Width)
                const nextChild0Proportion = nextChild0Width / min
                const nextChild1Proportion = nextChild1Width / min

                return [ nextChild0Proportion, nextChild1Proportion ] as const
              }),
              takeUntil(mousefinish$),
            )
        }),
      )
      .subscribe(([ nextChild0Proportion, nextChild1Proportion ]) => {
        child0.dataset['proportion'] = nextChild0Proportion.toString()
        child0.style.flex = `${nextChild0Proportion}`
        child1.dataset['proportion'] = nextChild1Proportion.toString()
        child1.style.flex = `${nextChild1Proportion}`
      })

    const notify$ = mousedown$
      .pipe(
        switchMap(() => mousefinish$),
        take(1),
        repeat(),
      )
      .subscribe(() => {
        const proportion0 = child0.dataset['proportion']
        const proportion1 = child1.dataset['proportion']
        if (!proportion0 || !proportion1) {
          return
        }

        proportionChangeRef.current?.([
          +proportion0,
          +proportion1,
        ])
      })

    return () => {
      resize$.unsubscribe()
      notify$.unsubscribe()
    }
  }, [ minColumnWidthPercentage ])

  return (
    <div ref={ containerRef } className='horizontal flex flex-row flex-nowrap w-full h-full'>
      <div ref={ child0Ref }
        data-proportion={ proportion[0] }
        className='min-w-0'
        style={ { flex: `${ proportion[0] }` } }
      >
        { children[0] }
      </div>
      <div ref={ handleRef } className={ classnames('tg-handle bg-slate-200', {
        'hover:bg-blue-500': mode === TangramMode.editable,
        'cursor-col-resize': mode === TangramMode.editable,
        'basis-1':           mode === TangramMode.editable,
        'basis-px':          mode === TangramMode.readonly,
      }) }
      />
      <div ref={ child1Ref }
        data-proportion={ proportion[1] }
        className='min-w-0'
        style={ { flex: `${proportion[1]}` } }
      >
        { children[1] }
      </div>
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
      <div className='min-h-0' style={ { flex: `${proportion[0]}` } }>
        { children[0] }
      </div>
      <div className={ classnames('tg-handle bg-slate-200', {
        'hover:bg-blue-500': mode === TangramMode.editable,
        'cursor-row-resize': mode === TangramMode.editable,
        'basis-1':           mode === TangramMode.editable,
        'basis-px':          mode === TangramMode.readonly,
      }) }
      />
      <div className='min-h-0' style={ { flex: `${proportion[1]}` } }>
        { children[1] }
      </div>
    </div>
  )
}

interface FullLayoutRendererProps {
  children: ReactNode
}

export const FullLayoutRenderer: FC<FullLayoutRendererProps> = ({ children }) => {
  const { mode } = useContext(TangramContext)

  return (
    <div className={ classnames('single-full w-full h-full overflow-auto', {
      'cursor-grab ': mode === TangramMode.editable,
    }) }
    >{ children }</div>
  )
}