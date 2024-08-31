import type { Meta, StoryObj } from '@storybook/react'

import { BinaryLayoutRenderer } from './BinaryLayoutRenderer'
import { TangramProvider } from './TangramProvider'
import { Direction, NodeType } from './node'
import { FC, useContext } from 'react'
import { TangramContext, TangramEntry, TangramMode } from './TangramContext'

const C1: FC = () => <div className='bg-red-200 size-full'>Empty 1</div>
const C2: FC = () => <div className='bg-orange-200 size-full'>Empty 2</div>
const C3: FC = () => <div className='bg-blue-200 size-full'>Empty 3</div>
const C4: FC = () => <div className='bg-green-200 size-full'>Empty 4</div>

const Controllers: FC = () => {
  const { mode, edit, read } = useContext(TangramContext)
  return (
    <div className='absolute top-0 right-0 p-4'>
      { mode === TangramMode.editable && <button onClick={ read }>Disable</button> }
      { mode === TangramMode.readonly && <button onClick={ edit }>Edit</button> }
    </div>
  )
}

const entry: TangramEntry = {
  c1: C1,
  c2: C2,
  c3: C3,
  c4: C4,
}

const meta = {
  component: ({ root }) => (
    <TangramProvider entry={ entry }>
      <Controllers />
      <div className='w-screen h-screen p-0 m-0'>
        <BinaryLayoutRenderer root={ root } />
      </div>
    </TangramProvider>
  ),
} satisfies Meta<typeof BinaryLayoutRenderer>

export default meta

type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  args: {
    root: {
      type:       NodeType.layout,
      direction:  Direction.horizontal,
      proportion: [ 2, 1 ],
      children:   [
        { type: NodeType.content, registry: 'c1' },
        { type: NodeType.content, registry: 'c2' },
      ],
    },
  },
}

export const Vertical: Story = {
  args: {
    root: {
      type:       NodeType.layout,
      direction:  Direction.vertical,
      proportion: [ 1, 2 ],
      children:   [
        { type: NodeType.content, registry: 'c1' },
        { type: NodeType.content, registry: 'c2' },
      ],
    },
  },
}

export const Single: Story = {
  args: {
    root: {
      type:     NodeType.content,
      registry: 'c1',
    },
  },
}

export const Nested: Story = {
  args: {
    root: {
      type:       NodeType.layout,
      direction:  Direction.horizontal,
      proportion: [ 2, 1 ],
      children:   [
        {
          type:       NodeType.layout,
          direction:  Direction.vertical,
          proportion: [ 1, 2 ],
          children:   [
            { type: NodeType.content, registry: 'c1' },
            { type: NodeType.content, registry: 'c2' },
          ],
        },
        {
          type:       NodeType.layout,
          direction:  Direction.vertical,
          proportion: [ 1, 1 ],
          children:   [
            { type: NodeType.content, registry: 'c3' },
            { type: NodeType.content, registry: 'c4' },
          ],
        },
      ],
    },
  },
}