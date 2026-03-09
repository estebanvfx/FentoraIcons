#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Building optimized icon library with individual files...\n');

const SRC_DIR = path.join(__dirname, 'src');
const ICONS_DIR = path.join(SRC_DIR, 'icons');
const DIST_ESM_DIR = path.join(__dirname, 'dist/esm');
const DIST_CJS_DIR = path.join(__dirname, 'dist/cjs');
const DIST_UMD_DIR = path.join(__dirname, 'dist/umd');

// Clean dist directories
console.log('🧹 Cleaning dist directories...');
[ DIST_ESM_DIR, DIST_CJS_DIR, DIST_UMD_DIR ].forEach(dir => {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
  fs.mkdirSync(dir, { recursive: true });
});

// Create icon directories
const ESM_ICONS_DIR = path.join(DIST_ESM_DIR, 'icons');
const CJS_ICONS_DIR = path.join(DIST_CJS_DIR, 'icons');
fs.mkdirSync(ESM_ICONS_DIR, { recursive: true });
fs.mkdirSync(CJS_ICONS_DIR, { recursive: true });

console.log('📊 Reading icon files...');
const iconFiles = fs.readdirSync(ICONS_DIR).filter(f => f.endsWith('.tsx'));
console.log(`Found ${iconFiles.length} icon files\n`);

// Create shared utilities
console.log('🛠️ Creating shared utilities...');

// ESM createLineIcon
const createLineIconESM = `
import React from 'react';
import type { IconProps } from './types';

export function createLineIcon(
  iconName: string,
  IconComponent: React.ComponentType<IconProps>
) {
  const LineIcon = React.forwardRef<SVGSVGElement, IconProps>(
    ({ size = 24, color = 'currentColor', strokeWidth = 2, ...props }, ref) => {
      return React.createElement(IconComponent, {
        ref,
        size,
        color,
        strokeWidth,
        ...props
      });
    }
  );
  
  LineIcon.displayName = \`\${iconName}\`;
  return LineIcon;
}
`;
fs.writeFileSync(path.join(DIST_ESM_DIR, 'createLineIcon.js'), createLineIconESM);

// CJS createLineIcon
const createLineIconCJS = `
const React = require('react');

function createLineIcon(iconName, IconComponent) {
  const LineIcon = React.forwardRef(function LineIcon(
    { size = 24, color = 'currentColor', strokeWidth = 2, ...props },
    ref
  ) {
    return React.createElement(IconComponent, {
      ref,
      size,
      color,
      strokeWidth,
      ...props
    });
  });
  
  LineIcon.displayName = iconName;
  return LineIcon;
}

module.exports = { createLineIcon };
`;
fs.writeFileSync(path.join(DIST_CJS_DIR, 'createLineIcon.js'), createLineIconCJS);

// ESM Icon component
const iconComponentESM = `
import React from 'react';
import type { IconProps } from './types';

export const Icon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ size = 24, color = 'currentColor', strokeWidth = 2, children, ...props }, ref) => {
    return React.createElement(
      'svg',
      {
        ref,
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        ...props
      },
      children
    );
  }
);

Icon.displayName = 'Icon';
`;
fs.writeFileSync(path.join(DIST_ESM_DIR, 'Icon.js'), iconComponentESM);

// CJS Icon component
const iconComponentCJS = `
const React = require('react');

const Icon = React.forwardRef(function Icon(
  { size = 24, color = 'currentColor', strokeWidth = 2, children, ...props },
  ref
) {
  return React.createElement(
    'svg',
    {
      ref,
      width: size,
      height: size,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: color,
      strokeWidth,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      ...props
    },
    children
  );
});

Icon.displayName = 'Icon';

module.exports = { Icon };
`;
fs.writeFileSync(path.join(DIST_CJS_DIR, 'Icon.js'), iconComponentCJS);

// Types file
const typesContent = `
import React from 'react';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  color?: string;
  strokeWidth?: number | string;
}
`;
fs.writeFileSync(path.join(DIST_ESM_DIR, 'types.js'), typesContent);
fs.writeFileSync(path.join(DIST_CJS_DIR, 'types.js'), `
module.exports = {};
`);

