// index.ts — MCP Server 入口
// 注册三个核心工具：recommend_services / get_service_detail / list_categories

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';
import { recommend, getDetail, listCategories } from './recommender.js';

function resolveServerVersion(): string {
    try {
        const currentDir = dirname(fileURLToPath(import.meta.url));
        const packageJsonPath = join(currentDir, '..', 'package.json');
        const raw = readFileSync(packageJsonPath, 'utf8');
        const parsed = JSON.parse(raw) as { version?: string };
        if (typeof parsed.version === 'string' && parsed.version.trim().length > 0) {
            return parsed.version;
        }
    } catch {
        // ignore and fallback to static version
    }
    return '0.1.2';
}

const server = new McpServer({
    name: 'service-advisor',
    version: resolveServerVersion(),
});

// ============================================================
// Tool 1: recommend_services
// 输入：自然语言产品需求描述
// 输出：按场景分组的 Top Pick 推荐列表
// ============================================================
server.tool(
    'recommend_services',
    {
        description: z
            .string()
            .describe('Natural language description of your product or service needs'),
        limit: z
            .number()
            .optional()
            .default(5)
            .describe('Maximum number of alternatives per category (default: 5)'),
    },
    async ({ description, limit }) => ({
        content: [
            {
                type: 'text',
                text: JSON.stringify(recommend(description, limit), null, 2),
            },
        ],
    })
);

// ============================================================
// Tool 2: get_service_detail
// 输入：服务名称（如 "Resend"、"Stripe"）
// 输出：该服务的完整 14 字段记录
// ============================================================
server.tool(
    'get_service_detail',
    {
        service_name: z
            .string()
            .describe('Name of the service to look up (e.g., "Resend", "Stripe", "Clerk")'),
    },
    async ({ service_name }) => {
        const detail = getDetail(service_name);
        if (!detail) {
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            error: `Service "${service_name}" not found in the database.`,
                            suggestion: 'Use list_categories to browse available services.',
                        }),
                    },
                ],
            };
        }
        return {
            content: [{ type: 'text', text: JSON.stringify(detail, null, 2) }],
        };
    }
);

// ============================================================
// Tool 3: list_categories
// 输入：无
// 输出：所有已收录的场景分类列表
// ============================================================
server.tool('list_categories', {}, async () => ({
    content: [
        {
            type: 'text',
            text: JSON.stringify(listCategories(), null, 2),
        },
    ],
}));

// ============================================================
// 启动 MCP Server（stdio 传输，本地模式）
// ============================================================
const transport = new StdioServerTransport();
await server.connect(transport);
