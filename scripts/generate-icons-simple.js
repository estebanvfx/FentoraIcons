#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Generating Line Icons React components (simple version)...\n');

const ICONS_DIR = path.join(__dirname, '../icons');
const OUTPUT_DIR = path.join(__dirname, '../src/icons');
const ALIASES_DIR = path.join(__dirname, '../src/aliases');
const ICONS_INDEX = path.join(__dirname, '../src/icons/index.ts');
const ALIASES_INDEX = path.join(__dirname, '../src/aliases/index.ts');

// Ensure directories exist
[OUTPUT_DIR, ALIASES_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Get all SVG files
const svgFiles = fs.readdirSync(ICONS_DIR).filter(file => file.endsWith('.svg'));

console.log(`📊 Found ${svgFiles.length} SVG files\n`);

const iconExports = [];
const aliasExports = [];
const seenComponentNames = new Set();

// Process each SVG file (ALL icons)
const filesToProcess = svgFiles; // Process ALL icons

filesToProcess.forEach((svgFile, index) => {
  try {
    const fileName = path.basename(svgFile, '.svg');
    
    // Convert filename to PascalCase for component name
    let componentName = fileName
      .replace(/[^a-zA-Z0-9]/g, ' ')
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('') + 'Icon';

    // JS identifiers can't start with a digit — prefix with "Icon"
    if (/^\d/.test(componentName)) {
      componentName = 'Icon' + componentName;
    }
    
    // Read SVG content
    const svgPath = path.join(ICONS_DIR, svgFile);
    const svgContent = fs.readFileSync(svgPath, 'utf8');
    
    // Simple SVG parsing - extract path data
    const pathMatches = svgContent.match(/<path[^>]*>/g) || [];
    const circleMatches = svgContent.match(/<circle[^>]*>/g) || [];
    const rectMatches = svgContent.match(/<rect[^>]*>/g) || [];
    const lineMatches = svgContent.match(/<line[^>]*>/g) || [];
    const polyMatches = svgContent.match(/<poly(line|gon)[^>]*>/g) || [];
    
    // Create icon node array
    const iconNode = [];
    
    // Maps SVG hyphenated attr names → React camelCase
    const SVG_ATTR_MAP = {
      'stroke-width': 'strokeWidth',
      'stroke-linecap': 'strokeLinecap',
      'stroke-linejoin': 'strokeLinejoin',
      'fill-rule': 'fillRule',
      'clip-rule': 'clipRule',
      'clip-path': 'clipPath',
    };

    // Parse attrs from an SVG tag string, mapping to React camelCase
    function parseAttrs(tag) {
      const attrs = {};
      // Match both plain (word) and hyphenated attribute names
      const attrRegex = /([\w-]+)="([^"]*)"/g;
      let m;
      while ((m = attrRegex.exec(tag)) !== null) {
        const key = m[1];
        const value = m[2];
        // Skip 'stroke' — inherited from parent SVG via the color prop
        if (key === 'stroke') continue;
        attrs[SVG_ATTR_MAP[key] || key] = value;
      }
      return attrs;
    }

    // Process paths
    pathMatches.forEach(tag => {
      iconNode.push(['path', parseAttrs(tag)]);
    });

    // Process circles
    circleMatches.forEach(tag => {
      iconNode.push(['circle', parseAttrs(tag)]);
    });

    // Process rects
    rectMatches.forEach(tag => {
      iconNode.push(['rect', parseAttrs(tag)]);
    });

    // Process lines
    lineMatches.forEach(tag => {
      iconNode.push(['line', parseAttrs(tag)]);
    });

    // Process polylines/polygons
    polyMatches.forEach(tag => {
      const tagName = tag.startsWith('<polygon') ? 'polygon' : 'polyline';
      iconNode.push([tagName, parseAttrs(tag)]);
    });

    // Create icon component
    const componentContent = `import createLineIcon from '../createLineIcon';
import type { IconNode } from '../types';

const iconNode: IconNode = ${JSON.stringify(iconNode, null, 2)};

const ${componentName} = createLineIcon('${componentName}', iconNode);

export default ${componentName};`;
    
    // Write component file (skip if name already used)
    if (seenComponentNames.has(componentName)) {
      return;
    }
    seenComponentNames.add(componentName);

    const outputPath = path.join(OUTPUT_DIR, `${componentName}.tsx`);
    fs.writeFileSync(outputPath, componentContent);

    // Store for index file
    iconExports.push(`export { default as ${componentName} } from './${componentName}';`);
    
    // Progress indicator
    if ((index + 1) % 10 === 0) {
      console.log(`  Processed ${index + 1}/${filesToProcess.length} icons...`);
    }
    
  } catch (error) {
    console.error(`Error processing ${svgFile}:`, error.message);
  }
});

// Write icons index file
const iconsIndexContent = `// Auto-generated icon components
// Total icons: ${iconExports.length}

${iconExports.join('\n')}`;

fs.writeFileSync(ICONS_INDEX, iconsIndexContent);

// Build aliases from icon exports — camelCase, no duplicates
const seenAliases = new Set();
const uniqueAliases = [];
for (const exp of iconExports) {
  const match = exp.match(/as (\w+) } from '\.\/(\w+)'/);
  if (!match) continue;
  const [, componentName, fileName] = match;
  const withoutSuffix = componentName.endsWith('Icon') ? componentName.slice(0, -4) : componentName;
  const alias = withoutSuffix.charAt(0).toLowerCase() + withoutSuffix.slice(1);
  if (alias && !seenAliases.has(alias)) {
    seenAliases.add(alias);
    // Path from src/aliases/ to src/icons/
    uniqueAliases.push(`export { default as ${alias} } from '../icons/${fileName}';`);
  }
}

const aliasesIndexContent = `// Icon aliases — camelCase shorthand for all components
// Total: ${uniqueAliases.length}

${uniqueAliases.join('\n')}
`;

fs.writeFileSync(ALIASES_INDEX, aliasesIndexContent);

console.log('\n✅ Icon generation complete!');
console.log(`\n📊 Statistics:`);
console.log(`   • Icons generated: ${iconExports.length}`);
console.log(`   • Aliases created: ${aliasExports.length}`);
console.log(`   • Output directory: ${OUTPUT_DIR}`);
console.log(`\n🚀 Next steps:`);
console.log(`   1. Install dependencies: cd .. && pnpm install`);
console.log(`   2. Build bundles: pnpm build:bundles`);
console.log(`   3. Test with: import { HomeIcon } from '@line-icons/react'`);