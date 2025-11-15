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
const quotes_1 = require("../utils/quotes");
async function translateRepo(options) {
    const parseSpinner = (0, ora_1.default)({
        text: 'Parsing repository URL...',
        spinner: 'dots',
        color: 'cyan',
    }).start();
    const repoInfo = (0, github_1.parseRepoUrl)(options.repoUrl);
    if (!repoInfo) {
        parseSpinner.fail('Invalid repository URL');
        throw new Error('Invalid repository URL. Use format: https://github.com/owner/repo or owner/repo');
    }
    parseSpinner.succeed(`Repository: ${chalk_1.default.bold.cyan(repoInfo.owner + '/' + repoInfo.repo)}`);
    const fetchSpinner = (0, ora_1.default)({
        text: 'Fetching repository files...',
        spinner: 'bouncingBar',
        color: 'blue',
    }).start();
    const files = [];
    try {
        fetchSpinner.text = 'Fetching README.md...';
        const readme = await (0, github_1.fetchReadme)(repoInfo.owner, repoInfo.repo, options.token);
        if (readme) {
            fetchSpinner.text = 'Parsing README.md...';
            const parsedContent = (0, markdown_1.parseAndValidateMarkdown)(readme.content);
            files.push({
                name: readme.name,
                path: readme.path,
                content: parsedContent,
            });
            fetchSpinner.text = `Found README.md ${chalk_1.default.gray(`(${files.length} file${files.length !== 1 ? 's' : ''})`)}`;
        }
        if (options.includeContributing) {
            fetchSpinner.text = 'Fetching CONTRIBUTING.md...';
            const contributing = await (0, github_1.fetchFile)(repoInfo.owner, repoInfo.repo, 'CONTRIBUTING.md', options.token);
            if (contributing) {
                fetchSpinner.text = 'Parsing CONTRIBUTING.md...';
                const parsedContent = (0, markdown_1.parseAndValidateMarkdown)(contributing.content);
                files.push({
                    name: contributing.name,
                    path: contributing.path,
                    content: parsedContent,
                });
                fetchSpinner.text = `Found CONTRIBUTING.md ${chalk_1.default.gray(`(${files.length} file${files.length !== 1 ? 's' : ''})`)}`;
            }
        }
        if (options.includeDocs) {
            try {
                fetchSpinner.text = 'Fetching /docs folder...';
                const docsFiles = await (0, github_1.fetchDirectory)(repoInfo.owner, repoInfo.repo, 'docs', options.token);
                fetchSpinner.text = `Parsing ${docsFiles.length} file(s) from /docs folder...`;
                files.push(...docsFiles.map(f => {
                    const parsedContent = (0, markdown_1.parseAndValidateMarkdown)(f.content);
                    return {
                        name: f.name,
                        path: f.path,
                        content: parsedContent,
                    };
                }));
                fetchSpinner.text = `Found ${docsFiles.length} file(s) in /docs folder ${chalk_1.default.gray(`(${files.length} total file${files.length !== 1 ? 's' : ''})`)}`;
            }
            catch (error) {
                fetchSpinner.warn('Could not fetch /docs folder');
            }
        }
        if (files.length === 0) {
            fetchSpinner.fail('No markdown files found');
            throw new Error('No markdown files found in repository');
        }
        fetchSpinner.succeed(`Found ${chalk_1.default.bold(files.length)} file(s) to translate`);
    }
    catch (error) {
        fetchSpinner.fail('Failed to fetch repository files');
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
        const translateSpinner = (0, ora_1.default)({
            text: `Translating ${files.length} file(s) to ${options.languages.length} language(s)...`,
            spinner: 'dots2',
            color: 'magenta',
        }).start();
        const quoteInterval = setInterval(() => {
            const quote = (0, quotes_1.getRandomQuote)();
            const maxQuoteLength = 200;
            const maxAuthorLength = 100;
            let quoteText = quote.text;
            if (quoteText.length > maxQuoteLength) {
                const lastSpace = quoteText.lastIndexOf(' ', maxQuoteLength - 3);
                const truncateAt = lastSpace > maxQuoteLength * 0.7 ? lastSpace : maxQuoteLength - 3;
                quoteText = quoteText.substring(0, truncateAt) + '...';
            }
            let authorText = quote.author;
            if (authorText.length > maxAuthorLength) {
                authorText = authorText.substring(0, maxAuthorLength - 3) + '...';
            }
            translateSpinner.text = `${chalk_1.default.magenta('Translating...')} ${chalk_1.default.gray('|')} ${chalk_1.default.italic.yellow(`"${quoteText}"`)} ${chalk_1.default.gray(`— ${authorText}`)}`;
        }, 5000);
        try {
            translations = await (0, lingo_1.translateFiles)(files, options.languages, apiKey);
            clearInterval(quoteInterval);
            translateSpinner.succeed(`Translated ${chalk_1.default.bold(translations.length)} file(s)`);
        }
        catch (error) {
            clearInterval(quoteInterval);
            translateSpinner.fail('Translation failed');
            throw error;
        }
        const saveSpinner = (0, ora_1.default)({
            text: `Saving translated files to ${options.outputDir}...`,
            spinner: 'arrow3',
            color: 'green',
        }).start();
        savedFiles = await (0, lingo_1.saveTranslatedFiles)(translations, options.outputDir);
        saveSpinner.succeed(`Saved ${chalk_1.default.bold(savedFiles.length)} file(s) successfully`);
        console.log(chalk_1.default.bold('\nTranslated files:'));
        savedFiles.forEach(cf => {
            console.log(chalk_1.default.gray('  -'), chalk_1.default.cyan(cf.fileName), chalk_1.default.gray(`(${cf.locale})`));
        });
    }
    catch (error) {
        throw error;
    }
}
