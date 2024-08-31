import { FC, useCallback, useContext } from 'react'

import { Direction, LayoutNode, Node, NodeType, shrink } from './node'
import { TangramContext, TangramMode } from './TangramContext'
import { DisabledPointerEvents } from './DisabledPointerEvents'
import { HorizontalLayoutRenderer } from './HorizontalLayoutRenderer'
import { VerticalLayoutRenderer } from './VerticalLayoutRenderer'
import { FullLayoutRenderer } from './FullLayoutRenderer'
import { DragAndDropEvents, DropPosition } from './DragAndDropEvents'

export interface BinaryLayoutRendererProps {
  isRoot: boolean
  current: Node | null | undefined
  onRootChange?: (root: Node | null) => void
}

export const BinaryLayoutRenderer: FC<BinaryLayoutRendererProps> = ({
  isRoot = false,
  current,
  onRootChange,
}) => {
  const { entry, mode, minColumnWidthPercentage, minRowHeightPercentage } = useContext(TangramContext)

  const handleProportionChange = useCallback((proportion: LayoutNode['proportion']) => {
    if (current?.type === NodeType.layout) {
      onRootChange?.({
        ...current,
        proportion,
      })
    }
  }, [ onRootChange, current ])

  const handleDropped = useCallback((entry: string, position: DropPosition) => {
    if (current?.type === NodeType.content) {
      const newNode: Node = {
        type:       NodeType.layout,
        proportion: [ 1, 1 ],
        direction:  position === DropPosition.left || position === DropPosition.right
          ? Direction.horizontal
          : Direction.vertical,
        children: position === DropPosition.left || position === DropPosition.top
          ? [ { type: NodeType.content, entry }, current ]
          : [ current, { type: NodeType.content, entry } ],
      }

      onRootChange?.(isRoot ? shrink(newNode) : newNode)
    }
  }, [ current, isRoot, onRootChange ])

  const handlePickedOut = useCallback(() => {
    if (current?.type === NodeType.content) {
      onRootChange?.(null)
    }
  }, [ current, onRootChange ])

  const handleChild0Change = useCallback((child0: Node | null) => {
    if (current?.type === NodeType.layout) {
      const newNode: Node = {
        ...current,
        children: [ child0, current.children?.[1] ?? null ],
      }

      onRootChange?.(isRoot ? shrink(newNode) : newNode)
    }
  }, [ current, onRootChange, isRoot ])

  const handleChild1Change = useCallback((child1: Node | null) => {
    if (current?.type === NodeType.layout) {
      const newNode: Node = {
        ...current,
        children: [ current.children?.[0] ?? null, child1 ],
      }

      onRootChange?.(isRoot ? shrink(newNode) : newNode)
    }
  }, [ current, onRootChange, isRoot ])

  if (current && current.type === NodeType.content) {
    const Component = entry[current.entry]
    return Component && (
      <FullLayoutRenderer>
        <DragAndDropEvents active={ mode === TangramMode.editable }
          bindEntry={ current.entry }
          onDropped={ handleDropped }
          onPickedOut={ handlePickedOut }
        >
          <DisabledPointerEvents active={ mode === TangramMode.editable }>
            <Component />
          </DisabledPointerEvents>
        </DragAndDropEvents>
      </FullLayoutRenderer>
    )
  }

  if (current && current.direction === Direction.horizontal) {
    return (
      <HorizontalLayoutRenderer
        proportion={ current.proportion }
        minColumnWidthPercentage={ minColumnWidthPercentage }
        onProportionChange={ handleProportionChange }
      >
        <BinaryLayoutRenderer current={ current.children?.[0] }
          isRoot={ false }
          onRootChange={ handleChild0Change }
        />
        <BinaryLayoutRenderer current={ current.children?.[1] }
          isRoot={ false }
          onRootChange={ handleChild1Change }
        />
      </HorizontalLayoutRenderer>
    )
  }

  if (current && current.direction === Direction.vertical) {
    return (
      <VerticalLayoutRenderer
        proportion={ current.proportion }
        minRowHeightPercentage={ minRowHeightPercentage }
        onProportionChange={ handleProportionChange }
      >
        <BinaryLayoutRenderer current={ current.children?.[0] }
          isRoot={ false }
          onRootChange={ handleChild0Change }
        />
        <BinaryLayoutRenderer current={ current.children?.[1] }
          isRoot={ false }
          onRootChange={ handleChild1Change }
        />
      </VerticalLayoutRenderer>
    )
  }

  return null
}