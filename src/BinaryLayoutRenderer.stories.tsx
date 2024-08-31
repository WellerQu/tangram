import type { Meta, StoryObj } from '@storybook/react'
import { FC, useContext, useState } from 'react'

import { Node, Direction, NodeType } from './node'
import { BinaryLayoutRenderer, BinaryLayoutRendererProps } from './BinaryLayoutRenderer'
import { TangramProvider } from './TangramProvider'
import { TangramContext, TangramEntry, TangramMode } from './TangramContext'

const C1: FC = () => <div className='bg-red-200 size-full'>Component 1</div>
const C2: FC = () => <div className='bg-orange-200 size-full'>Component 2</div>
const C3: FC = () => <div className='bg-yellow-200 size-full'>Component 3</div>
const C4: FC = () => <div className='bg-green-200 size-full'>Component 4</div>
const C5: FC = () => <div className='bg-cyan-200 size-full'>Component 5</div>
const C6: FC = () => <div className='bg-blue-200 size-full'>Component 6</div>
const C7: FC = () => <div className='bg-purple-200 size-full'>Component 7</div>

const Controllers: FC = () => {
  const { mode, edit, read } = useContext(TangramContext)
  return (
    <div className='absolute top-0 right-0 p-4 z-10'>
      { mode === TangramMode.editable && <button onClick={ read }>Disable</button> }
      { mode === TangramMode.readonly && <button onClick={ edit }>Edit</button> }
    </div>
  )
}

const Wrapped: FC<BinaryLayoutRendererProps> = ({ current, isRoot }) => {
  const [ root, setRoot ] = useState<Node | null | undefined>(current)

  return (
    <TangramProvider entry={ entry }>
      <Controllers />
      <div className='w-screen h-screen p-0 m-0'>
        <BinaryLayoutRenderer current={ root } isRoot={ isRoot } onRootChange={ setRoot } />
      </div>
    </TangramProvider>
  )
}

const entry: TangramEntry = {
  c1: C1,
  c2: C2,
  c3: C3,
  c4: C4,
  c5: C5,
  c6: C6,
  c7: C7,
}

const meta = {
  component: Wrapped,
} satisfies Meta<typeof BinaryLayoutRenderer>

export default meta

type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  args: {
    current: {
      type:       NodeType.layout,
      direction:  Direction.horizontal,
      proportion: [ 2, 1 ],
      children:   [
        { type: NodeType.content, entry: 'c1' },
        { type: NodeType.content, entry: 'c2' },
      ],
    },
    isRoot: true,
  },
}

export const Vertical: Story = {
  args: {
    current: {
      type:       NodeType.layout,
      direction:  Direction.vertical,
      proportion: [ 1, 2 ],
      children:   [
        { type: NodeType.content, entry: 'c1' },
        { type: NodeType.content, entry: 'c2' },
      ],
    },
    isRoot: true,
  },
}

export const Single: Story = {
  args: {
    current: {
      type:  NodeType.content,
      entry: 'c1',
    },
    isRoot: true,
  },
}

export const Nested: Story = {
  args: {
    current: {
      type:       NodeType.layout,
      direction:  Direction.horizontal,
      proportion: [ 2, 1 ],
      children:   [
        {
          type:       NodeType.layout,
          direction:  Direction.vertical,
          proportion: [ 1, 2 ],
          children:   [
            {
              type:       NodeType.layout,
              direction:  Direction.horizontal,
              proportion: [ 1, 1 ],
              children:   [
                { type: NodeType.content, entry: 'c7' },
                { type: NodeType.content, entry: 'c2' },
              ],
            },
            // { type: NodeType.content, entry: 'c3' },
            {
              type:       NodeType.layout,
              direction:  Direction.vertical,
              proportion: [ 1, 2 ],
              children:   [
                { type: NodeType.content, entry: 'c3' },
                { type: NodeType.content, entry: 'c1' },
              ],
            },
          ],
        },
        {
          type:       NodeType.layout,
          direction:  Direction.vertical,
          proportion: [ 1, 1 ],
          children:   [
            { type: NodeType.content, entry: 'c5' },
            {
              type:       NodeType.layout,
              direction:  Direction.horizontal,
              proportion: [ 1, 2 ],
              children:   [
                { type: NodeType.content, entry: 'c6' },
                { type: NodeType.content, entry: 'c4' },
              ],
            },
          ],
        },
      ],
    },
    isRoot: true,
  },
}