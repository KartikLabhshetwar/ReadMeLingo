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
async function interactiveMode() {
    (0, prompts_1.intro)('🌍 ReadMeLingo - Translation CLI');
    try {
        const action = await (0, prompts_1.select)({
            message: 'What would you like to do?',
            options: [
                { value: 'translate', label: '📝 Translate Repository Documentation', hint: 'Fetch and translate README files' },
                { value: 'exit', label: '❌ Exit', hint: 'Close the application' },
            ],
        });
        if ((0, prompts_1.isCancel)(action) || action === 'exit') {
            (0, prompts_1.cancel)('Operation cancelled.');
            process.exit(0);
        }
        if (action === 'translate') {
            await handleTranslate();
        }
    }
    catch (error) {
        (0, prompts_1.cancel)(error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
}
async function handleTranslate() {
    const repoUrl = await (0, prompts_1.text)({
        message: 'Enter GitHub repository URL or owner/repo',
        placeholder: 'owner/repo or https://github.com/owner/repo',
        validate(value) {
            if (!value || value.trim().length === 0) {
                return 'Repository URL is required';
            }
            const patterns = [
                /github\.com\/([^\/]+)\/([^\/]+)/,
                /^([^\/]+)\/([^\/]+)$/,
            ];
            const isValid = patterns.some(pattern => pattern.test(value));
            if (!isValid) {
                return 'Invalid repository format. Use: owner/repo or https://github.com/owner/repo';
            }
        },
    });
    if ((0, prompts_1.isCancel)(repoUrl)) {
        (0, prompts_1.cancel)('Operation cancelled.');
        process.exit(0);
    }
    const filesToInclude = await (0, prompts_1.multiselect)({
        message: 'Which files would you like to translate?',
        options: [
            { value: 'readme', label: '📄 README.md', hint: 'Main documentation file' },
            { value: 'contributing', label: '📋 CONTRIBUTING.md', hint: 'Contribution guidelines' },
            { value: 'docs', label: '📁 /docs folder', hint: 'Documentation directory' },
        ],
        required: true,
        initialValues: ['readme'],
    });
    if ((0, prompts_1.isCancel)(filesToInclude)) {
        (0, prompts_1.cancel)('Operation cancelled.');
        process.exit(0);
    }
    const languageOptions = [
        { value: 'es', label: '🇪🇸 Spanish (es)', hint: 'Español' },
        { value: 'fr', label: '🇫🇷 French (fr)', hint: 'Français' },
        { value: 'de', label: '🇩🇪 German (de)', hint: 'Deutsch' },
        { value: 'it', label: '🇮🇹 Italian (it)', hint: 'Italiano' },
        { value: 'pt', label: '🇵🇹 Portuguese (pt)', hint: 'Português' },
        { value: 'ja', label: '🇯🇵 Japanese (ja)', hint: '日本語' },
        { value: 'ko', label: '🇰🇷 Korean (ko)', hint: '한국어' },
        { value: 'zh', label: '🇨🇳 Chinese (zh)', hint: '中文' },
    ];
    const selectedLanguages = await (0, prompts_1.multiselect)({
        message: 'Select target languages',
        options: languageOptions,
        required: true,
        initialValues: ['es', 'fr', 'de'],
    });
    if ((0, prompts_1.isCancel)(selectedLanguages)) {
        (0, prompts_1.cancel)('Operation cancelled.');
        process.exit(0);
    }
    const outputDir = await (0, prompts_1.text)({
        message: 'Output directory for translated files',
        placeholder: './translations',
        initialValue: './translations',
        validate(value) {
            if (!value || value.trim().length === 0) {
                return 'Output directory is required';
            }
        },
    });
    if ((0, prompts_1.isCancel)(outputDir)) {
        (0, prompts_1.cancel)('Operation cancelled.');
        process.exit(0);
    }
    let token = process.env.GITHUB_TOKEN;
    if (!token) {
        const useToken = await (0, prompts_1.confirm)({
            message: 'Do you have a GitHub token for private repositories?',
            initialValue: false,
        });
        if ((0, prompts_1.isCancel)(useToken)) {
            (0, prompts_1.cancel)('Operation cancelled.');
            process.exit(0);
        }
        if (useToken) {
            const tokenInput = await (0, prompts_1.text)({
                message: 'Enter your GitHub token',
                placeholder: 'ghp_...',
                validate(value) {
                    if (!value || value.trim().length === 0) {
                        return 'GitHub token is required';
                    }
                },
            });
            if ((0, prompts_1.isCancel)(tokenInput)) {
                (0, prompts_1.cancel)('Operation cancelled.');
                process.exit(0);
            }
            token = tokenInput;
        }
    }
    prompts_1.log.info('\nStarting translation process...\n');
    await (0, translate_1.translateRepo)({
        repoUrl: repoUrl,
        token,
        languages: selectedLanguages,
        outputDir: outputDir,
        includeContributing: filesToInclude.includes('contributing'),
        includeDocs: filesToInclude.includes('docs'),
    });
    (0, prompts_1.outro)('✨ Translation completed successfully!');
}
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
    if (!options.repo) {
        await handleTranslate();
        return;
    }
    (0, prompts_1.intro)('🌍 ReadMeLingo - Translation CLI');
    try {
        let languages = options.languages
            ? options.languages.split(',').map((l) => l.trim())
            : ['es', 'fr', 'de'];
        if (!options.languages) {
            const languageOptions = [
                { value: 'es', label: '🇪🇸 Spanish (es)' },
                { value: 'fr', label: '🇫🇷 French (fr)' },
                { value: 'de', label: '🇩🇪 German (de)' },
                { value: 'it', label: '🇮🇹 Italian (it)' },
                { value: 'pt', label: '🇵🇹 Portuguese (pt)' },
                { value: 'ja', label: '🇯🇵 Japanese (ja)' },
                { value: 'ko', label: '🇰🇷 Korean (ko)' },
                { value: 'zh', label: '🇨🇳 Chinese (zh)' },
            ];
            const selected = await (0, prompts_1.multiselect)({
                message: 'Select target languages',
                options: languageOptions,
                required: true,
                initialValues: ['es', 'fr', 'de'],
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
        await (0, translate_1.translateRepo)({
            repoUrl: options.repo,
            token,
            languages,
            outputDir: options.output || './translations',
            includeContributing: options.includeContributing,
            includeDocs: options.includeDocs,
        });
        (0, prompts_1.outro)('✨ Translation completed successfully!');
    }
    catch (error) {
        (0, prompts_1.cancel)(error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
});
program
    .action(async () => {
    await interactiveMode();
});
program.parse();
