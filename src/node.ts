export enum Direction {
  horizontal = 'horizontal',
  vertical = 'vertical'
}

export enum NodeType {
  content = 'content',
  layout = 'layout'
}

export type Node = ContentNode | LayoutNode

export interface ContentNode {
  type: NodeType.content
  entry: string
}

export interface LayoutNode {
  type: NodeType.layout
  direction: Direction
  children: [Node | null, Node | null] | undefined
  proportion: [number, number]
}

export function shrink(node: Node | null) {
  if (!node) {
    return null
  }
  if (node.type === NodeType.content) {
    return node
  }

  if (!node.children) {
    node.children = [ null, null ]
  }

  if (node.children?.[0]) {
    node.children[0] = shrink(node.children[0])
  }
  if (node.children?.[1]) {
    node.children[1] = shrink(node.children[1])
  }

  const [ child_0, child_1 ] = node.children ?? []

  if (child_0 && !child_1) {
    return child_0
  }
  if (!child_0 && child_1) {
    return child_1
  }

  return node
}