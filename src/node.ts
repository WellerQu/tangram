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
  registry: string
}

export interface LayoutNode {
  type: NodeType.layout
  direction: Direction
  children: [Node] | [Node, Node] | undefined
  proportion: [number, number]
}