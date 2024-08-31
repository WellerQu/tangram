import { FC, useCallback, useContext } from 'react'

import { Direction, LayoutNode, Node, NodeType } from './node'
import { TangramContext, TangramMode } from './TangramContext'
import { DisabledPointerEvents } from './DisabledPointerEvents'
import { HorizontalLayoutRenderer } from './HorizontalLayoutRenderer'
import { VerticalLayoutRenderer } from './VerticalLayoutRenderer'
import { FullLayoutRenderer } from './FullLayoutRenderer'

export interface BinaryLayoutRendererProps {
  root: Node | undefined
  onRootChange?: (root: Node | undefined) => void
}

export const BinaryLayoutRenderer: FC<BinaryLayoutRendererProps> = ({
  root,
  onRootChange,
}) => {
  const { entry, mode, minColumnWidthPercentage = 0.1, minRowHeightPercentage = 0.1 } = useContext(TangramContext)

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
        minRowHeightPercentage={ minRowHeightPercentage }
        onProportionChange={ handleProportionChange }
      >
        <BinaryLayoutRenderer root={ root.children?.[0] } />
        <BinaryLayoutRenderer root={ root.children?.[1] } />
      </VerticalLayoutRenderer>
    )
  }

  return null
}