// types.ts — ServiceAdvisor MCP TypeScript 类型定义
// 对应 data/_schema.yaml 中的 14 字段数据契约

export type PricingTier = 'free' | 'freemium' | 'paid' | 'enterprise';

export type Category =
    | 'email'
    | 'payment'
    | 'auth'
    | 'database'
    | 'ai-llm'
    | 'file-storage'
    | 'search'
    | 'analytics'
    | 'logging'
    | 'queue'
    | 'cdn'
    | 'notification';

/**
 * 单条服务记录，对应 YAML 中的每个服务条目
 * 共 14 个字段，全部必填（null 表示无值）
 */
export interface ServiceRecord {
    /** 服务名称，唯一标识符 */
    name: string;
    /** 主场景分类 */
    category: Category;
    /** 补充标签，如 free-tier, open-source, self-hostable */
    tags: string[];
    /** 定价档位 */
    pricing_tier: PricingTier;
    /** 免费额度描述，无则为 null */
    free_tier: string | null;
    /** AI 友好度评分：1-5（文档质量 + SDK 完整度 + MCP 支持） */
    ai_friendliness: number;
    /** 开发者体验评分：1-5（接入难度、文档、社区支持） */
    dx_score: number;
    /** 官方文档 URL */
    official_docs: string;
    /** 是否有官方或社区 MCP Server */
    mcp_available: boolean;
    /** MCP Server 地址，无则为 null */
    mcp_url: string | null;
    /** 安装命令，如 "npm install resend" */
    quick_install: string;
    /** 推荐使用场景标签 */
    best_for: string[];
    /** 明确不适合的场景 */
    not_for: string[];
    /** 最后人工验证日期，格式 YYYY-MM */
    last_verified: string;
}

/**
 * YAML 文件结构
 */
export interface ServiceYamlFile {
    services: ServiceRecord[];
}

/**
 * recommend_services 工具单条推荐结果
 */
export interface RecommendationItem {
    category: Category;
    top_pick: string;
    reason: string;
    pricing_tier: PricingTier;
    free_tier: string | null;
    ai_friendliness: number;
    official_docs: string;
    quick_install: string;
    mcp_available: boolean;
    alternatives: string[];
}

/**
 * recommend_services 工具返回值
 */
export interface RecommendationResult {
    query: string;
    detected_categories: Category[];
    recommendations: RecommendationItem[];
}
