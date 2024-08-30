import type { Meta, StoryObj } from '@storybook/react';

import { Node } from './Node';

const meta = {
  component: Node,
} satisfies Meta<typeof Node>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {}
};