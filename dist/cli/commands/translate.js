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
    if (!options.languages || options.languages.length === 0) {
        throw new Error('No target languages specified');
    }
    let savedFiles = [];
    let translations = [];
    try {
        await (0, prompts_1.tasks)([
            {
                title: `Translating ${files.length} file(s) to ${options.languages.length} language(s)`,
                task: async () => {
                    translations = await (0, lingo_1.translateFiles)(files, options.languages, apiKey);
                    prompts_1.log.info(`Translated ${translations.length} file(s)`);
                    return 'Translation completed';
                },
            },
            {
                title: `Saving translated files to ${options.outputDir}`,
                task: async () => {
                    savedFiles = await (0, lingo_1.saveTranslatedFiles)(translations, options.outputDir);
                    prompts_1.log.success(`Files saved to ${options.outputDir}`);
                    prompts_1.log.info('\nTranslated files:');
                    savedFiles.forEach(cf => {
                        prompts_1.log.step(`${cf.fileName} (${cf.locale})`);
                    });
                    return `Saved ${savedFiles.length} file(s) successfully`;
                },
            },
        ]);
    }
    catch (error) {
        throw error;
    }
}
