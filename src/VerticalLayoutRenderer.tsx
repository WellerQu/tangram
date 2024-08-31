import { ReactNode, FC, useContext, useRef, useLayoutEffect, useEffect } from 'react'
import { fromEvent, merge, switchMap, throwError, map, takeUntil, take, repeat } from 'rxjs'
import classnames from 'classnames'

import { LayoutNode } from './node'
import { TangramInstance, TangramContext, TangramMode } from './TangramContext'

export interface VerticalLayoutRendererProps {
  proportion: LayoutNode['proportion']
  minRowHeightPercentage: TangramInstance['minRowHeightPercentage']
  children: [ReactNode, ReactNode]

  onProportionChange?: (proportion: LayoutNode['proportion']) => void
}

export const VerticalLayoutRenderer: FC<VerticalLayoutRendererProps> = ({
  proportion,
  minRowHeightPercentage,
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
    const mousemove$ = fromEvent<MouseEvent>(container, 'mousemove')
    const mouseup$ = fromEvent<MouseEvent>(container, 'mouseup')
    const mouseleave$ = fromEvent<MouseEvent>(container, 'mouseleave')
    const mousefinish$ = merge(mouseup$, mouseleave$)

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

          const totalHeight = container.offsetHeight - handle.offsetHeight
          const child0Height = totalHeight * (child0Proportion / (child0Proportion + child1Proportion))
          const child1Height = totalHeight * (child1Proportion / (child0Proportion + child1Proportion))

          const minHeight = totalHeight * minRowHeightPercentage

          return mousemove$
            .pipe(
              map(mousemoveEvent => {
                const offsetY = mousemoveEvent.clientY - mousedownEvent.clientY

                const nextChild0Height = child0Height + offsetY * 1
                const nextChild1Height = child1Height + offsetY * -1
                if (nextChild0Height <= minHeight) {
                  const limitChild0Height = minHeight
                  const limitChild1Height = totalHeight - minHeight
                  const nextChild0Proportion = limitChild0Height / minHeight
                  const nextChild1Proportion = limitChild1Height / minHeight
                  return [ nextChild0Proportion, nextChild1Proportion ] as const
                }
                if (nextChild1Height <= minHeight) {
                  const limitChild0Height = totalHeight - minHeight
                  const limitChild1Height = minHeight
                  const nextChild0Proportion = limitChild0Height / minHeight
                  const nextChild1Proportion = limitChild1Height / minHeight
                  return [ nextChild0Proportion, nextChild1Proportion ] as const
                }

                const min = Math.min(nextChild0Height, nextChild1Height)
                const nextChild0Proportion = nextChild0Height / min
                const nextChild1Proportion = nextChild1Height / min

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
  }, [ minRowHeightPercentage ])

  return (
    <div ref={ containerRef } className='vertical flex flex-col flex-nowrap w-full h-full'>
      <div ref={ child0Ref }
        data-proportion={ proportion[0] }
        className='min-h-0'
        style={ { flex: `${proportion[0]}` } }
      >
        { children[0] }
      </div>
      <div ref={ handleRef } className={ classnames('tg-handle bg-slate-200', {
        'hover:bg-blue-500': mode === TangramMode.editable,
        'cursor-row-resize': mode === TangramMode.editable,
        'basis-1':           mode === TangramMode.editable,
        'basis-px':          mode === TangramMode.readonly,
      }) }
      />
      <div ref={ child1Ref }
        data-proportion={ proportion[1] }
        className='min-h-0'
        style={ { flex: `${proportion[1]}` } }
      >
        { children[1] }
      </div>
    </div>
  )
}
