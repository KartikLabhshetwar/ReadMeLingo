#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const prompts_1 = require("@clack/prompts");
const translate_1 = require("./commands/translate");
const packageJson = __importStar(require("../package.json"));
const version = packageJson.version;
const program = new commander_1.Command();
program
    .name('readmelingo')
    .description('CLI tool to translate GitHub repository documentation using Lingo.dev')
    .version(version);
program
    .command('translate')
    .description('Translate repository documentation files')
    .option('-r, --repo <repo>', 'GitHub repository URL or owner/repo')
    .option('-t, --token <token>', 'GitHub personal access token (for private repos)')
    .option('-l, --languages <languages>', 'Comma-separated list of target languages (default: es,fr,de)')
    .option('-o, --output <dir>', 'Output directory for translated files (default: ./translations)')
    .option('--include-contributing', 'Include CONTRIBUTING.md', false)
    .option('--include-docs', 'Include /docs folder', false)
    .action(async (options) => {
    (0, prompts_1.intro)('ReadMeLingo - Translation CLI');
    try {
        let repoUrl = options.repo;
        if (!repoUrl) {
            repoUrl = await (0, prompts_1.text)({
                message: 'Enter GitHub repository URL or owner/repo',
                placeholder: 'owner/repo or https://github.com/owner/repo',
                validate(value) {
                    if (!value || value.trim().length === 0) {
                        return 'Repository URL is required';
                    }
                },
            });
            if ((0, prompts_1.isCancel)(repoUrl)) {
                (0, prompts_1.cancel)('Operation cancelled.');
                process.exit(0);
            }
        }
        let languages = options.languages
            ? options.languages.split(',').map((l) => l.trim())
            : null;
        if (!languages) {
            const languageOptions = [
                { value: 'es', label: 'Spanish (es)' },
                { value: 'fr', label: 'French (fr)' },
                { value: 'de', label: 'German (de)' },
                { value: 'it', label: 'Italian (it)' },
                { value: 'pt', label: 'Portuguese (pt)' },
                { value: 'ja', label: 'Japanese (ja)' },
                { value: 'ko', label: 'Korean (ko)' },
                { value: 'zh', label: 'Chinese (zh)' },
            ];
            const selected = await (0, prompts_1.multiselect)({
                message: 'Select target languages',
                options: languageOptions,
                required: true,
            });
            if ((0, prompts_1.isCancel)(selected)) {
                (0, prompts_1.cancel)('Operation cancelled.');
                process.exit(0);
            }
            languages = selected;
        }
        let token = options.token;
        if (!token && process.env.GITHUB_TOKEN) {
            token = process.env.GITHUB_TOKEN;
        }
        let includeContributing = options.includeContributing;
        if (includeContributing === undefined) {
            const shouldInclude = await (0, prompts_1.confirm)({
                message: 'Include CONTRIBUTING.md?',
                initialValue: false,
            });
            if ((0, prompts_1.isCancel)(shouldInclude)) {
                (0, prompts_1.cancel)('Operation cancelled.');
                process.exit(0);
            }
            includeContributing = shouldInclude;
        }
        let includeDocs = options.includeDocs;
        if (includeDocs === undefined) {
            const shouldInclude = await (0, prompts_1.confirm)({
                message: 'Include /docs folder?',
                initialValue: false,
            });
            if ((0, prompts_1.isCancel)(shouldInclude)) {
                (0, prompts_1.cancel)('Operation cancelled.');
                process.exit(0);
            }
            includeDocs = shouldInclude;
        }
        await (0, translate_1.translateRepo)({
            repoUrl: repoUrl,
            token,
            languages,
            outputDir: options.output || './translations',
            includeContributing,
            includeDocs,
        });
        (0, prompts_1.outro)('✨ Translation completed successfully!');
    }
    catch (error) {
        (0, prompts_1.cancel)(error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
});
program.parse();
