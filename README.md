# @line-icons/react

Line Icons library for React applications. 2,480+ premium line icons built with modern architecture.

## 📦 Installation

```bash
npm install @line-icons/react
# or
pnpm add @line-icons/react
# or
yarn add @line-icons/react
```

## 🚀 Quick Start

```jsx
import { HomeIcon, UserIcon, SettingsIcon } from '@line-icons/react';

function App() {
  return (
    <div>
      <HomeIcon size={24} color="#000" />
      <UserIcon size={32} color="#333" />
      <SettingsIcon size={24} color="#666" />
    </div>
  );
}
```

## 🎨 Props

All icon components accept the following props:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `number \| string` | `24` | Icon size in pixels |
| `color` | `string` | `currentColor` | Stroke color |
| `strokeWidth` | `number \| string` | `2` | Stroke width |
| `absoluteStrokeWidth` | `boolean` | `false` | Use absolute stroke width |
| `className` | `string` | - | Additional CSS class |
| `style` | `object` | - | Inline styles |
| All SVG props | - | - | Any valid SVG attribute |

## 📦 Bundle Formats

The library is available in multiple formats:

- **CommonJS** (`dist/cjs/index.js`) - For Node.js and older bundlers
- **ES Modules** (`dist/esm/index.js`) - For modern bundlers (tree-shaking)
- **UMD** (`dist/umd/index.js`) - For browser direct use
- **UMD Minified** (`dist/umd/index.min.js`) - Production optimized

## 🌳 Tree Shaking

The library is optimized for tree-shaking. Only import what you use:

```jsx
// ✅ Good - only imports what's needed
import { HomeIcon } from '@line-icons/react';

// ❌ Avoid - imports everything
import * as Icons from '@line-icons/react';
```

## 🔧 Advanced Usage

### Custom Stroke Width
```jsx
<HomeIcon size={32} strokeWidth={1.5} />
```

### Absolute Stroke Width
```jsx
<HomeIcon size={48} strokeWidth={2} absoluteStrokeWidth />
```

### With CSS Classes
```jsx
<HomeIcon className="icon-large text-primary" />
```

### Dynamic Icon Loading
```jsx
import { createLineIcon } from '@line-icons/react';

// Create custom icon from SVG data
const CustomIcon = createLineIcon('CustomIcon', [
  ['path', { d: 'M12 2L2 7l10 5 10-5-10-5z' }],
  ['path', { d: 'M2 17l10 5 10-5' }],
  ['path', { d: 'M2 12l10 5 10-5' }]
]);

function App() {
  return <CustomIcon size={24} color="#4a6cf7" />;
}
```

## 📊 Available Icons

The library includes 2,480+ line icons covering:

- **Interface** (buttons, menus, navigation)
- **Essential** (home, user, settings, search)
- **Business** (chart, graph, money, calendar)
- **Technology** (devices, code, cloud, database)
- **Communication** (mail, message, phone, video)
- **And many more...**

See the full list in the [icons directory](../../icons/).

## 🛠️ Development

### Generating Icons
```bash
# Generate React components from SVG files
pnpm build:icons

# Build all bundles
pnpm build

# Development mode (watch)
pnpm dev
```

### Adding New Icons
1. Place SVG file in the root `icons/` directory
2. Run: `pnpm build:icons`
3. The icon will be available as `{FileName}Icon`

## 📄 License

MIT © Esteban Vfx

## 🔗 Links

- [Monorepo](../../README.md)
- [Icons Directory](../../icons/)
- [GitHub Repository](https://github.com/estebanvfx/line-icons)

---

*Part of the Line Icons monorepo - Modern icon library architecture*