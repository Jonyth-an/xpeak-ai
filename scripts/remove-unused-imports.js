#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all TypeScript/JavaScript files
const files = glob.sync('app/**/*.{ts,tsx}');

console.log('🔍 Analyzing files for potential unused imports...\n');

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  
  // Find import statements
  const imports = lines.filter(line => 
    line.trim().startsWith('import ') && 
    !line.includes('dynamic') &&
    !line.includes('from "next/dynamic"')
  );
  
  if (imports.length > 0) {
    console.log(`📁 ${file}:`);
    imports.forEach(imp => {
      console.log(`  ${imp.trim()}`);
    });
    console.log('');
  }
});

console.log('💡 Manual review needed for unused imports.');
console.log('🔧 Consider using ESLint with @typescript-eslint/no-unused-vars rule.'); 