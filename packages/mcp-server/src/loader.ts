// loader.ts — YAML 数据加载与 Zod 验证
// 负责从 /data/ 目录读取所有 YAML 文件并构建内存索引

import { existsSync, readFileSync, readdirSync } from 'fs';
import { basename, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';
import { z } from 'zod';
import type { ServiceRecord, Category } from './types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Zod Schema — 对应 _schema.yaml 中的 14 字段数据契约
const ServiceRecordSchema = z.object({
    name: z.string().min(1),
    category: z.enum([
        'email', 'payment', 'auth', 'database', 'ai-llm',
        'file-storage', 'search', 'analytics', 'logging',
        'queue', 'cdn', 'notification',
    ]),
    tags: z.array(z.string()).default([]),
    pricing_tier: z.enum(['free', 'freemium', 'paid', 'enterprise']),
    free_tier: z.string().nullable(),
    ai_friendliness: z.number().int().min(1).max(5),
    dx_score: z.number().int().min(1).max(5),
    official_docs: z.string().url(),
    mcp_available: z.boolean(),
    mcp_url: z.string().url().nullable(),
    quick_install: z.string(),
    best_for: z.array(z.string()).default([]),
    not_for: z.array(z.string()).default([]),
    last_verified: z.string().regex(/^\d{4}-\d{2}$/),
});

const ServiceYamlFileSchema = z.object({
    services: z.array(ServiceRecordSchema).default([]),
});

// 全局数据存储
let _serviceMap: Map<string, ServiceRecord> | null = null;
let _categoryMap: Map<Category, ServiceRecord[]> | null = null;

/**
 * 获取数据目录路径
 * 支持本地开发环境（monorepo）和 npm 发布后的路径
 */
function getDataDir(): string {
    const envPath = process.env.SERVICE_ADVISOR_DATA_DIR;
    if (envPath && existsSync(envPath)) {
        return envPath;
    }

    const candidates = [
        join(__dirname, '..', 'data'), // npm 包内置数据目录
        join(__dirname, '..', '..', '..', '..', 'data'), // monorepo 开发路径
        join(process.cwd(), 'data'), // 从仓库根目录直接运行
    ];

    for (const candidate of candidates) {
        if (existsSync(candidate)) {
            return candidate;
        }
    }

    throw new Error(
        `未找到 data 目录。可通过 SERVICE_ADVISOR_DATA_DIR 指定路径。已尝试: ${candidates.join(', ')}`
    );
}

function formatZodError(error: z.ZodError): string {
    return error.issues
        .map((issue) => `${issue.path.join('.') || '<root>'}: ${issue.message}`)
        .join('; ');
}

/**
 * 加载所有 YAML 数据文件并验证
 * 首次调用时执行，结果缓存到内存
 */
export function loadData(): {
    serviceMap: Map<string, ServiceRecord>;
    categoryMap: Map<Category, ServiceRecord[]>;
} {
    if (_serviceMap && _categoryMap) {
        return { serviceMap: _serviceMap, categoryMap: _categoryMap };
    }

    const dataDir = getDataDir();
    const serviceMap = new Map<string, ServiceRecord>();
    const categoryMap = new Map<Category, ServiceRecord[]>();

    const yamlFiles = readdirSync(dataDir)
        .filter((name) => name.endsWith('.yaml') && name !== '_schema.yaml')
        .sort();

    for (const fileName of yamlFiles) {
        const filePath = join(dataDir, fileName);
        const expectedCategory = basename(fileName, '.yaml');
        const raw = readFileSync(filePath, 'utf8');
        const parsed = yaml.load(raw);
        const result = ServiceYamlFileSchema.safeParse(parsed);

        if (!result.success) {
            throw new Error(`[${fileName}] 数据结构校验失败: ${formatZodError(result.error)}`);
        }

        for (const service of result.data.services) {
            if (service.category !== expectedCategory) {
                throw new Error(
                    `[${fileName}] 服务 "${service.name}" 的 category 与文件名不一致：期望 "${expectedCategory}"，实际 "${service.category}"`
                );
            }

            const key = service.name.trim().toLowerCase();
            if (serviceMap.has(key)) {
                throw new Error(`[${fileName}] 检测到重复服务名（忽略大小写）: "${service.name}"`);
            }

            serviceMap.set(key, service);

            const bucket = categoryMap.get(service.category) ?? [];
            bucket.push(service);
            categoryMap.set(service.category, bucket);
        }
    }

    _serviceMap = serviceMap;
    _categoryMap = categoryMap;

    return { serviceMap, categoryMap };
}

/**
 * 清除缓存（用于测试）
 */
export function clearCache(): void {
    _serviceMap = null;
    _categoryMap = null;
}
