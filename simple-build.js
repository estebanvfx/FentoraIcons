#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔨 Simple build for line-icons-react\n');

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

// 1. Create CommonJS bundle
console.log('1. Creating CommonJS bundle...');
const cjsExports = iconNames.map(name => `exports.${name} = require('./${name}').default;`).join('\n');

const cjsContent = `'use strict';

// Line Icons React - CommonJS Bundle
// Generated: ${new Date().toISOString()}
// Total icons: ${iconNames.length}

${cjsExports}

// Default export
module.exports = {
${iconNames.map(name => `  ${name}: exports.${name}`).join(',\n')}
};`;

fs.writeFileSync(path.join(DIST_CJS, 'index.js'), cjsContent);

// 2. Create ES Module bundle
console.log('2. Creating ES Module bundle...');
const esmExports = iconNames.map(name => `export { default as ${name} } from './${name}';`).join('\n');

const esmContent = `// Line Icons React - ES Module Bundle
// Generated: ${new Date().toISOString()}
// Total icons: ${iconNames.length}

${esmExports}

// Default export
export default {
${iconNames.map(name => `  ${name}`).join(',\n')}
};`;

fs.writeFileSync(path.join(DIST_ESM, 'index.js'), esmContent);

// 3. Create UMD bundle
console.log('3. Creating UMD bundle...');
const umdContent = `(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.LineIconsReact = {}));
})(this, (function (exports) {
  'use strict';

  // Line Icons React - UMD Bundle
  // Generated: ${new Date().toISOString()}
  // Total icons: ${iconNames.length}

  // Icon implementations would go here
  // For now, this is a placeholder

  Object.defineProperty(exports, '__esModule', { value: true });

}));`;

fs.writeFileSync(path.join(DIST_UMD, 'index.js'), umdContent);

// 4. Create TypeScript definitions
console.log('4. Creating TypeScript definitions...');
const typeExports = iconNames.map(name => `export { default as ${name} } from './${name}';`).join('\n');

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

export { default as createLineIcon } from './createLineIcon';
export { default as Icon } from './Icon';

${typeExports}

// Default export
export default {
${iconNames.map(name => `  ${name}`).join(',\n')}
};`;

fs.writeFileSync(path.join(DIST_DIR, 'index.d.ts'), typeContent);

// 5. Copy individual icon files (simplified)
console.log('5. Copying icon files...');
iconFiles.slice(0, 5).forEach(file => { // Copy first 5 as example
  const srcFile = path.join(iconsDir, file);
  const destFile = path.join(DIST_ESM, file.replace('.tsx', '.js'));
  
  // Create simplified version
  const content = `// Simplified icon component
export default function ${path.basename(file, '.tsx')}(props) {
  return 'Icon placeholder';
}`;
  
  fs.writeFileSync(destFile, content);
});

console.log('\n✅ Build completed!');
console.log(`\n📦 Output:`);
console.log(`   • CommonJS: ${DIST_CJS}/index.js`);
console.log(`   • ES Modules: ${DIST_ESM}/index.js`);
console.log(`   • UMD: ${DIST_UMD}/index.js`);
console.log(`   • TypeScript: ${DIST_DIR}/index.d.ts`);
console.log(`\n🎯 Note: This is a simplified build. For full production build,`);
console.log(`   install rollup dependencies and run: npx rollup -c`);