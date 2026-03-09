#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔨 Fixed build for line-icons-react\n');

const SRC_DIR = path.join(__dirname, 'src');
const DIST_DIR = path.join(__dirname, 'dist');
const DIST_CJS = path.join(DIST_DIR, 'cjs');
const DIST_ESM = path.join(DIST_DIR, 'esm');
const DIST_UMD = path.join(DIST_DIR, 'umd');

// Create directories
[DIST_DIR, DIST_CJS, DIST_ESM, DIST_UMD].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Read all icon components
const iconsDir = path.join(SRC_DIR, 'icons');
const iconFiles = fs.readdirSync(iconsDir).filter(f => f.endsWith('.tsx'));

console.log(`📊 Processing ${iconFiles.length} icon components...\n`);

// Get icon names
const iconNames = iconFiles.map(file => path.basename(file, '.tsx'));

// Read createLineIcon template
const createLineIconPath = path.join(SRC_DIR, 'createLineIcon.tsx');
const createLineIconContent = fs.readFileSync(createLineIconPath, 'utf8');

// Extract just the function (simplified for bundle)
const createLineIconFunction = `function createLineIcon(iconName, iconNode) {
  return function IconComponent({
    size = 24,
    color = 'currentColor',
    strokeWidth = 2,
    absoluteStrokeWidth,
    children,
    ...rest
  }) {
    const strokeWidthValue = absoluteStrokeWidth
      ? (Number(strokeWidth) * 24) / Number(size)
      : strokeWidth;

    return React.createElement(
      'svg',
      {
        xmlns: 'http://www.w3.org/2000/svg',
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: strokeWidthValue,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        ...rest
      },
      iconNode.map(([tag, attrs], index) => {
        return React.createElement(tag, { key: index, ...attrs });
      }),
      children
    );
  };
}`;

// 1. Create CommonJS bundle (self-contained)
console.log('1. Creating CommonJS bundle...');
const cjsIcons = [];

iconNames.forEach((iconName, index) => {
  try {
    const iconPath = path.join(iconsDir, `${iconName}.tsx`);
    const iconContent = fs.readFileSync(iconPath, 'utf8');
    
    // Extract iconNode from the file
    const iconNodeMatch = iconContent.match(/const iconNode: IconNode = (\[[\s\S]*?\]);/);
    if (iconNodeMatch) {
      const iconNode = iconNodeMatch[1];
      cjsIcons.push(`  ${iconName}: createLineIcon('${iconName}', ${iconNode})`);
    }
    
    // Progress indicator
    if ((index + 1) % 100 === 0) {
      console.log(`  Processed ${index + 1}/${iconNames.length} icons...`);
    }
  } catch (error) {
    console.error(`Error processing ${iconName}:`, error.message);
  }
});

const cjsContent = `'use strict';

const React = require('react');

${createLineIconFunction}

// Line Icons React - CommonJS Bundle
// Generated: ${new Date().toISOString()}
// Total icons: ${iconNames.length}

module.exports = {
${cjsIcons.join(',\n')}
};

// Also export each icon individually
${iconNames.map(name => `exports.${name} = module.exports.${name};`).join('\n')}`;

fs.writeFileSync(path.join(DIST_CJS, 'index.js'), cjsContent);

// 2. Create ES Module bundle
console.log('2. Creating ES Module bundle...');
const esmIcons = [];

iconNames.forEach((iconName, index) => {
  try {
    const iconPath = path.join(iconsDir, `${iconName}.tsx`);
    const iconContent = fs.readFileSync(iconPath, 'utf8');
    
    // Extract iconNode from the file
    const iconNodeMatch = iconContent.match(/const iconNode: IconNode = (\[[\s\S]*?\]);/);
    if (iconNodeMatch) {
      const iconNode = iconNodeMatch[1];
      esmIcons.push(`export const ${iconName} = createLineIcon('${iconName}', ${iconNode});`);
    }
  } catch (error) {
    console.error(`Error processing ${iconName}:`, error.message);
  }
});

const esmContent = `import React from 'react';

${createLineIconFunction.replace(/function createLineIcon/, 'export function createLineIcon')}

// Line Icons React - ES Module Bundle
// Generated: ${new Date().toISOString()}
// Total icons: ${iconNames.length}

${esmIcons.join('\n')}

// Default export
export default {
${iconNames.map(name => `  ${name}`).join(',\n')}
};`;

fs.writeFileSync(path.join(DIST_ESM, 'index.js'), esmContent);

// 3. Create TypeScript definitions
console.log('3. Creating TypeScript definitions...');
const typeExports = iconNames.map(name => `export declare const ${name}: React.FC<IconProps>;`).join('\n');

const typeContent = `// Line Icons React - TypeScript Definitions
// Generated: ${new Date().toISOString()}
// Total icons: ${iconNames.length}

import * as React from 'react';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  color?: string;
  strokeWidth?: number | string;
  absoluteStrokeWidth?: boolean;
}

export type IconNode = [elementName: string, attrs: Record<string, string>][];

export interface LucideIconProps extends IconProps {
  iconNode: IconNode;
}

export declare function createLineIcon(
  iconName: string,
  iconNode: IconNode
): React.FC<LucideIconProps>;

export declare const Icon: React.FC<IconProps>;

${typeExports}

// Default export
declare const _default: {
${iconNames.map(name => `  ${name}: React.FC<IconProps>`).join(',\n')}
};

export default _default;`;

fs.writeFileSync(path.join(DIST_DIR, 'index.d.ts'), typeContent);

// 4. Create simple UMD bundle
console.log('4. Creating UMD bundle...');
const umdIcons = iconNames.map(name => `  ${name}: createLineIcon('${name}', [])`).join(',\n');

const umdContent = `(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('react')) :
  typeof define === 'function' && define.amd ? define(['exports', 'react'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.LineIconsReact = {}, global.React));
})(this, (function (exports, React) {
  'use strict';

  ${createLineIconFunction}

  // Line Icons React - UMD Bundle
  // Generated: ${new Date().toISOString()}
  // Total icons: ${iconNames.length}

  // Note: This is a placeholder UMD bundle
  // For full UMD bundle with all icons, use Rollup build

  exports.createLineIcon = createLineIcon;
  
  Object.defineProperty(exports, '__esModule', { value: true });

}));`;

fs.writeFileSync(path.join(DIST_UMD, 'index.js'), umdContent);

console.log('\n✅ Build completed!');
console.log(`\n📦 Output:`);
console.log(`   • CommonJS: ${DIST_CJS}/index.js (self-contained)`);
console.log(`   • ES Modules: ${DIST_ESM}/index.js`);
console.log(`   • UMD: ${DIST_UMD}/index.js (placeholder)`);
console.log(`   • TypeScript: ${DIST_DIR}/index.d.ts`);
console.log(`\n🎯 Note: This build includes ALL icons in a single file.`);