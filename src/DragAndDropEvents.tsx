import { FC, useContext, useRef, useEffect } from 'react'
import { fromEvent, merge } from 'rxjs'

import { TangramContext, TangramMode } from './TangramContext'

const DATA_TRANSFER_FORMAT = 'text/entry'
const POSITION_PERCENTAGE = 0.20
const POSITION_FILL_COLOR = 'rgba(196, 181, 253, 0.4)'

export enum DropPosition {
  top = 'top',
  right = 'right',
  bottom = 'bottom',
  left = 'left',
}

function detectDropPosition(percentage: number, width: number, height: number, offsetX: number, offsetY: number): DropPosition | null {
  if (offsetX < width * percentage) {
    return DropPosition.left
  } else if (offsetX > width * (1 - percentage)) {
    return DropPosition.right
  } else if (offsetY < height * percentage) {
    return DropPosition.top
  } else if (offsetY > height * (1 - percentage)) {
    return DropPosition.bottom
  }

  return null
}

export interface DragAndDropEventsProps {
  bindEntry: string
  active: boolean
  children?: React.ReactNode

  onDropped?: (entry: string, position: DropPosition) => void
  onPickedOut?: () => void
}

export const DragAndDropEvents: FC<DragAndDropEventsProps> = ({
  bindEntry,
  active,
  children,
  onDropped,
  onPickedOut,
}) => {
  const { mode } = useContext(TangramContext)

  const dndRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  //#endregion 更新 Canvas 的宽高
  useEffect(() => {
    const dnd = dndRef.current
    if (!dnd) {
      return
    }

    const resizeObserver = new ResizeObserver(() => {
      const canvas = canvasRef.current
      if (canvas) {
        canvas.width = canvas.clientWidth
        canvas.height = canvas.clientHeight
      }
    })

    resizeObserver.observe(dnd)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])
  //#endregion

  //#region 处理拖拽/投放数据
  useEffect(() => {
    if (!active) {
      return
    }

    const dnd = dndRef.current
    if (!dnd) {
      return
    }

    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return
    }

    // 正在拖拽的元素
    const grabbedElement: {
      current: HTMLElement | null
    } = {
      current: null,
    }

    // Source
    const dragstart$ = fromEvent<DragEvent>(dnd, 'dragstart')
    const dragend$ = fromEvent<DragEvent>(dnd, 'dragend')

    // Target
    // const dragenter$ = fromEvent<DragEvent>(dnd, 'dragenter')
    const dragover$ = fromEvent<DragEvent>(dnd, 'dragover')
    const dragleave$ = fromEvent<DragEvent>(dnd, 'dragleave')
    const drop$ = fromEvent<DragEvent>(dnd, 'drop')

    const start$ = dragstart$
      .subscribe((event) => {
        const element = event.target as HTMLElement | null
        if (!element) {
          return
        }
        if (!event.dataTransfer) {
          return
        }

        element.classList.add('grayscale')

        event.dataTransfer.dropEffect = 'move'
        event.dataTransfer.effectAllowed = 'move'
        event.dataTransfer.setData(DATA_TRANSFER_FORMAT, bindEntry)

        grabbedElement.current = element
      })

    const end$ = dragend$
      .subscribe((event) => {
        if (!event.dataTransfer) {
          return
        }

        const element = event.target as HTMLElement | null
        if (!element) {
          return
        }

        event.dataTransfer.clearData(DATA_TRANSFER_FORMAT)

        element.classList.remove('grayscale')

        const width = canvas.width
        const height = canvas.height

        ctx.clearRect(0, 0, width, height)

        grabbedElement.current = null

        if (event.dataTransfer.dropEffect === 'move') {
          onPickedOut?.()
        }
      })

    const leave$ = merge(dragleave$, drop$)
      .subscribe(() => {
        const width = canvas.width
        const height = canvas.height

        ctx.clearRect(0, 0, width, height)
      })

    const over$ = dragover$
      .subscribe((event) => {
        if (grabbedElement.current) {
          // 不允许原地投放
          return
        }

        if (!event.dataTransfer) {
          return
        }

        if (!ctx) {
          return
        }

        event.preventDefault()

        const width = canvas.width
        const height = canvas.height

        const offsetX = event.offsetX
        const offsetY = event.offsetY

        const position = detectDropPosition(POSITION_PERCENTAGE, width, height, offsetX, offsetY)

        ctx.save()

        ctx.clearRect(0, 0, width, height)
        ctx.fillStyle = POSITION_FILL_COLOR

        if (position === DropPosition.left) {
          ctx.fillRect(0, 0, width * POSITION_PERCENTAGE, height)
        } else if (position === DropPosition.right) {
          ctx.fillRect(width * (1 - POSITION_PERCENTAGE), 0, width * POSITION_PERCENTAGE, height)
        } else if (position === DropPosition.top) {
          ctx.fillRect(0, 0, width, height * POSITION_PERCENTAGE)
        } else if (position === DropPosition.bottom) {
          ctx.fillRect(0, height * (1 - POSITION_PERCENTAGE), width, height * POSITION_PERCENTAGE)
        }

        ctx.restore()
      })

    const dropped$ = drop$
      .subscribe((event) => {
        if (!event.dataTransfer) {
          return
        }
        event.preventDefault()
        const entry = event.dataTransfer.getData(DATA_TRANSFER_FORMAT) as string | null
        event.dataTransfer.clearData(DATA_TRANSFER_FORMAT)

        const width = canvas.width
        const height = canvas.height

        const offsetX = event.offsetX
        const offsetY = event.offsetY

        const position = detectDropPosition(POSITION_PERCENTAGE, width, height, offsetX, offsetY)

        if (!entry || !position) {
          return
        }

        onDropped?.(entry, position)
      })

    return () => {
      start$.unsubscribe()
      end$.unsubscribe()
      over$.unsubscribe()
      leave$.unsubscribe()
      dropped$.unsubscribe()
    }
  }, [ active, bindEntry, onDropped, onPickedOut ])
  //#endregion

  return (
    <div ref={ dndRef }
      className='drag-and-drop-events size-full relative'
      draggable={ mode === TangramMode.editable }
    >
      { children }

      { active &&
      <canvas ref={ canvasRef } className='size-full absolute top-0 left-0 pointer-events-none' />
      }
    </div>
  )
}