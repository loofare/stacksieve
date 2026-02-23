// recommender.ts — 推荐核心逻辑
// 负责：需求解析（自然语言 → 场景标签）+ 推荐排序 + 输出格式化

import { loadData } from './loader.js';
import type { Category, RecommendationItem, RecommendationResult, ServiceRecord } from './types.js';

// ============================================================
// 关键词到场景分类的映射表（规则引擎 MVP，无需调用 LLM）
// ============================================================
const CATEGORY_KEYWORDS: Record<Category, string[]> = {
    email: ['email', 'mail', 'smtp', '邮件', '邮箱', 'transactional', 'newsletter'],
    payment: ['payment', 'pay', 'stripe', 'billing', 'subscription', '支付', '订阅', '结算'],
    auth: ['auth', 'login', 'signin', 'oauth', 'jwt', 'sso', '认证', '登录', '身份'],
    database: ['database', 'db', 'sql', 'postgres', 'mysql', 'nosql', '数据库', '存储'],
    'ai-llm': ['ai', 'llm', 'gpt', 'claude', 'openai', 'anthropic', 'text generation', '大模型', 'AI', '人工智能'],
    'file-storage': ['storage', 'upload', 'file', 's3', 'object storage', '文件', '上传', '存储桶'],
    search: ['search', 'fulltext', 'algolia', 'elasticsearch', '搜索', '全文检索'],
    analytics: ['analytics', 'tracking', 'event', 'metrics', '分析', '埋点', '统计'],
    logging: ['log', 'logging', 'monitor', 'error tracking', '日志', '监控', '错误'],
    queue: ['queue', 'job', 'background', 'cron', 'task', '队列', '任务', '后台任务'],
    cdn: ['cdn', 'edge', 'cache', 'static', '内容分发', '边缘', '缓存'],
    notification: ['notification', 'push', 'sms', 'alert', '通知', '推送', '短信'],
};

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
    const pricingBonus = service.pricing_tier === 'free' ? 1.0
        : service.pricing_tier === 'freemium' ? 0.8
            : service.pricing_tier === 'paid' ? 0.4
                : 0.2; // enterprise

    return (
        service.ai_friendliness * 0.4 +
        service.dx_score * 0.4 +
        pricingBonus * 5 * 0.2
    );
}

/**
 * recommend_services 核心逻辑
 * @param description 自然语言产品需求描述
 * @param limit 每个场景返回的推荐数量（默认 5）
 */
export function recommend(description: string, limit = 5): RecommendationResult {
    const { categoryMap } = loadData();
    const detected = detectCategories(description);

    const recommendations: RecommendationItem[] = [];

    for (const category of detected) {
        const services = categoryMap.get(category) ?? [];
        if (services.length === 0) continue;

        // 按评分排序
        const sorted = [...services].sort((a, b) => scoreService(b) - scoreService(a));
        const topPick = sorted[0];
        const alternatives = sorted.slice(1, limit).map((s) => s.name);

        recommendations.push({
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
        });
    }

    return {
        query: description,
        detected_categories: detected,
        recommendations,
    };
}

/**
 * get_service_detail 核心逻辑
 */
export function getDetail(serviceName: string): ServiceRecord | null {
    const { serviceMap } = loadData();
    return serviceMap.get(serviceName.toLowerCase()) ?? null;
}

/**
 * list_categories 核心逻辑
 */
export function listCategories(): { categories: Category[]; count: number } {
    const { categoryMap } = loadData();
    const categories = Array.from(categoryMap.keys());
    return { categories, count: categories.length };
}
