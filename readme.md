# @nrxlor/tangram

A flexible React library for creating resizable, drag-and-drop layout systems. Build IDE-like interfaces with splittable panels and sophisticated interaction capabilities.

![example](https://github.com/WellerQu/tangram/blob/master/examples/example.gif)

## Features

- 🔧 **Flexible Layout System**: Binary tree-based layout structure supporting infinite nesting
- 🎯 **Drag & Drop**: Intuitive drag-and-drop interface for layout manipulation  
- 📏 **Resizable Panels**: Smooth resize with configurable minimum size constraints
- 🎨 **Modern React**: Built with TypeScript, hooks, and contemporary patterns
- ⚡ **RxJS Integration**: Sophisticated interaction handling with reactive programming
- 🎭 **Mode Switching**: Toggle between editable and readonly modes
- 💾 **Serializable**: Layout state can be easily persisted and restored

## Quick Start

### Installation

```bash
npm install @nrxlor/tangram
# or
pnpm add @nrxlor/tangram
```

### Basic Usage

```tsx
import React, { useState } from 'react'
import { 
  TangramProvider, 
  BinaryLayoutRenderer, 
  Node, 
  NodeType 
} from '@nrxlor/tangram'
import '@nrxlor/tangram/dist/tangram.css'

// Define your components
const Component1 = () => <div className="bg-red-200 h-full p-4">Panel 1</div>
const Component2 = () => <div className="bg-blue-200 h-full p-4">Panel 2</div>

// Component registry
const entry = {
  'panel1': Component1,
  'panel2': Component2,
}

export const App = () => {
  const [layoutTree, setLayoutTree] = useState<Node | null>({
    type: NodeType.content,
    entry: 'panel1'
  })

  return (
    <TangramProvider entry={entry}>
      <div className="w-full h-screen">
        <BinaryLayoutRenderer 
          isRoot={true}
          current={layoutTree}
          onRootChange={setLayoutTree}
        />
      </div>
    </TangramProvider>
  )
}
```

## Documentation

- 📖 [Code Analysis (中文)](./CODE_ANALYSIS.md) - Detailed technical analysis in Chinese
- 📖 [Code Analysis (English)](./CODE_ANALYSIS_EN.md) - Detailed technical analysis in English  
- 💡 [Usage Examples](./USAGE_EXAMPLES.md) - Comprehensive examples and patterns
- 🎨 [Storybook](https://nrxlor-tangram.netlify.app/) - Interactive component showcase

## Core Concepts

### Layout Tree Structure
Tangram uses a binary tree where each node can be:
- **ContentNode**: Displays a registered component (leaf node)
- **LayoutNode**: Splits space horizontally or vertically (branch node)

### Component Registry  
Register your React components in an entry object:
```tsx
const entry = {
  'sidebar': SidebarComponent,
  'editor': CodeEditor, 
  'console': ConsoleComponent,
}
```

### Mode Management
- **Editable Mode**: Users can drag, drop, and resize panels
- **Readonly Mode**: Static layout, no user interaction

## API Reference

### TangramProvider Props
```tsx
interface TangramProviderProps {
  entry: TangramEntry                    // Component registry
  minColumnWidthPercentage?: number      // Default: 0.1 (10%)
  minRowHeightPercentage?: number        // Default: 0.1 (10%)
  children?: React.ReactNode
}
```

### BinaryLayoutRenderer Props  
```tsx
interface BinaryLayoutRendererProps {
  isRoot: boolean                        // Whether this is the root renderer
  current: Node | null | undefined       // Current layout tree node
  onRootChange?: (root: Node | null) => void  // Layout change callback
}
```

### Node Types
```tsx
interface ContentNode {
  type: NodeType.content
  entry: string                          // Key in component registry
}

interface LayoutNode {
  type: NodeType.layout
  direction: Direction                   // 'horizontal' | 'vertical'
  children: [Node | null, Node | null]   // Exactly two children
  proportion: [number, number]           // Size ratio between children
}
```

## Advanced Usage

### Persistent Layouts
```tsx
const [layoutTree, setLayoutTree] = useState(() => {
  const saved = localStorage.getItem('layout')
  return saved ? JSON.parse(saved) : defaultLayout
})

useEffect(() => {
  localStorage.setItem('layout', JSON.stringify(layoutTree))
}, [layoutTree])
```

### Mode Control
```tsx
const ControlPanel = () => {
  const { mode, edit, read } = useContext(TangramContext)
  
  return (
    <div>
      <button onClick={edit}>Edit Mode</button>
      <button onClick={read}>Read Only</button>
    </div>
  )
}
```

## Development

```bash
# Install dependencies
pnpm install

# Start Storybook development
pnpm run storybook

# Build library
pnpm run build

# Run linting
npx eslint src/ --ext .ts,.tsx
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

ISC

## Built With

- **React** - UI library
- **TypeScript** - Type safety  
- **RxJS** - Reactive programming
- **TailwindCSS** - Styling
- **Rollup** - Module bundler
- **Storybook** - Component development