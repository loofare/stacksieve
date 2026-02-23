#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const yaml = require('js-yaml');

const DATA_DIR = path.join(process.cwd(), 'data');
const TIMEOUT_MS = 15000;

function loadUrls() {
  const files = fs
    .readdirSync(DATA_DIR)
    .filter((name) => name.endsWith('.yaml') && name !== '_schema.yaml')
    .sort();

  const urls = [];

  for (const fileName of files) {
    const filePath = path.join(DATA_DIR, fileName);
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = yaml.load(raw);
    const services = Array.isArray(parsed?.services) ? parsed.services : [];

    for (const service of services) {
      if (typeof service?.official_docs === 'string') {
        urls.push({
          url: service.official_docs,
          source: `${fileName}:${service.name}:official_docs`,
        });
      }

      if (typeof service?.mcp_url === 'string') {
        urls.push({
          url: service.mcp_url,
          source: `${fileName}:${service.name}:mcp_url`,
        });
      }
    }
  }

  return urls;
}

async function probeUrl(url, method) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method,
      redirect: 'follow',
      signal: controller.signal,
      headers: method === 'GET' ? { Range: 'bytes=0-0' } : undefined,
    });

    return {
      ok: response.status >= 200 && response.status < 400,
      status: response.status,
    };
  } finally {
    clearTimeout(timer);
  }
}

async function checkOne(url) {
  try {
    const head = await probeUrl(url, 'HEAD');

    if (head.ok) {
      return { ok: true, status: head.status };
    }

    if (head.status === 405 || head.status === 403) {
      const get = await probeUrl(url, 'GET');
      return { ok: get.ok, status: get.status };
    }

    return { ok: false, status: head.status };
  } catch (error) {
    return {
      ok: false,
      status: 'ERR',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function main() {
  if (!fs.existsSync(DATA_DIR)) {
    console.error(`❌ data 目录不存在: ${DATA_DIR}`);
    process.exit(1);
  }

  const items = loadUrls();
  const unique = new Map();

  for (const item of items) {
    if (!unique.has(item.url)) {
      unique.set(item.url, [item.source]);
    } else {
      unique.get(item.url).push(item.source);
    }
  }

  const failures = [];
  let successCount = 0;

  for (const [url, sources] of unique.entries()) {
    const result = await checkOne(url);

    if (result.ok) {
      successCount += 1;
      continue;
    }

    failures.push({
      url,
      sources,
      status: result.status,
      error: result.error || '',
    });
  }

  if (failures.length > 0) {
    console.error('❌ 链接检查失败：');
    for (const item of failures) {
      console.error(`- [${item.status}] ${item.url}`);
      console.error(`  来源: ${item.sources.join(', ')}`);
      if (item.error) {
        console.error(`  错误: ${item.error}`);
      }
    }
    process.exit(1);
  }

  console.log(`✅ 链接检查通过：${successCount} 个唯一 URL`);
}

main();
