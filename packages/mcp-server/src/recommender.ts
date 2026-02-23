// recommender.ts — 推荐核心逻辑
// 负责：需求解析（自然语言 → 场景标签）+ 推荐排序 + 输出格式化

import { loadData } from './loader.js';
import type { Category, RecommendationItem, RecommendationResult, ServiceRecord } from './types.js';

const CATEGORY_KEYWORDS: Record<Category, string[]> = {
    email: ['email', 'mail', 'smtp', '邮件', '邮箱', 'transactional', 'newsletter'],
    payment: ['payment', 'pay', 'stripe', 'billing', 'subscription', '支付', '订阅', '结算'],
    auth: ['auth', 'login', 'signin', 'oauth', 'jwt', 'sso', '认证', '登录', '身份'],
    database: ['database', 'db', 'sql', 'postgres', 'mysql', 'nosql', '数据库'],
    'ai-llm': ['ai', 'llm', 'gpt', 'claude', 'openai', 'anthropic', 'text generation', '大模型', '人工智能'],
    'file-storage': ['storage', 'upload', 'file', 's3', 'object storage', '文件', '上传', '存储桶'],
    search: ['search', 'fulltext', 'algolia', 'elasticsearch', '搜索', '检索'],
    analytics: ['analytics', 'tracking', 'event', 'metrics', '分析', '埋点', '统计'],
    logging: ['log', 'logging', 'monitor', 'error tracking', '日志', '监控', '错误'],
    queue: ['queue', 'job', 'background', 'cron', 'task', '队列', '任务', '后台任务'],
    cdn: ['cdn', 'edge', 'cache', 'static', '内容分发', '边缘', '缓存'],
    notification: ['notification', 'push', 'sms', 'alert', '通知', '推送', '短信'],
};

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
    const lower = description.toLowerCase();
    const detected: Category[] = [];

    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS) as [Category, string[]][]) {
        if (keywords.some((kw) => lower.includes(kw.toLowerCase()))) {
            detected.push(category);
        }
    }

    return detected;
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
