#!/usr/bin/env node

/**
 * Post-build script to add .js extensions to imports
 * This is needed for ES modules to work properly in Node.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outDir = path.join(__dirname, 'out');

function addJsExtensions(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Match import/export statements with relative paths that don't have .js extension
  const importRegex = /(from\s+['"])(\.\.?\/[^'"]+)(?<!\.js)(['"])/g;
  
  const newContent = content.replace(importRegex, (match, prefix, importPath, suffix) => {
    // Skip if already has .js extension or if it's a package import
    if (importPath.endsWith('.js') || !importPath.startsWith('.')) {
      return match;
    }
    
    modified = true;
    return `${prefix}${importPath}.js${suffix}`;
  });
  
  if (modified) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✓ Fixed: ${path.relative(process.cwd(), filePath)}`);
  }
  
  return modified;
}

function processDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let totalFixed = 0;
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      totalFixed += processDirectory(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      if (addJsExtensions(fullPath)) {
        totalFixed++;
      }
    }
  }
  
  return totalFixed;
}

console.log('Adding .js extensions to imports...\n');

try {
  const fixed = processDirectory(outDir);
  console.log(`\n✅ Done! Fixed ${fixed} file(s).`);
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
