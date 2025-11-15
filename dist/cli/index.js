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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const path_1 = require("path");
const fs_1 = require("fs");
const commander_1 = require("commander");
const inquirer_1 = __importDefault(require("inquirer"));
const chalk_1 = __importDefault(require("chalk"));
const translate_1 = require("./commands/translate");
const packageJson = __importStar(require("../package.json"));
const findEnvFile = () => {
    const possiblePaths = [
        (0, path_1.join)(process.cwd(), '.env'),
        (0, path_1.resolve)(__dirname, '../../.env'),
        (0, path_1.resolve)(__dirname, '../.env'),
    ];
    for (const envPath of possiblePaths) {
        if ((0, fs_1.existsSync)(envPath)) {
            return envPath;
        }
    }
    return undefined;
};
const envPath = findEnvFile();
if (envPath) {
    (0, dotenv_1.config)({ path: envPath });
}
else {
    (0, dotenv_1.config)();
}
const version = packageJson.version;
const program = new commander_1.Command();
program
    .name('readmelingo')
    .description('CLI tool to translate GitHub repository documentation using Lingo.dev')
    .version(version);
const LANGUAGE_OPTIONS = [
    { name: '🇪🇸 Spanish (es) - Español', value: 'es' },
    { name: '🇫🇷 French (fr) - Français', value: 'fr' },
    { name: '🇩🇪 German (de) - Deutsch', value: 'de' },
    { name: '🇮🇹 Italian (it) - Italiano', value: 'it' },
    { name: '🇵🇹 Portuguese (pt) - Português', value: 'pt' },
    { name: '🇯🇵 Japanese (ja) - 日本語', value: 'ja' },
    { name: '🇰🇷 Korean (ko) - 한국어', value: 'ko' },
    { name: '🇨🇳 Chinese (zh) - 中文', value: 'zh' },
    { name: '🇷🇺 Russian (ru) - Русский', value: 'ru' },
    { name: '🇸🇦 Arabic (ar) - العربية', value: 'ar' },
    { name: '🇮🇳 Hindi (hi) - हिन्दी', value: 'hi' },
    { name: '🇳🇱 Dutch (nl) - Nederlands', value: 'nl' },
    { name: '🇵🇱 Polish (pl) - Polski', value: 'pl' },
    { name: '🇹🇷 Turkish (tr) - Türkçe', value: 'tr' },
    { name: '🇸🇪 Swedish (sv) - Svenska', value: 'sv' },
    { name: '🇳🇴 Norwegian (no) - Norsk', value: 'no' },
    { name: '🇩🇰 Danish (da) - Dansk', value: 'da' },
    { name: '🇫🇮 Finnish (fi) - Suomi', value: 'fi' },
    { name: '🇬🇷 Greek (el) - Ελληνικά', value: 'el' },
    { name: '🇨🇿 Czech (cs) - Čeština', value: 'cs' },
    { name: '🇷🇴 Romanian (ro) - Română', value: 'ro' },
    { name: '🇭🇺 Hungarian (hu) - Magyar', value: 'hu' },
    { name: '🇻🇳 Vietnamese (vi) - Tiếng Việt', value: 'vi' },
    { name: '🇹🇭 Thai (th) - ไทย', value: 'th' },
    { name: '🇮🇩 Indonesian (id) - Bahasa Indonesia', value: 'id' },
    { name: '🇮🇱 Hebrew (he) - עברית', value: 'he' },
    { name: '🇺🇦 Ukrainian (uk) - Українська', value: 'uk' },
    { name: '🇪🇸 Catalan (ca) - Català', value: 'ca' },
    { name: '🇧🇬 Bulgarian (bg) - Български', value: 'bg' },
    { name: '🇭🇷 Croatian (hr) - Hrvatski', value: 'hr' },
    { name: '🇸🇰 Slovak (sk) - Slovenčina', value: 'sk' },
    { name: '🇸🇮 Slovenian (sl) - Slovenščina', value: 'sl' },
    { name: '🇱🇹 Lithuanian (lt) - Lietuvių', value: 'lt' },
    { name: '🇱🇻 Latvian (lv) - Latviešu', value: 'lv' },
    { name: '🇪🇪 Estonian (et) - Eesti', value: 'et' },
    { name: '🇲🇾 Malay (ms) - Bahasa Melayu', value: 'ms' },
    { name: '🇵🇭 Filipino (tl) - Filipino', value: 'tl' },
];
function validateRepoUrl(value) {
    if (!value || value.trim().length === 0) {
        return 'Repository URL is required';
    }
    const patterns = [
        /github\.com\/([^\/]+)\/([^\/]+)/,
        /^([^\/]+)\/([^\/]+)$/,
    ];
    const isValid = patterns.some(pattern => pattern.test(value.trim()));
    if (!isValid) {
        return 'Invalid repository format. Use: owner/repo or https://github.com/owner/repo';
    }
    return true;
}
function validateOutputDir(value) {
    if (!value || value.trim().length === 0) {
        return 'Output directory is required';
    }
    return true;
}
function validateGitHubToken(value) {
    if (!value || value.trim().length === 0) {
        return 'GitHub token is required';
    }
    if (!value.startsWith('ghp_') && !value.startsWith('gho_') && !value.startsWith('ghu_') && !value.startsWith('ghs_') && !value.startsWith('ghr_')) {
        return 'Invalid GitHub token format. Token should start with ghp_, gho_, ghu_, ghs_, or ghr_';
    }
    return true;
}
function printWelcome() {
    console.log(chalk_1.default.bold.cyan('\n╔═══════════════════════════════════════════════════════════╗'));
    console.log(chalk_1.default.bold.cyan('║') + chalk_1.default.bold.white('  🌍 ReadMeLingo - Translation CLI') + chalk_1.default.bold.cyan('                      ║'));
    console.log(chalk_1.default.bold.cyan('║') + chalk_1.default.gray('  Translate GitHub documentation into 40+ languages') + chalk_1.default.bold.cyan('  ║'));
    console.log(chalk_1.default.bold.cyan('╚═══════════════════════════════════════════════════════════╝\n'));
}
function printSuccess(message) {
    console.log(chalk_1.default.green('✓'), chalk_1.default.bold(message));
}
function printError(message) {
    console.log(chalk_1.default.red('✗'), chalk_1.default.bold(message));
}
function printInfo(message) {
    console.log(chalk_1.default.blue('ℹ'), message);
}
async function interactiveMode() {
    printWelcome();
    try {
        const { action } = await inquirer_1.default.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'What would you like to do?',
                choices: [
                    { name: '📝 Translate Repository Documentation', value: 'translate' },
                    { name: '❌ Exit', value: 'exit' },
                ],
            },
        ]);
        if (action === 'exit') {
            console.log(chalk_1.default.gray('\nGoodbye! 👋\n'));
            process.exit(0);
        }
        if (action === 'translate') {
            await handleTranslate();
        }
    }
    catch (error) {
        if (error && typeof error === 'object' && 'isTtyError' in error) {
            printError('Prompt couldn\'t be rendered in the current environment');
        }
        else {
            printError(error instanceof Error ? error.message : String(error));
        }
        process.exit(1);
    }
}
async function handleTranslate() {
    try {
        const { repoUrl } = await inquirer_1.default.prompt([
            {
                type: 'input',
                name: 'repoUrl',
                message: 'Enter GitHub repository URL or owner/repo',
                default: '',
                validate: validateRepoUrl,
                transformer: (input) => {
                    return input.trim();
                },
            },
        ]);
        const { filesToInclude } = await inquirer_1.default.prompt([
            {
                type: 'checkbox',
                name: 'filesToInclude',
                message: 'Which files would you like to translate?',
                choices: [
                    { name: '📄 README.md (Main documentation file)', value: 'readme', checked: true },
                    { name: '📋 CONTRIBUTING.md (Contribution guidelines)', value: 'contributing' },
                    { name: '📁 /docs folder (Documentation directory)', value: 'docs' },
                ],
                validate: (answer) => {
                    if (answer.length === 0) {
                        return 'Please select at least one file type to translate';
                    }
                    return true;
                },
            },
        ]);
        const { selectedLanguages } = await inquirer_1.default.prompt([
            {
                type: 'checkbox',
                name: 'selectedLanguages',
                message: 'Select target languages (use space to select, arrow keys to navigate)',
                choices: LANGUAGE_OPTIONS,
                pageSize: 15,
                validate: (answer) => {
                    if (answer.length === 0) {
                        return 'Please select at least one language';
                    }
                    return true;
                },
            },
        ]);
        printInfo(`Selected ${selectedLanguages.length} language(s): ${selectedLanguages.join(', ')}\n`);
        const { outputDir } = await inquirer_1.default.prompt([
            {
                type: 'input',
                name: 'outputDir',
                message: 'Output directory for translated files',
                default: './translations',
                validate: validateOutputDir,
            },
        ]);
        let token = process.env.GITHUB_TOKEN;
        if (!token) {
            const { useToken } = await inquirer_1.default.prompt([
                {
                    type: 'confirm',
                    name: 'useToken',
                    message: 'Do you have a GitHub token for private repositories?',
                    default: false,
                },
            ]);
            if (useToken) {
                const { tokenInput } = await inquirer_1.default.prompt([
                    {
                        type: 'password',
                        name: 'tokenInput',
                        message: 'Enter your GitHub personal access token',
                        mask: '*',
                        validate: validateGitHubToken,
                    },
                ]);
                token = tokenInput;
            }
        }
        else {
            printInfo('Using GitHub token from environment variable\n');
        }
        console.log(chalk_1.default.bold('\nStarting translation process...\n'));
        await (0, translate_1.translateRepo)({
            repoUrl: repoUrl.trim(),
            token,
            languages: selectedLanguages,
            outputDir: outputDir.trim(),
            includeContributing: filesToInclude.includes('contributing'),
            includeDocs: filesToInclude.includes('docs'),
        });
        console.log(chalk_1.default.bold.green('\n✨ Translation completed successfully!\n'));
    }
    catch (error) {
        if (error && typeof error === 'object' && 'isTtyError' in error) {
            printError('Prompt couldn\'t be rendered in the current environment');
        }
        else {
            printError(error instanceof Error ? error.message : String(error));
        }
        process.exit(1);
    }
}
program
    .command('translate')
    .description('Translate repository documentation files')
    .option('-r, --repo <repo>', 'GitHub repository URL or owner/repo')
    .option('-t, --token <token>', 'GitHub personal access token (for private repos)')
    .option('-l, --languages <languages>', 'Comma-separated list of target languages')
    .option('-o, --output <dir>', 'Output directory for translated files (default: ./translations)')
    .option('--include-contributing', 'Include CONTRIBUTING.md', false)
    .option('--include-docs', 'Include /docs folder', false)
    .action(async (options) => {
    if (!options.repo) {
        await handleTranslate();
        return;
    }
    printWelcome();
    try {
        let languages = [];
        if (options.languages) {
            languages = options.languages.split(',').map((l) => l.trim()).filter((l) => l.length > 0);
        }
        if (!options.languages || languages.length === 0) {
            const { selectedLanguages } = await inquirer_1.default.prompt([
                {
                    type: 'checkbox',
                    name: 'selectedLanguages',
                    message: 'Select target languages',
                    choices: LANGUAGE_OPTIONS,
                    pageSize: 15,
                    validate: (answer) => {
                        if (answer.length === 0) {
                            return 'Please select at least one language';
                        }
                        return true;
                    },
                },
            ]);
            languages = selectedLanguages;
            printInfo(`Selected ${languages.length} language(s): ${languages.join(', ')}\n`);
        }
        let token = options.token;
        if (!token && process.env.GITHUB_TOKEN) {
            token = process.env.GITHUB_TOKEN;
            printInfo('Using GitHub token from environment variable\n');
        }
        console.log(chalk_1.default.bold('\nStarting translation process...\n'));
        await (0, translate_1.translateRepo)({
            repoUrl: options.repo,
            token,
            languages,
            outputDir: options.output || './translations',
            includeContributing: options.includeContributing,
            includeDocs: options.includeDocs,
        });
        console.log(chalk_1.default.bold.green('\n✨ Translation completed successfully!\n'));
    }
    catch (error) {
        if (error && typeof error === 'object' && 'isTtyError' in error) {
            printError('Prompt couldn\'t be rendered in the current environment');
        }
        else {
            printError(error instanceof Error ? error.message : String(error));
        }
        process.exit(1);
    }
});
program
    .action(async () => {
    await interactiveMode();
});
program.parse();