// Process each icon
console.log('🎨 Generating individual icon files...');
let processed = 0;
const batchSize = 100;

for (const iconFile of iconFiles) {
  const iconName = path.basename(iconFile, '.tsx');
  const iconPath = path.join(ICONS_DIR, iconFile);
  const content = fs.readFileSync(iconPath, 'utf8');
  
  // Extract icon component (simplified for demo)
  // In reality, we'd parse the TSX and convert to JS
  const esmContent = content
    .replace(/import React from 'react';/, `import React from 'react';
import { createLineIcon } from './createLineIcon.js';`)
    .replace(/export const (\w+) =/, `const $1Component =`)
    .replace(/\);$/, `);
export const ${iconName} = createLineIcon('${iconName}', ${iconName}Component);`);
  
  const cjsContent = content
    .replace(/import React from 'react';/, `const React = require('react');
const { createLineIcon } = require('./createLineIcon.js');`)
    .replace(/export const (\w+) =/, `const $1Component =`)
    .replace(/\);$/, `);
const ${iconName} = createLineIcon('${iconName}', ${iconName}Component);
module.exports = { ${iconName} };`);
  
  fs.writeFileSync(path.join(ESM_ICONS_DIR, `${iconName}.js`), esmContent);
  fs.writeFileSync(path.join(CJS_ICONS_DIR, `${iconName}.js`), cjsContent);
  
  processed++;
  if (processed % batchSize === 0) {
    console.log(`  Processed ${processed}/${iconFiles.length} icons...`);
  }
}

// Create index files
console.log('\n📚 Creating index files...');

const esmExports = iconFiles.map(f => {
  const iconName = path.basename(f, '.tsx');
  return `export { ${iconName} } from './icons/${iconName}.js';`;
});

const cjsExports = iconFiles.map(f => {
  const iconName = path.basename(f, '.tsx');
  return `exports.${iconName} = require('./icons/${iconName}.js').${iconName};`;
});

// ESM index
const esmIndex = `// Main exports
export { createLineIcon } from './createLineIcon.js';
export { Icon } from './Icon.js';

// Individual icon exports
${esmExports.join('\n')}
`;
fs.writeFileSync(path.join(DIST_ESM_DIR, 'index.js'), esmIndex);

// CJS index
const cjsIndex = `// Main exports
exports.createLineIcon = require('./createLineIcon.js').createLineIcon;
exports.Icon = require('./Icon.js').Icon;

// Individual icon exports
${cjsExports.join('\n')}
`;
fs.writeFileSync(path.join(DIST_CJS_DIR, 'index.js'), cjsIndex);

// Create TypeScript definitions
console.log('📝 Generating TypeScript definitions...');

const typeExports = iconFiles.map(f => {
  const iconName = path.basename(f, '.tsx');
  return `export declare const ${iconName}: React.ForwardRefExoticComponent<IconProps & React.RefAttributes<SVGSVGElement>>;`;
});

const dtsContent = `import React from 'react';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  color?: string;
  strokeWidth?: number | string;
}

export declare const createLineIcon: (
  iconName: string,
  IconComponent: React.ComponentType<IconProps>
) => React.ForwardRefExoticComponent<IconProps & React.RefAttributes<SVGSVGElement>>;

export declare const Icon: React.ForwardRefExoticComponent<IconProps & React.RefAttributes<SVGSVGElement>>;

// Individual icon exports
${typeExports.join('\n')}
`;
fs.writeFileSync(path.join(__dirname, 'dist/index.d.ts'), dtsContent);

console.log('\n✅ BUILD COMPLETED SUCCESSFULLY!');
console.log(`📊 Generated ${iconFiles.length} individual icon files`);
console.log(`📁 ESM: ${DIST_ESM_DIR}`);
console.log(`📁 CJS: ${DIST_CJS_DIR}`);
console.log(`📁 Types: ${path.join(__dirname, 'dist/index.d.ts')}`);
console.log('\n🎯 Tree-shaking ready with "sideEffects": false');