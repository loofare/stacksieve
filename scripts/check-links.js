#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const yaml = require('js-yaml');

const DATA_DIR = path.join(process.cwd(), 'data');
const TIMEOUT_MS = Number.parseInt(process.env.LINK_CHECK_TIMEOUT_MS || '15000', 10);
const CONCURRENCY = Number.parseInt(process.env.LINK_CHECK_CONCURRENCY || '8', 10);
const RETRIES = Number.parseInt(process.env.LINK_CHECK_RETRIES || '1', 10);

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
  let lastError = '';
  const maxAttempts = Math.max(1, RETRIES + 1);

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        method,
        redirect: 'follow',
        signal: controller.signal,
        headers: {
          'User-Agent': 'stacksieve-link-check/0.1',
          Accept: 'text/html,application/json;q=0.9,*/*;q=0.8',
        },
      });

      return {
        ok: response.status >= 200 && response.status < 400,
        status: response.status,
      };
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      if (attempt === maxAttempts) {
        return {
          ok: false,
          status: 'ERR',
          error: lastError,
        };
      }
    } finally {
      clearTimeout(timer);
    }
  }

  return {
    ok: false,
    status: 'ERR',
    error: lastError || 'unknown error',
  };
}

async function checkOne(url) {
  const head = await probeUrl(url, 'HEAD');

  if (head.ok) {
    return { ok: true, status: head.status };
  }

  if (
    head.status === 'ERR' ||
    head.status === 405 ||
    head.status === 403 ||
    head.status === 429 ||
    (typeof head.status === 'number' && head.status >= 500)
  ) {
    const get = await probeUrl(url, 'GET');
    return { ok: get.ok, status: get.status, error: get.error || head.error };
  }

  return { ok: false, status: head.status, error: head.error };
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
  const checks = Array.from(unique.entries());
  const total = checks.length;
  let nextIndex = 0;
  let completed = 0;
  const workerCount = Math.max(1, Math.min(CONCURRENCY, total || 1));

  console.log(`🔎 开始检查链接：${total} 个唯一 URL，并发=${workerCount}，超时=${TIMEOUT_MS}ms`);

  async function worker() {
    while (true) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      if (currentIndex >= total) {
        return;
      }

      const [url, sources] = checks[currentIndex];
      const result = await checkOne(url);

      if (result.ok) {
        successCount += 1;
      } else {
        failures.push({
          url,
          sources,
          status: result.status,
          error: result.error || '',
        });
      }

      completed += 1;
      if (completed % 10 === 0 || completed === total) {
        console.log(`...进度 ${completed}/${total}（成功 ${successCount}，失败 ${failures.length}）`);
      }
    }
  }

  const workers = Array.from({ length: workerCount }, () => worker());
  await Promise.all(workers);

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
