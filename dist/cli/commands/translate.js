"use strict";
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
        throw new Error('LINGODOTDEV_API_KEY environment variable is required');
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
                    const includePatterns = [];
                    for (const file of files) {
                        fileMap.set(file.path, file.content);
                        includePatterns.push(file.path);
                    }
                    await (0, lingo_1.writeFilesToWorkspace)(workspace, fileMap);
                    await (0, lingo_1.createI18nConfig)(workspace, 'en', options.languages, includePatterns);
                    prompts_1.log.info(`Configuration: ${options.languages.length} language(s) - ${options.languages.join(', ')}`);
                    return 'Files prepared';
                },
            },
            {
                title: `Translating to ${options.languages.length} language(s)`,
                task: async () => {
                    const timeoutMs = 600000;
                    let lastOutput = '';
                    await (0, lingo_1.runLingoCLI)(workspace, apiKey, timeoutMs, (output) => {
                        lastOutput = output;
                        if (output.includes('Error') || output.includes('Failed') || output.includes('Canceled')) {
                            prompts_1.log.warn(output.trim());
                        }
                    });
                    return 'Translation completed';
                },
            },
            {
                title: `Copying translated files to ${options.outputDir}`,
                task: async () => {
                    const sourceFilePaths = files.map(f => f.path);
                    copiedFiles = await (0, lingo_1.copyTranslatedFilesFromWorkspace)(workspace, sourceFilePaths, options.languages, options.outputDir);
                    if (copiedFiles.length === 0) {
                        throw new Error('Translation completed but no files were found. Check Lingo.dev output location.');
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
