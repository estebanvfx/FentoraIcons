#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { parseString } = require('xml2js');

console.log('🚀 Generating Line Icons React components...\n');

const ICONS_DIR = path.join(__dirname, '../../icons');
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
const iconMap = new Map();

// Process each SVG file
svgFiles.forEach((svgFile, index) => {
  try {
    const fileName = path.basename(svgFile, '.svg');
    
    // Convert filename to PascalCase for component name
    const componentName = fileName
      .replace(/[^a-zA-Z0-9]/g, ' ')
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('') + 'Icon';
    
    // Read SVG content
    const svgPath = path.join(ICONS_DIR, svgFile);
    const svgContent = fs.readFileSync(svgPath, 'utf8');
    
    // Parse SVG to extract paths
    parseString(svgContent, (err, result) => {
      if (err) {
        console.error(`Error parsing ${svgFile}:`, err.message);
        return;
      }
      
      const svg = result.svg;
      const iconNode = [];
      
      // Extract all drawing elements
      const extractElements = (element, parentAttrs = {}) => {
        if (!element) return;
        
        Object.keys(element).forEach(key => {
          if (['path', 'circle', 'rect', 'line', 'polyline', 'polygon'].includes(key)) {
            element[key].forEach(item => {
              const attrs = { ...parentAttrs, ...item.$ };
              iconNode.push([key, attrs]);
            });
          } else if (key === 'g' && element[key]) {
            // Handle groups
            const groupAttrs = element[key][0].$ || {};
            extractElements(element[key][0], groupAttrs);
          }
        });
      };
      
      extractElements(svg);
      
      // Create icon component
      const componentContent = `import createLineIcon from '../createLineIcon';
import type { IconNode } from '../types';

const iconNode: IconNode = ${JSON.stringify(iconNode, null, 2)};

const ${componentName} = createLineIcon('${componentName}', iconNode);

export default ${componentName};`;
      
      // Write component file
      const outputPath = path.join(OUTPUT_DIR, `${componentName}.tsx`);
      fs.writeFileSync(outputPath, componentContent);
      
      // Store for index file
      iconExports.push(`export { default as ${componentName} } from './${componentName}';`);
      iconMap.set(fileName.toLowerCase(), componentName);
      
      // Create simple alias (remove numbers, special chars)
      const simpleName = fileName.replace(/[^a-zA-Z]/g, '');
      if (simpleName && simpleName !== componentName.replace('Icon', '')) {
        aliasExports.push(`export { ${componentName} as ${simpleName} } from './${componentName}';`);
      }
      
      // Progress indicator
      if ((index + 1) % 100 === 0) {
        console.log(`  Processed ${index + 1}/${svgFiles.length} icons...`);
      }
    });
    
  } catch (error) {
    console.error(`Error processing ${svgFile}:`, error.message);
  }
});

// Write icons index file
const iconsIndexContent = `// Auto-generated icon components
// Total icons: ${iconExports.length}

${iconExports.join('\n')}

// Export all icons as default object
export default {
${iconExports.map(exp => {
  const match = exp.match(/as (\w+)/);
  return match ? `  ${match[1]}: ${match[1]}` : '';
}).filter(Boolean).join(',\n')}
};`;

fs.writeFileSync(ICONS_INDEX, iconsIndexContent);

// Write aliases index file
const aliasesIndexContent = `// Icon aliases for alternative naming
// Generated: ${new Date().toISOString()}

${aliasExports.join('\n')}`;

fs.writeFileSync(ALIASES_INDEX, aliasExports.length > 0 ? aliasesIndexContent : '// No aliases generated\n');

console.log('\n✅ Icon generation complete!');
console.log(`\n📊 Statistics:`);
console.log(`   • Icons generated: ${iconExports.length}`);
console.log(`   • Aliases created: ${aliasExports.length}`);
console.log(`   • Output directory: ${OUTPUT_DIR}`);
console.log(`\n🚀 Next steps:`);
console.log(`   1. Run: pnpm build:bundles`);
console.log(`   2. Test with: import { HomeIcon } from '@line-icons/react'`);
console.log(`   3. Build all packages: pnpm build`);