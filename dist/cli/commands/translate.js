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
exports.translateRepo = translateRepo;
const prompts_1 = require("@clack/prompts");
const github_1 = require("../../lib/github");
const markdown_1 = require("../../lib/markdown");
const lingo_1 = require("../../lib/lingo");
async function translateRepo(options) {
    const s = (0, prompts_1.spinner)();
    s.start('Parsing repository URL...');
    const repoInfo = (0, github_1.parseRepoUrl)(options.repoUrl);
    if (!repoInfo) {
        s.stop('Invalid repository URL');
        throw new Error('Invalid repository URL. Use format: https://github.com/owner/repo or owner/repo');
    }
    s.stop(`Repository: ${repoInfo.owner}/${repoInfo.repo}`);
    s.start('Fetching repository files...');
    const files = [];
    try {
        const readme = await (0, github_1.fetchReadme)(repoInfo.owner, repoInfo.repo, options.token);
        if (readme) {
            const parsedContent = (0, markdown_1.parseAndValidateMarkdown)(readme.content);
            files.push({
                name: readme.name,
                path: readme.path,
                content: parsedContent,
                size: readme.size,
            });
        }
        if (options.includeContributing) {
            const contributing = await (0, github_1.fetchFile)(repoInfo.owner, repoInfo.repo, 'CONTRIBUTING.md', options.token);
            if (contributing) {
                const parsedContent = (0, markdown_1.parseAndValidateMarkdown)(contributing.content);
                files.push({
                    name: contributing.name,
                    path: contributing.path,
                    content: parsedContent,
                    size: contributing.size,
                });
            }
        }
        if (options.includeDocs) {
            try {
                const docsFiles = await (0, github_1.fetchDirectory)(repoInfo.owner, repoInfo.repo, 'docs', options.token);
                files.push(...docsFiles.map(f => {
                    const parsedContent = (0, markdown_1.parseAndValidateMarkdown)(f.content);
                    return {
                        name: f.name,
                        path: f.path,
                        content: parsedContent,
                        size: f.size,
                    };
                }));
            }
            catch (error) {
                prompts_1.log.warn('Could not fetch /docs folder');
            }
        }
        if (files.length === 0) {
            s.stop('No markdown files found');
            throw new Error('No markdown files found in repository');
        }
        s.stop(`Found ${files.length} file(s) to translate`);
    }
    catch (error) {
        s.stop('Failed to fetch repository files');
        throw error;
    }
    const apiKey = process.env.LINGODOTDEV_API_KEY;
    if (!apiKey) {
        throw new Error('LINGODOTDEV_API_KEY environment variable is required.\n\n' +
            'To get your API key:\n' +
            '1. Visit https://lingo.dev/auth\n' +
            '2. Navigate to Projects > Your Project > API Key\n' +
            '3. Copy the API key\n' +
            '4. Add it to .env file in project root:\n' +
            '   LINGODOTDEV_API_KEY="your-api-key-here"\n' +
            '   Or set as environment variable:\n' +
            '   export LINGODOTDEV_API_KEY="your-api-key-here"\n\n' +
            'Or add to ~/.zshrc or ~/.bashrc for persistence.');
    }
    if (apiKey.length < 20 || !apiKey.includes('_')) {
        throw new Error('Invalid LINGODOTDEV_API_KEY format.\n' +
            'API key should be in format "api_..." or "lingo_...".\n' +
            'Please check your API key at https://lingo.dev/auth');
    }
    let workspace = null;
    let copiedFiles = [];
    try {
        await (0, prompts_1.tasks)([
            {
                title: 'Creating temporary workspace',
                task: async () => {
                    workspace = await (0, lingo_1.createTempWorkspace)();
                    return 'Workspace created';
                },
            },
            {
                title: 'Preparing files for translation',
                task: async () => {
                    if (!options.languages || options.languages.length === 0) {
                        throw new Error('No target languages specified');
                    }
                    const fileMap = new Map();
                    const sourceLocale = 'en';
                    for (const file of files) {
                        const fileName = file.path.split('/').pop() || file.path;
                        fileMap.set(fileName, file.content);
                    }
                    await (0, lingo_1.writeFilesToWorkspace)(workspace, fileMap, sourceLocale);
                    await (0, lingo_1.createI18nConfig)(workspace, sourceLocale, options.languages, files.length);
                    const { promises: fs } = await Promise.resolve().then(() => __importStar(require('fs')));
                    const { join } = await Promise.resolve().then(() => __importStar(require('path')));
                    const configPath = join(workspace, 'i18n.json');
                    const configContent = await fs.readFile(configPath, 'utf-8');
                    prompts_1.log.info(`i18n.json configuration:\n${configContent}`);
                    prompts_1.log.info(`Configuration: ${options.languages.length} language(s) - ${options.languages.join(', ')}`);
                    return 'Files prepared';
                },
            },
            {
                title: `Translating to ${options.languages.length} language(s)`,
                task: async () => {
                    const timeoutMs = 600000;
                    let allOutput = '';
                    const result = await (0, lingo_1.runLingoCLI)(workspace, apiKey, timeoutMs, (output) => {
                        allOutput += output;
                        if (output.includes('Error') || output.includes('Failed') || output.includes('Canceled')) {
                            prompts_1.log.warn(output.trim());
                        }
                    });
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    if (result.stdout) {
                        const stdoutLines = result.stdout.split('\n').filter(l => l.trim());
                        const hasSuccess = stdoutLines.some(l => l.includes('completed') ||
                            l.includes('✅') ||
                            l.includes('Success') ||
                            l.includes('translated'));
                        if (!hasSuccess && stdoutLines.length > 0) {
                            prompts_1.log.info('Lingo.dev CLI output:');
                            stdoutLines.slice(-10).forEach(line => prompts_1.log.info(`  ${line}`));
                        }
                    }
                    const combinedOutput = result.stdout + result.stderr;
                    if (combinedOutput.includes('No changes detected') || combinedOutput.includes('skipped')) {
                        prompts_1.log.warn('Translation may have been skipped - no changes detected');
                    }
                    const { listWorkspaceFiles } = await Promise.resolve().then(() => __importStar(require('../../lib/lingo')));
                    const filesAfterTranslation = await listWorkspaceFiles(workspace);
                    const mdFilesAfter = filesAfterTranslation.filter(f => f.endsWith('.md') && !f.includes('i18n.lock'));
                    if (mdFilesAfter.length > 0) {
                        prompts_1.log.info(`Files in workspace after translation: ${mdFilesAfter.join(', ')}`);
                    }
                    return 'Translation completed';
                },
            },
            {
                title: `Copying translated files to ${options.outputDir}`,
                task: async () => {
                    const { listWorkspaceFiles } = await Promise.resolve().then(() => __importStar(require('../../lib/lingo')));
                    const allFiles = await listWorkspaceFiles(workspace);
                    const mdFiles = allFiles.filter(f => f.endsWith('.md') && !f.includes('i18n.lock'));
                    prompts_1.log.info(`Workspace contains ${allFiles.length} file(s) total`);
                    if (mdFiles.length > 0) {
                        prompts_1.log.info(`Found ${mdFiles.length} markdown file(s): ${mdFiles.join(', ')}`);
                    }
                    else {
                        prompts_1.log.warn('No markdown files found in workspace');
                    }
                    const sourceFileNames = files.map(f => {
                        const fileName = f.path.split('/').pop() || f.path;
                        return fileName;
                    });
                    prompts_1.log.info(`Looking for translations of: ${sourceFileNames.join(', ')}`);
                    prompts_1.log.info(`Target locales: ${options.languages.join(', ')}`);
                    copiedFiles = await (0, lingo_1.copyTranslatedFilesFromWorkspace)(workspace, sourceFileNames, options.languages, options.outputDir);
                    if (copiedFiles.length === 0) {
                        const errorMsg = [
                            'Translation completed but no translated files were found.',
                            '',
                            `Workspace structure:`,
                            `  Total files: ${allFiles.length}`,
                            `  Markdown files: ${mdFiles.length}`,
                            mdFiles.length > 0 ? `  Files found: ${mdFiles.map(f => `    - ${f}`).join('\n')}` : '  No markdown files found',
                            '',
                            `Expected translations:`,
                            `  Source files: ${sourceFileNames.join(', ')}`,
                            `  Target locales: ${options.languages.join(', ')}`,
                            `  Expected locations: ${options.languages.map(locale => sourceFileNames.map(f => `    - ${locale}/${f}`).join('\n')).join('\n')}`,
                            '',
                            'This might indicate:',
                            '  1. Translation was skipped (no changes detected)',
                            '  2. Translation failed silently',
                            '  3. Files were created in a different location',
                            '',
                            'Check the Lingo.dev CLI output above for details.',
                        ].join('\n');
                        throw new Error(errorMsg);
                    }
                    prompts_1.log.success(`Files copied to ${options.outputDir}`);
                    prompts_1.log.info('\nTranslated files:');
                    copiedFiles.forEach(cf => {
                        prompts_1.log.step(`${cf.fileName} (${cf.locale})`);
                    });
                    return `Copied ${copiedFiles.length} file(s) successfully`;
                },
            },
        ]);
    }
    catch (error) {
        throw error;
    }
    finally {
        if (workspace) {
            await (0, lingo_1.cleanupWorkspace)(workspace);
        }
    }
}
