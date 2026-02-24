// recommender.ts — 推荐核心逻辑
// 负责：需求解析（自然语言 → 场景标签）+ 推荐排序 + 输出格式化

import { loadData } from './loader.js';
import type { Category, RecommendationItem, RecommendationResult, ServiceRecord } from './types.js';

type KeywordRule = { term: string; weight: number };

const CATEGORY_KEYWORDS: Record<Category, KeywordRule[]> = {
    email: [
        { term: 'email', weight: 1.2 },
        { term: 'mail', weight: 1.0 },
        { term: 'smtp', weight: 1.2 },
        { term: 'transactional', weight: 1.0 },
        { term: 'newsletter', weight: 1.0 },
        { term: '邮件', weight: 1.2 },
        { term: '邮箱', weight: 1.0 },
    ],
    payment: [
        { term: 'payment', weight: 1.2 },
        { term: 'pay', weight: 1.0 },
        { term: 'billing', weight: 1.1 },
        { term: 'subscription', weight: 1.0 },
        { term: 'checkout', weight: 1.0 },
        { term: '支付', weight: 1.2 },
        { term: '订阅', weight: 1.0 },
        { term: '结算', weight: 1.0 },
    ],
    auth: [
        { term: 'auth', weight: 1.2 },
        { term: 'login', weight: 1.1 },
        { term: 'signin', weight: 1.1 },
        { term: 'oauth', weight: 1.2 },
        { term: 'jwt', weight: 1.0 },
        { term: 'sso', weight: 1.2 },
        { term: '认证', weight: 1.2 },
        { term: '登录', weight: 1.1 },
        { term: '身份', weight: 0.8 },
    ],
    database: [
        { term: 'database', weight: 1.2 },
        { term: 'db', weight: 1.0 },
        { term: 'sql', weight: 1.0 },
        { term: 'postgres', weight: 1.0 },
        { term: 'mysql', weight: 1.0 },
        { term: 'nosql', weight: 1.0 },
        { term: '数据库', weight: 1.2 },
    ],
    'ai-llm': [
        { term: 'ai', weight: 0.9 },
        { term: 'llm', weight: 1.2 },
        { term: 'gpt', weight: 1.2 },
        { term: 'claude', weight: 1.2 },
        { term: 'openai', weight: 1.2 },
        { term: 'anthropic', weight: 1.2 },
        { term: 'text generation', weight: 1.0 },
        { term: '大模型', weight: 1.2 },
        { term: '人工智能', weight: 1.1 },
    ],
    'file-storage': [
        { term: 'storage', weight: 1.0 },
        { term: 'upload', weight: 1.0 },
        { term: 'file', weight: 1.0 },
        { term: 'blob', weight: 1.0 },
        { term: 's3', weight: 1.0 },
        { term: 'object storage', weight: 1.2 },
        { term: 'oss', weight: 1.0 },
        { term: '文件', weight: 1.0 },
        { term: '上传', weight: 1.0 },
        { term: '图片', weight: 1.1 },
        { term: '图像', weight: 1.1 },
        { term: '照片', weight: 1.1 },
        { term: '对象存储', weight: 1.2 },
        { term: '文件存储', weight: 1.2 },
        { term: '存储桶', weight: 1.0 },
        { term: '存储', weight: 0.6 },
    ],
    search: [
        { term: 'search', weight: 1.2 },
        { term: 'fulltext', weight: 1.0 },
        { term: 'elasticsearch', weight: 1.0 },
        { term: 'algolia', weight: 1.0 },
        { term: '搜索', weight: 1.2 },
        { term: '检索', weight: 1.0 },
    ],
    analytics: [
        { term: 'analytics', weight: 1.2 },
        { term: 'tracking', weight: 1.0 },
        { term: 'event', weight: 1.0 },
        { term: 'metrics', weight: 1.0 },
        { term: '分析', weight: 1.2 },
        { term: '埋点', weight: 1.0 },
        { term: '统计', weight: 1.0 },
    ],
    logging: [
        { term: 'log', weight: 1.0 },
        { term: 'logging', weight: 1.2 },
        { term: 'monitor', weight: 1.0 },
        { term: 'error tracking', weight: 1.0 },
        { term: '日志', weight: 1.2 },
        { term: '监控', weight: 1.0 },
        { term: '错误', weight: 0.8 },
    ],
    queue: [
        { term: 'queue', weight: 1.2 },
        { term: 'job', weight: 1.0 },
        { term: 'background', weight: 1.0 },
        { term: 'cron', weight: 1.0 },
        { term: 'task', weight: 1.0 },
        { term: '队列', weight: 1.2 },
        { term: '任务', weight: 1.0 },
        { term: '后台任务', weight: 1.1 },
    ],
    cdn: [
        { term: 'cdn', weight: 1.2 },
        { term: 'edge', weight: 1.0 },
        { term: 'cache', weight: 1.0 },
        { term: 'static', weight: 1.0 },
        { term: '内容分发', weight: 1.2 },
        { term: '边缘', weight: 1.0 },
        { term: '缓存', weight: 0.9 },
        { term: '图片加速', weight: 1.1 },
    ],
    notification: [
        { term: 'notification', weight: 1.2 },
        { term: 'push', weight: 1.0 },
        { term: 'sms', weight: 1.0 },
        { term: 'alert', weight: 1.0 },
        { term: '通知', weight: 1.2 },
        { term: '推送', weight: 1.0 },
        { term: '短信', weight: 1.0 },
    ],
};

