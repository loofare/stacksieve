#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const yaml = require('js-yaml');
const { z } = require('zod');

const CATEGORY_VALUES = [
  'email',
  'payment',
  'auth',
  'database',
  'ai-llm',
  'file-storage',
  'search',
  'analytics',
  'logging',
  'queue',
  'cdn',
  'notification',
];

const ServiceRecordSchema = z.object({
  name: z.string().min(1),
  category: z.enum(CATEGORY_VALUES),
  tags: z.array(z.string()),
  pricing_tier: z.enum(['free', 'freemium', 'paid', 'enterprise']),
  free_tier: z.string().nullable(),
  ai_friendliness: z.number().int().min(1).max(5),
  dx_score: z.number().int().min(1).max(5),
  official_docs: z.string().url(),
  mcp_available: z.boolean(),
  mcp_url: z.string().url().nullable(),
  quick_install: z.string().min(1),
  best_for: z.array(z.string()),
  not_for: z.array(z.string()),
  last_verified: z.string().regex(/^\d{4}-\d{2}$/),
});

const ServiceYamlFileSchema = z.object({
  services: z.array(ServiceRecordSchema),
});

const DATA_DIR = path.join(process.cwd(), 'data');

function formatZodIssues(issues) {
  return issues.map((issue) => `${issue.path.join('.') || '<root>'}: ${issue.message}`).join('; ');
}

function main() {
  if (!fs.existsSync(DATA_DIR)) {
    console.error(`❌ data 目录不存在: ${DATA_DIR}`);
    process.exit(1);
  }

  const files = fs
    .readdirSync(DATA_DIR)
    .filter((name) => name.endsWith('.yaml') && name !== '_schema.yaml')
    .sort();

  if (files.length === 0) {
    console.error('❌ 未找到任何数据文件');
    process.exit(1);
  }

  const errors = [];
  const serviceNameIndex = new Map();
  let total = 0;

  for (const fileName of files) {
    const filePath = path.join(DATA_DIR, fileName);
    const expectedCategory = fileName.replace('.yaml', '');

    try {
      const raw = fs.readFileSync(filePath, 'utf8');
      const parsed = yaml.load(raw);
      const result = ServiceYamlFileSchema.safeParse(parsed);

      if (!result.success) {
        errors.push(`[${fileName}] schema 校验失败: ${formatZodIssues(result.error.issues)}`);
        continue;
      }

      for (const record of result.data.services) {
        total += 1;

        if (record.category !== expectedCategory) {
          errors.push(
            `[${fileName}] 服务 "${record.name}" category 不匹配：期望 "${expectedCategory}"，实际 "${record.category}"`
          );
        }

        const nameKey = record.name.trim().toLowerCase();
        if (serviceNameIndex.has(nameKey)) {
          errors.push(
            `[${fileName}] 服务 "${record.name}" 与 [${serviceNameIndex.get(nameKey)}] 重名（忽略大小写）`
          );
        } else {
          serviceNameIndex.set(nameKey, fileName);
        }
      }
    } catch (error) {
      errors.push(`[${fileName}] 解析失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  if (errors.length > 0) {
    console.error('❌ 数据校验失败：');
    for (const item of errors) {
      console.error(`- ${item}`);
    }
    process.exit(1);
  }

  console.log(`✅ 数据校验通过：${files.length} 个文件，${total} 条服务记录`);
}

main();
