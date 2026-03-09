#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing icon names that start with numbers...\n');

const ICONS_DIR = path.join(__dirname, '../src/icons');
const ICONS_INDEX = path.join(__dirname, '../src/icons/index.ts');

// Read all icon files
const iconFiles = fs.readdirSync(ICONS_DIR).filter(f => f.endsWith('.tsx'));

console.log(`📊 Found ${iconFiles.length} icon files\n`);

const fixedIcons = [];
const renameMap = new Map();

// First pass: identify icons that need renaming
iconFiles.forEach(file => {
  const componentName = path.basename(file, '.tsx');
  
  // Check if component name starts with a number
  if (/^\d/.test(componentName)) {
    // Add "Icon" prefix to fix the name
    const fixedName = 'Icon' + componentName;
    const oldPath = path.join(ICONS_DIR, file);
    const newPath = path.join(ICONS_DIR, fixedName + '.tsx');
    
    renameMap.set(componentName, fixedName);
    console.log(`  🔄 ${componentName} → ${fixedName}`);
  }
});

// Second pass: rename files and update content
if (renameMap.size > 0) {
  console.log(`\n🔄 Renaming ${renameMap.size} files...`);
  
  renameMap.forEach((newName, oldName) => {
    const oldFile = path.join(ICONS_DIR, oldName + '.tsx');
    const newFile = path.join(ICONS_DIR, newName + '.tsx');
    
    // Read and update file content
    let content = fs.readFileSync(oldFile, 'utf8');
    
    // Update the component name in the file
    content = content.replace(
      new RegExp(`const ${oldName} =`, 'g'),
      `const ${newName} =`
    );
    
    content = content.replace(
      new RegExp(`createLineIcon\\('${oldName}'`, 'g'),
      `createLineIcon('${newName}'`
    );
    
    content = content.replace(
      new RegExp(`export default ${oldName};`, 'g'),
      `export default ${newName};`
    );
    
    // Write updated content to new file
    fs.writeFileSync(newFile, content);
    
    // Delete old file
    fs.unlinkSync(oldFile);
    
    fixedIcons.push(newName);
  });
  
  // Update index.ts file
  console.log('\n📝 Updating index.ts...');
  const iconExports = [];
  
  // Get all icon files (including renamed ones)
  const allIconFiles = fs.readdirSync(ICONS_DIR).filter(f => f.endsWith('.tsx'));
  
  allIconFiles.forEach(file => {
    const componentName = path.basename(file, '.tsx');
    iconExports.push(`export { default as ${componentName} } from './${componentName}';`);
  });
  
  const indexContent = `// Auto-generated icon components
// Total icons: ${iconExports.length}
// Fixed ${renameMap.size} icon names that started with numbers

${iconExports.join('\n')}

// Export all icons as default object
export default {
${iconExports.map(exp => {
  const match = exp.match(/as (\w+)/);
  return match ? `  ${match[1]}: ${match[1]}` : '';
}).filter(Boolean).join(',\n')}
};`;
  
  fs.writeFileSync(ICONS_INDEX, indexContent);
  
  console.log('\n✅ Fix completed!');
  console.log(`\n📊 Statistics:`);
  console.log(`   • Icons fixed: ${renameMap.size}`);
  console.log(`   • Total icons: ${allIconFiles.length}`);
  console.log(`\n🚀 Next: Run the build again`);
  console.log(`   cd .. && pnpm build:bundles`);
  
} else {
  console.log('✅ No icons need fixing! All icon names are valid.');
}