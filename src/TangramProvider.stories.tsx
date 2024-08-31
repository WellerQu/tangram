import type { Meta, StoryObj } from '@storybook/react'

import { TangramProvider } from './TangramProvider'

const meta = {
  component: TangramProvider,
} satisfies Meta<typeof TangramProvider>

export default meta

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 123,
    entry:    {},
  },
}