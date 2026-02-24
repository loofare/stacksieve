#!/usr/bin/env node
// index.ts — StackSieve CLI 入口

import { Command } from 'commander';
import chalk from 'chalk';
import Table from 'cli-table3';
import { getDetail, listCategories, recommend, recommendByCategories } from '@stacksievehq/mcp-server/recommender';
import type { Category, RecommendationResult, ServiceRecord } from '@stacksievehq/mcp-server/types';

type OutputFormat = 'table' | 'json';

function toOutputFormat(input: string): OutputFormat {
    if (input === 'json' || input === 'table') {
        return input;
    }
    throw new Error(`不支持的输出格式: ${input}，可选值为 table/json`);
}

function printAsJson(data: unknown): void {
    console.log(JSON.stringify(data, null, 2));
}

function printRecommendationTable(result: RecommendationResult): void {
    const table = new Table({
        head: ['Category', 'Top Pick', 'Reason', 'Free Tier', 'Docs'],
        wordWrap: true,
        colWidths: [16, 22, 36, 24, 42],
    });

    for (const item of result.recommendations) {
        table.push([
            item.category,
            item.top_pick,
            item.reason,
            item.free_tier ?? 'N/A',
            item.official_docs,
        ]);
    }

    console.log(chalk.bold('\nStackSieve Recommendations\n'));
    console.log(table.toString());
}

function printServiceDetailTable(detail: ServiceRecord): void {
    const table = new Table({
        colWidths: [20, 80],
        wordWrap: true,
    });

    table.push(
        ['name', detail.name],
        ['category', detail.category],
        ['tags', detail.tags.join(', ')],
        ['pricing_tier', detail.pricing_tier],
        ['free_tier', detail.free_tier ?? 'N/A'],
        ['ai_friendliness', String(detail.ai_friendliness)],
        ['dx_score', String(detail.dx_score)],
        ['official_docs', detail.official_docs],
        ['mcp_available', String(detail.mcp_available)],
        ['mcp_url', detail.mcp_url ?? 'N/A'],
        ['quick_install', detail.quick_install],
        ['best_for', detail.best_for.join(', ')],
        ['not_for', detail.not_for.join(', ')],
        ['last_verified', detail.last_verified]
    );

    console.log(chalk.bold(`\nService Detail: ${detail.name}\n`));
    console.log(table.toString());
}

function printCategories(format: OutputFormat): void {
    const result = listCategories();

    if (format === 'json') {
        printAsJson(result);
        return;
    }

    console.log(chalk.bold('\nAvailable Categories\n'));
    result.categories.forEach((category) => console.log(chalk.green(`- ${category}`)));
}

function fail(message: string): never {
    console.error(chalk.red(`❌ ${message}`));
    process.exit(1);
}

function resolveFormatFromActionArgs(args: unknown[]): OutputFormat {
    for (let i = 0; i < process.argv.length; i += 1) {
        const token = process.argv[i];
        if ((token === '--format' || token === '-f') && process.argv[i + 1]) {
            return toOutputFormat(process.argv[i + 1]);
        }
    }

    for (let i = args.length - 1; i >= 0; i -= 1) {
        const item = args[i] as Partial<Command> & { format?: string } | undefined;

        if (item && typeof item === 'object' && typeof item.format === 'string') {
            return toOutputFormat(item.format);
        }

        if (item && typeof item === 'object' && typeof item.opts === 'function') {
            const raw = item.opts().format;
            return toOutputFormat(raw ?? 'table');
        }
    }

    return 'table';
}

const program = new Command();

program
    .name('service-advisor')
    .description('AI-powered third-party service recommendations for developers')
    .version('0.1.2');

program
    .argument('[description]', 'Natural language description of your product needs')
    .option('-c, --category <category>', 'Filter by specific category')
    .option('-f, --format <format>', 'Output format: table or json', 'table')
    .action((description: string | undefined, options: { category?: string; format: string }) => {
        const format = toOutputFormat(options.format);

        if (!description && !options.category) {
            fail('请提供需求描述，或使用 --category <category>');
        }

        let result: RecommendationResult;

        if (options.category) {
            const { categories } = listCategories();
            const category = options.category as Category;

            if (!categories.includes(category)) {
                fail(`非法分类: ${options.category}。可用分类: ${categories.join(', ')}`);
            }

            result = recommendByCategories([category], 5, `category:${category}`);
        } else {
            result = recommend(description ?? '', 5);
        }

        if (result.recommendations.length === 0) {
            fail('没有匹配到可用推荐，请先运行 `service-advisor categories` 查看支持分类。');
        }

        if (format === 'json') {
            printAsJson(result);
            return;
        }

        printRecommendationTable(result);
    });

program
    .command('detail <name>')
    .description('Show full details for a specific service')
    .option('-f, --format <format>', 'Output format: table or json', 'table')
    .action((name: string, ...args: unknown[]) => {
        const format = resolveFormatFromActionArgs(args);
        const detail = getDetail(name);

        if (!detail) {
            fail(`未找到服务: ${name}。可先运行 \`service-advisor categories\` 或主命令进行查询。`);
        }

        if (format === 'json') {
            printAsJson(detail);
            return;
        }

        printServiceDetailTable(detail);
    });

program
    .command('categories')
    .description('List all available service categories')
    .option('-f, --format <format>', 'Output format: table or json', 'table')
    .action((...args: unknown[]) => {
        const format = resolveFormatFromActionArgs(args);
        printCategories(format);
    });

program.parse();
