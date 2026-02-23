#!/usr/bin/env node
// index.ts — ServiceAdvisor CLI 入口
// 用法：npx service-advisor "我需要做一个有支付和邮件功能的 SaaS"

import { Command } from 'commander';
import chalk from 'chalk';
import Table from 'cli-table3';
import { recommend, getDetail, listCategories } from '@stacksieve/mcp-server/recommender';

const program = new Command();

program
    .name('service-advisor')
    .description('AI-powered third-party service recommendations for developers')
    .version('0.1.0');

// ============================================================
// 默认命令：输入需求描述，获取推荐
// ============================================================
program
    .argument('[description]', 'Natural language description of your product needs')
    .option('-c, --category <category>', 'Filter by specific category')
    .option('-f, --format <format>', 'Output format: table (default) or json', 'table')
    .action((description: string | undefined, options: { category?: string; format: string }) => {
        // TODO: 实现推荐逻辑
        // 1. 如果指定了 --category，直接查该场景
        // 2. 否则使用 description 调用 recommend()
        // 3. 按 --format 决定输出格式
        console.log(chalk.cyan('ServiceAdvisor MCP — Coming soon...'));
        console.log(chalk.gray('Run `service-advisor --help` to see all options.'));
    });

// ============================================================
// --detail <name>：查看指定服务的完整信息
// ============================================================
program
    .command('detail <name>')
    .alias('--detail')
    .description('Show full details for a specific service')
    .action((name: string) => {
        // TODO: 调用 getDetail(name) 并格式化输出
        console.log(chalk.cyan(`Fetching details for: ${name}`));
    });

// ============================================================
// --list-categories：列出所有场景分类
// ============================================================
program
    .command('categories')
    .alias('--list-categories')
    .description('List all available service categories')
    .action(() => {
        // TODO: 调用 listCategories() 并输出
        const { categories } = listCategories();
        console.log(chalk.bold('\nAvailable Categories:\n'));
        categories.forEach((cat) => console.log(chalk.green(`  • ${cat}`)));
    });

program.parse();
