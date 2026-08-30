/**
 * @file scripts/strip-bom.js
 * @description Utility script to detect and strip UTF-8 Byte Order Marks (BOM: \xEF\xBB\xBF)
 * from configuration and source files. Prevents TOML/JSON parsing failures during Netlify
 * builds and Linux CI runs.
 *
 * @usage
 *   node scripts/strip-bom.js [filePath1] [filePath2] ...
 *   If no arguments are provided, it automatically audits key config files.
 *
 * @author Fotis Pastrakis <https://fotisp.gr>
 * @license MIT
 */

import fs from 'fs';
import path from 'path';

const DEFAULT_TARGETS = [
  'netlify.toml',
  'package.json',
  'tsconfig.json',
  'docker-compose.yml',
  'vite.config.js',
  '.oxlintrc.json'
];

function stripBomFromFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const buffer = fs.readFileSync(filePath);
  // Check for UTF-8 BOM: 0xEF, 0xBB, 0xBF
  if (buffer.length >= 3 && buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
    const strippedBuffer = buffer.subarray(3);
    fs.writeFileSync(filePath, strippedBuffer);
    console.log(`[BOM STRIPPED] Successfully removed UTF-8 BOM from: ${filePath}`);
  } else {
    // console.log(`[CLEAN] No BOM detected in: ${filePath}`);
  }
}

const targets = process.argv.slice(2).length > 0 ? process.argv.slice(2) : DEFAULT_TARGETS;

console.log('Auditing files for UTF-8 Byte Order Marks (BOM)...');
for (const target of targets) {
  stripBomFromFile(target);
}
console.log('BOM audit complete.');
