#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const packageRoot = path.resolve(__dirname, '..');
const sourceDir = path.resolve(packageRoot, '..', '..', 'data');
const targetDir = path.resolve(packageRoot, 'data');

if (!fs.existsSync(sourceDir)) {
  console.error(`❌ 数据源目录不存在: ${sourceDir}`);
  process.exit(1);
}

fs.rmSync(targetDir, { recursive: true, force: true });
fs.mkdirSync(targetDir, { recursive: true });

const files = fs
  .readdirSync(sourceDir)
  .filter((name) => name.endsWith('.yaml'))
  .sort();

for (const file of files) {
  fs.copyFileSync(path.join(sourceDir, file), path.join(targetDir, file));
}

console.log(`✅ 已同步数据文件: ${files.length} 个 -> ${targetDir}`);
