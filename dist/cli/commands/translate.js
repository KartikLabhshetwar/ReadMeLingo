"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.translateRepo = translateRepo;
const prompts_1 = require("@clack/prompts");
const fs_1 = require("fs");
const path_1 = require("path");
const github_1 = require("../../lib/github");
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
            files.push({
                name: readme.name,
                path: readme.path,
                content: readme.content,
                size: readme.size,
            });
        }
        if (options.includeContributing) {
            const contributing = await (0, github_1.fetchFile)(repoInfo.owner, repoInfo.repo, 'CONTRIBUTING.md', options.token);
            if (contributing) {
                files.push({
                    name: contributing.name,
                    path: contributing.path,
                    content: contributing.content,
                    size: contributing.size,
                });
            }
        }
        if (options.includeDocs) {
            try {
                const docsFiles = await (0, github_1.fetchDirectory)(repoInfo.owner, repoInfo.repo, 'docs', options.token);
                files.push(...docsFiles.map(f => ({
                    name: f.name,
                    path: f.path,
                    content: f.content,
                    size: f.size,
                })));
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
    let translatedFiles = [];
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
                    const fileMap = new Map();
                    const includePatterns = [];
                    for (const file of files) {
                        fileMap.set(file.path, file.content);
                        includePatterns.push(file.path);
                    }
                    await (0, lingo_1.writeFilesToWorkspace)(workspace, fileMap);
                    await (0, lingo_1.createI18nConfig)(workspace, 'en', options.languages, includePatterns);
                    return 'Files prepared';
                },
            },
            {
                title: `Translating to ${options.languages.length} language(s)`,
                task: async () => {
                    await (0, lingo_1.runLingoCLI)(workspace, apiKey, 120000);
                    return 'Translation completed';
                },
            },
            {
                title: 'Reading translated files',
                task: async () => {
                    const sourceFilePaths = files.map(f => f.path);
                    translatedFiles = await (0, lingo_1.readTranslatedFiles)(workspace, sourceFilePaths, options.languages);
                    if (translatedFiles.length === 0) {
                        throw new Error('Translation completed but no files were generated. Check Lingo.dev configuration.');
                    }
                    return `Generated ${translatedFiles.length} translation(s)`;
                },
            },
            {
                title: `Saving files to ${options.outputDir}`,
                task: async () => {
                    await fs_1.promises.mkdir(options.outputDir, { recursive: true });
                    for (const translatedFile of translatedFiles) {
                        const sourceFileName = translatedFile.path.split('/').pop() || 'README.md';
                        const baseName = sourceFileName.replace(/\.md$/, '').replace(/\.\w+$/, '');
                        const outputFileName = `${baseName}.${translatedFile.locale}.md`;
                        const outputPath = (0, path_1.join)(options.outputDir, outputFileName);
                        await fs_1.promises.writeFile(outputPath, translatedFile.content, 'utf-8');
                    }
                    prompts_1.log.success(`Files saved to ${options.outputDir}`);
                    prompts_1.log.info('\nTranslated files:');
                    translatedFiles.forEach(tf => {
                        const sourceFileName = tf.path.split('/').pop() || 'README.md';
                        const baseName = sourceFileName.replace(/\.md$/, '').replace(/\.\w+$/, '');
                        const outputFileName = `${baseName}.${tf.locale}.md`;
                        prompts_1.log.step(`${outputFileName} (${tf.locale})`);
                    });
                    return `Files saved successfully`;
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
