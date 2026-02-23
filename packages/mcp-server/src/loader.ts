// loader.ts — YAML 数据加载与 Zod 验证
// 负责从 /data/ 目录读取所有 YAML 文件，验证格式合规性

import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';
import { z } from 'zod';
import type { ServiceRecord, Category } from './types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Zod Schema — 对应 _schema.yaml 中的 12 字段数据契约
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
    // 相对于 dist/loader.js 的路径，向上到 monorepo 根目录再进入 data/
    return join(__dirname, '..', '..', '..', '..', 'data');
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

    // TODO: 实现文件加载逻辑
    // 1. 读取 dataDir 下所有 .yaml 文件（排除 _schema.yaml）
    // 2. 用 js-yaml 解析每个文件
    // 3. 用 Zod Schema 验证每条记录
    // 4. 填充 serviceMap（key: 小写服务名）和 categoryMap

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