const CATEGORY_INTENT_PATTERNS: Array<{ category: Category; pattern: RegExp; weight: number }> = [
    { category: 'file-storage', pattern: /(图片|图像|照片|头像|文件).{0,6}(存储|上传)/, weight: 2.0 },
    { category: 'file-storage', pattern: /(object ?storage|blob|oss|s3)/, weight: 1.6 },
    { category: 'cdn', pattern: /(图片|静态资源).{0,6}(加速|cdn|分发)/, weight: 1.4 },
    { category: 'payment', pattern: /(支付|收款|订阅|billing|checkout)/, weight: 1.5 },
    { category: 'auth', pattern: /(登录|注册|认证|鉴权|sso|oauth)/, weight: 1.5 },
];

const MIN_CATEGORY_SCORE = 1.0;

function normalizeText(input: string): string {
    return input
        .toLowerCase()
        .replace(/[_-]+/g, ' ')
        .replace(/[^a-z0-9\u3400-\u9fff]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function escapeRegExp(input: string): string {
    return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isChineseText(input: string): boolean {
    return /[\u3400-\u9fff]/.test(input);
}

function containsKeyword(normalizedText: string, keyword: string): boolean {
    const normalizedKeyword = normalizeText(keyword);
    if (!normalizedKeyword) {
        return false;
    }

    if (isChineseText(normalizedKeyword)) {
        return normalizedText.includes(normalizedKeyword);
    }

    if (normalizedKeyword.includes(' ')) {
        return normalizedText.includes(normalizedKeyword);
    }

    const pattern = new RegExp(`(^|[^a-z0-9])${escapeRegExp(normalizedKeyword)}([^a-z0-9]|$)`);
    return pattern.test(` ${normalizedText} `);
}

function clampLimit(limit: number): number {
    if (!Number.isFinite(limit)) {
        return 5;
    }
    const intLimit = Math.floor(limit);
    return Math.max(1, Math.min(intLimit, 10));
}

/**
 * 从自然语言描述中提取匹配的场景分类
 */
export function detectCategories(description: string): Category[] {
    const normalized = normalizeText(description);
    if (!normalized) {
        return [];
    }

    const scores = new Map<Category, number>();

    for (const [category, rules] of Object.entries(CATEGORY_KEYWORDS) as [Category, KeywordRule[]][]) {
        let score = 0;
        for (const rule of rules) {
            if (containsKeyword(normalized, rule.term)) {
                score += rule.weight;
            }
        }
        if (score > 0) {
            scores.set(category, score);
        }
    }

    for (const rule of CATEGORY_INTENT_PATTERNS) {
        if (rule.pattern.test(normalized)) {
            scores.set(rule.category, (scores.get(rule.category) ?? 0) + rule.weight);
        }
    }

    return Array.from(scores.entries())
        .filter(([, score]) => score >= MIN_CATEGORY_SCORE)
        .sort((a, b) => b[1] - a[1])
        .map(([category]) => category);
}

/**
 * 对同一场景的服务进行评分排序
 * 评分维度：ai_friendliness × 0.4 + dx_score × 0.4 + pricing_bonus × 0.2
 */
function scoreService(service: ServiceRecord): number {
    const pricingBonus = service.pricing_tier === 'free'
        ? 1.0
        : service.pricing_tier === 'freemium'
            ? 0.8
            : service.pricing_tier === 'paid'
                ? 0.4
                : 0.2;

    return service.ai_friendliness * 0.4 + service.dx_score * 0.4 + pricingBonus * 5 * 0.2;
}

function sortServices(services: ServiceRecord[]): ServiceRecord[] {
    return [...services].sort((a, b) => scoreService(b) - scoreService(a));
}

function buildCategoryRecommendation(category: Category, services: ServiceRecord[], limit: number): RecommendationItem | null {
    if (services.length === 0) {
        return null;
    }

    const sorted = sortServices(services);
    const topPick = sorted[0];
    const alternatives = sorted.slice(1, limit).map((service) => service.name);

    return {
        category,
        top_pick: topPick.name,
        reason: topPick.best_for.join('、') || '推荐首选',
        pricing_tier: topPick.pricing_tier,
        free_tier: topPick.free_tier,
        ai_friendliness: topPick.ai_friendliness,
        official_docs: topPick.official_docs,
        quick_install: topPick.quick_install,
        mcp_available: topPick.mcp_available,
        alternatives,
    };
}

function fallbackCategories(limit = 3): Category[] {
    const { categoryMap } = loadData();

    return Array.from(categoryMap.entries())
        .sort((a, b) => {
            const scoreA = a[1].length === 0 ? 0 : a[1].reduce((sum, service) => sum + scoreService(service), 0) / a[1].length;
            const scoreB = b[1].length === 0 ? 0 : b[1].reduce((sum, service) => sum + scoreService(service), 0) / b[1].length;
            return scoreB - scoreA;
        })
        .slice(0, limit)
        .map(([category]) => category);
}

/**
 * 按指定分类返回推荐结果
 */
export function recommendByCategories(categories: Category[], limit = 5, query = ''): RecommendationResult {
    const { categoryMap } = loadData();
    const safeLimit = clampLimit(limit);
    const recommendations: RecommendationItem[] = [];

    for (const category of categories) {
        const item = buildCategoryRecommendation(category, categoryMap.get(category) ?? [], safeLimit);
        if (item) {
            recommendations.push(item);
        }
    }

    return {
        query,
        detected_categories: categories,
        recommendations,
    };
}

/**
 * recommend_services 核心逻辑
 * 无法识别用户输入时，回退为 Top 分类推荐
 */
export function recommend(description: string, limit = 5): RecommendationResult {
    const detected = detectCategories(description);
    const categories = detected.length > 0 ? detected : fallbackCategories(3);

    return recommendByCategories(categories, limit, description);
}

/**
 * get_service_detail 核心逻辑
 */
export function getDetail(serviceName: string): ServiceRecord | null {
    const { serviceMap } = loadData();
    return serviceMap.get(serviceName.trim().toLowerCase()) ?? null;
}

/**
 * list_categories 核心逻辑
 */
export function listCategories(): { categories: Category[]; count: number } {
    const { categoryMap } = loadData();
    const categories = Array.from(categoryMap.keys()).sort();
    return { categories, count: categories.length };
}
