#!/usr/bin/env node
/**
 * Script to remove console.log and console.warn statements
 * while preserving console.error for production error tracking
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const srcDir = path.join(__dirname, 'packages/web/src');

// Find all TypeScript files
const files = glob.sync('**/*.{ts,tsx}', {
  cwd: srcDir,
  ignore: ['**/*.d.ts', '**/*.test.ts', '**/*.test.tsx', '**/*.backup.*']
});

let totalRemoved = 0;
let filesModified = 0;

files.forEach(file => {
  const filePath = path.join(srcDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  // Remove console.log statements (single line)
  content = content.replace(/^\s*console\.log\([\s\S]*?\);?\s*$/gm, '');

  // Remove console.warn statements (single line)
  content = content.replace(/^\s*console\.warn\([\s\S]*?\);?\s*$/gm, '');

  // Remove multiline console.log
  content = content.replace(/console\.log\([^)]*\([^)]*\)[^)]*\);?/g, '');

  // Remove multiline console.warn
  content = content.replace(/console\.warn\([^)]*\([^)]*\)[^)]*\);?/g, '');

  // Clean up extra blank lines (max 2 consecutive blank lines)
  content = content.replace(/\n\s*\n\s*\n\s*\n/g, '\n\n\n');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    const removedCount = (originalContent.match(/console\.(log|warn)/g) || []).length;
    totalRemoved += removedCount;
    filesModified++;
    console.log(`✅ ${file}: ${removedCount} console statements removed`);
  }
});

console.log(`\n📊 Summary:`);
console.log(`Files modified: ${filesModified}`);
console.log(`Total console.log/warn removed: ${totalRemoved}`);
