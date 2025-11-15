"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.translateRepo = translateRepo;
const ora_1 = __importDefault(require("ora"));
const chalk_1 = __importDefault(require("chalk"));
const github_1 = require("../../lib/github");
const markdown_1 = require("../../lib/markdown");
const lingo_1 = require("../../lib/lingo");
async function translateRepo(options) {
    const spinner = (0, ora_1.default)('Parsing repository URL...').start();
    const repoInfo = (0, github_1.parseRepoUrl)(options.repoUrl);
    if (!repoInfo) {
        spinner.fail('Invalid repository URL');
        throw new Error('Invalid repository URL. Use format: https://github.com/owner/repo or owner/repo');
    }
    spinner.succeed(`Repository: ${chalk_1.default.bold.cyan(repoInfo.owner + '/' + repoInfo.repo)}`);
    spinner.start('Fetching repository files...');
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
                spinner.warn('Could not fetch /docs folder');
            }
        }
        if (files.length === 0) {
            spinner.fail('No markdown files found');
            throw new Error('No markdown files found in repository');
        }
        spinner.succeed(`Found ${chalk_1.default.bold(files.length)} file(s) to translate`);
    }
    catch (error) {
        spinner.fail('Failed to fetch repository files');
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
        const translateSpinner = (0, ora_1.default)(`Translating ${files.length} file(s) to ${options.languages.length} language(s)...`).start();
        translations = await (0, lingo_1.translateFiles)(files, options.languages, apiKey);
        translateSpinner.succeed(`Translated ${chalk_1.default.bold(translations.length)} file(s)`);
        const saveSpinner = (0, ora_1.default)(`Saving translated files to ${options.outputDir}...`).start();
        savedFiles = await (0, lingo_1.saveTranslatedFiles)(translations, options.outputDir);
        saveSpinner.succeed(`Saved ${chalk_1.default.bold(savedFiles.length)} file(s) successfully`);
        console.log(chalk_1.default.bold('\n📁 Translated files:'));
        savedFiles.forEach(cf => {
            console.log(chalk_1.default.gray('  •'), chalk_1.default.cyan(cf.fileName), chalk_1.default.gray(`(${cf.locale})`));
        });
    }
    catch (error) {
        throw error;
    }
}
