# Tangram Usage Examples / 使用示例

## Basic Setup / 基本设置

```tsx
import React, { useState } from 'react'
import { 
  TangramProvider, 
  BinaryLayoutRenderer, 
  Node, 
  NodeType, 
  Direction 
} from '@nrxlor/tangram'
import '@nrxlor/tangram/dist/tangram.css'

// Define your components / 定义组件
const Component1 = () => <div className="bg-red-200 h-full p-4">Component 1</div>
const Component2 = () => <div className="bg-blue-200 h-full p-4">Component 2</div>
const Component3 = () => <div className="bg-green-200 h-full p-4">Component 3</div>

// Component registry / 组件注册表
const entry = {
  'comp1': Component1,
  'comp2': Component2,
  'comp3': Component3,
}

export const BasicExample = () => {
  const [layoutTree, setLayoutTree] = useState<Node | null>({
    type: NodeType.content,
    entry: 'comp1'
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

## Predefined Layouts / 预定义布局

### Horizontal Split / 水平分割
```tsx
const horizontalLayout: Node = {
  type: NodeType.layout,
  direction: Direction.horizontal,
  proportion: [2, 1], // Left panel 2x wider than right
  children: [
    { type: NodeType.content, entry: 'comp1' },
    { type: NodeType.content, entry: 'comp2' },
  ],
}
```

### Vertical Split / 垂直分割
```tsx
const verticalLayout: Node = {
  type: NodeType.layout,
  direction: Direction.vertical,
  proportion: [1, 2], // Bottom panel 2x taller than top
  children: [
    { type: NodeType.content, entry: 'comp1' },
    { type: NodeType.content, entry: 'comp2' },
  ],
}
```

### Complex Nested Layout / 复杂嵌套布局
```tsx
const complexLayout: Node = {
  type: NodeType.layout,
  direction: Direction.horizontal,
  proportion: [3, 1],
  children: [
    // Left side - vertical split
    {
      type: NodeType.layout,
      direction: Direction.vertical,
      proportion: [1, 2],
      children: [
        { type: NodeType.content, entry: 'comp1' }, // Top
        { type: NodeType.content, entry: 'comp2' }, // Bottom
      ],
    },
    // Right side - single component
    { type: NodeType.content, entry: 'comp3' },
  ],
}
```

## Advanced Configuration / 高级配置

```tsx
export const AdvancedExample = () => {
  const [layoutTree, setLayoutTree] = useState<Node | null>(complexLayout)

  return (
    <TangramProvider 
      entry={entry}
      minColumnWidthPercentage={0.15}  // Minimum 15% width
      minRowHeightPercentage={0.1}     // Minimum 10% height
    >
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

## Mode Control / 模式控制

```tsx
import { useContext } from 'react'
import { TangramContext, TangramMode } from '@nrxlor/tangram'

const ControlPanel = () => {
  const { mode, edit, read } = useContext(TangramContext)
  
  return (
    <div className="absolute top-4 right-4 z-10 space-x-2">
      <button 
        onClick={edit}
        disabled={mode === TangramMode.editable}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
      >
        Edit Mode
      </button>
      <button 
        onClick={read}
        disabled={mode === TangramMode.readonly}
        className="px-4 py-2 bg-gray-500 text-white rounded disabled:opacity-50"
      >
        Read Only
      </button>
    </div>
  )
}

export const WithControlsExample = () => {
  const [layoutTree, setLayoutTree] = useState<Node | null>(horizontalLayout)

  return (
    <TangramProvider entry={entry}>
      <ControlPanel />
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

## Layout Persistence / 布局持久化

```tsx
import { useEffect } from 'react'

export const PersistentExample = () => {
  const [layoutTree, setLayoutTree] = useState<Node | null>(() => {
    // Load from localStorage on init
    const saved = localStorage.getItem('tangram-layout')
    return saved ? JSON.parse(saved) : { type: NodeType.content, entry: 'comp1' }
  })

  // Save layout changes
  useEffect(() => {
    if (layoutTree) {
      localStorage.setItem('tangram-layout', JSON.stringify(layoutTree))
    }
  }, [layoutTree])

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

## Dynamic Component Loading / 动态组件加载

```tsx
import { lazy, Suspense } from 'react'

// Lazy loaded components
const LazyComponent1 = lazy(() => import('./components/Component1'))
const LazyComponent2 = lazy(() => import('./components/Component2'))

const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-full">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
  </div>
)

const entry = {
  'lazy1': () => (
    <Suspense fallback={<LoadingSpinner />}>
      <LazyComponent1 />
    </Suspense>
  ),
  'lazy2': () => (
    <Suspense fallback={<LoadingSpinner />}>
      <LazyComponent2 />
    </Suspense>
  ),
}
```

## Custom Styling / 自定义样式

```css
/* Custom handle styles */
.tg-handle {
  @apply transition-colors duration-200;
}

.tg-handle:hover {
  @apply bg-indigo-500;
}

/* Custom resize cursors */
.horizontal .tg-handle {
  @apply cursor-col-resize;
}

.vertical .tg-handle {
  @apply cursor-row-resize;
}

/* Custom drop zone feedback */
.drag-and-drop-events canvas {
  @apply transition-opacity duration-150;
}
```

## IDE-like Layout Example / IDE 风格布局示例

```tsx
const FileExplorer = () => (
  <div className="bg-gray-100 h-full p-2">
    <h3 className="font-bold mb-2">Files</h3>
    <div className="space-y-1">
      <div>📁 src/</div>
      <div>📁 components/</div>
      <div>📄 App.tsx</div>
    </div>
  </div>
)

const CodeEditor = () => (
  <div className="bg-gray-900 text-green-400 h-full p-4 font-mono">
    <div>// Welcome to Tangram</div>
    <div>export const App = () =&gt; {`{`}</div>
    <div>  return &lt;div&gt;Hello World&lt;/div&gt;</div>
    <div>{`}`}</div>
  </div>
)

const Console = () => (
  <div className="bg-black text-white h-full p-2 font-mono text-sm">
    <div>&gt; npm start</div>
    <div>Starting development server...</div>
  </div>
)

const Properties = () => (
  <div className="bg-gray-50 h-full p-2">
    <h3 className="font-bold mb-2">Properties</h3>
    <div className="space-y-1 text-sm">
      <div>width: 100%</div>
      <div>height: 100%</div>
    </div>
  </div>
)

const ideEntry = {
  'explorer': FileExplorer,
  'editor': CodeEditor,
  'console': Console,
  'properties': Properties,
}

const ideLayout: Node = {
  type: NodeType.layout,
  direction: Direction.horizontal,
  proportion: [1, 3, 1],
  children: [
    { type: NodeType.content, entry: 'explorer' },
    {
      type: NodeType.layout,
      direction: Direction.vertical,
      proportion: [3, 1],
      children: [
        { type: NodeType.content, entry: 'editor' },
        { type: NodeType.content, entry: 'console' },
      ],
    },
    { type: NodeType.content, entry: 'properties' },
  ],
}

export const IDEExample = () => {
  const [layoutTree, setLayoutTree] = useState<Node | null>(ideLayout)

  return (
    <TangramProvider 
      entry={ideEntry}
      minColumnWidthPercentage={0.1}
      minRowHeightPercentage={0.1}
    >
      <div className="w-full h-screen border">
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

## How to Use / 使用方法

1. **Install the package / 安装包**:
   ```bash
   npm install @nrxlor/tangram
   # or
   pnpm add @nrxlor/tangram
   ```

2. **Import CSS / 导入样式**:
   ```tsx
   import '@nrxlor/tangram/dist/tangram.css'
   ```

3. **Define components / 定义组件**:
   - Create your React components
   - Register them in an entry object

4. **Setup layout tree / 设置布局树**:
   - Use Node interfaces to define initial layout
   - Can be a single content node or complex nested structure

5. **Implement provider / 实现提供者**:
   - Wrap your app with TangramProvider
   - Pass entry registry and configuration

6. **Add renderer / 添加渲染器**:
   - Use BinaryLayoutRenderer as root component
   - Pass layout state and change handler

## Tips / 使用技巧

- **Start simple**: Begin with single content node, let users build layout by dragging
- **Persist layouts**: Save layout tree to localStorage or backend
- **Lazy loading**: Use React.lazy for better performance with many components
- **Custom styling**: Override default Tailwind classes for custom appearance
- **Error boundaries**: Wrap components to handle errors gracefully
- **Responsive**: Consider mobile/tablet experiences with appropriate min sizes