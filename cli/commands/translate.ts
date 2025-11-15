import ora from 'ora';
import chalk from 'chalk';
import { parseRepoUrl, fetchReadme, fetchFile, fetchDirectory } from '../../lib/github';
import { parseAndValidateMarkdown } from '../../lib/markdown';
import { translateFiles, saveTranslatedFiles } from '../../lib/lingo';
import { getRandomQuote, formatQuote } from '../utils/quotes';

interface TranslateOptions {
  repoUrl: string;
  token?: string;
  languages: string[];
  outputDir: string;
  includeContributing: boolean;
  includeDocs: boolean;
}

export async function translateRepo(options: TranslateOptions): Promise<void> {
  const parseSpinner = ora({
    text: 'Parsing repository URL...',
    spinner: 'dots',
    color: 'cyan',
  }).start();
  
  const repoInfo = parseRepoUrl(options.repoUrl);
  if (!repoInfo) {
    parseSpinner.fail('Invalid repository URL');
    throw new Error('Invalid repository URL. Use format: https://github.com/owner/repo or owner/repo');
  }
  parseSpinner.succeed(`Repository: ${chalk.bold.cyan(repoInfo.owner + '/' + repoInfo.repo)}`);

  const fetchSpinner = ora({
    text: 'Fetching repository files...',
    spinner: 'bouncingBar',
    color: 'blue',
  }).start();
  const files: Array<{ name: string; path: string; content: string }> = [];

  try {
    fetchSpinner.text = 'Fetching README.md...';
    const readme = await fetchReadme(repoInfo.owner, repoInfo.repo, options.token);
    if (readme) {
      fetchSpinner.text = 'Parsing README.md...';
      const parsedContent = parseAndValidateMarkdown(readme.content);
      files.push({
        name: readme.name,
        path: readme.path,
        content: parsedContent,
      });
      fetchSpinner.text = `Found README.md ${chalk.gray(`(${files.length} file${files.length !== 1 ? 's' : ''})`)}`;
    }

    if (options.includeContributing) {
      fetchSpinner.text = 'Fetching CONTRIBUTING.md...';
      const contributing = await fetchFile(repoInfo.owner, repoInfo.repo, 'CONTRIBUTING.md', options.token);
      if (contributing) {
        fetchSpinner.text = 'Parsing CONTRIBUTING.md...';
        const parsedContent = parseAndValidateMarkdown(contributing.content);
        files.push({
          name: contributing.name,
          path: contributing.path,
          content: parsedContent,
        });
        fetchSpinner.text = `Found CONTRIBUTING.md ${chalk.gray(`(${files.length} file${files.length !== 1 ? 's' : ''})`)}`;
      }
    }

    if (options.includeDocs) {
      try {
        fetchSpinner.text = 'Fetching /docs folder...';
        const docsFiles = await fetchDirectory(repoInfo.owner, repoInfo.repo, 'docs', options.token);
        fetchSpinner.text = `Parsing ${docsFiles.length} file(s) from /docs folder...`;
        files.push(...docsFiles.map(f => {
          const parsedContent = parseAndValidateMarkdown(f.content);
          return {
            name: f.name,
            path: f.path,
            content: parsedContent,
          };
        }));
        fetchSpinner.text = `Found ${docsFiles.length} file(s) in /docs folder ${chalk.gray(`(${files.length} total file${files.length !== 1 ? 's' : ''})`)}`;
      } catch (error) {
        fetchSpinner.warn('Could not fetch /docs folder');
      }
    }

    if (files.length === 0) {
      fetchSpinner.fail('No markdown files found');
      throw new Error('No markdown files found in repository');
    }

    fetchSpinner.succeed(`Found ${chalk.bold(files.length)} file(s) to translate`);
  } catch (error) {
    fetchSpinner.fail('Failed to fetch repository files');
    throw error;
  }

  const apiKey = process.env.LINGODOTDEV_API_KEY;
  if (!apiKey) {
    throw new Error(
      'LINGODOTDEV_API_KEY environment variable is required.\n\n' +
      'To get your API key:\n' +
      '1. Visit https://lingo.dev/auth\n' +
      '2. Navigate to Projects > Your Project > API Key\n' +
      '3. Copy the API key\n' +
      '4. Add it to .env file in project root:\n' +
      '   LINGODOTDEV_API_KEY="your-api-key-here"\n' +
      '   Or set as environment variable:\n' +
      '   export LINGODOTDEV_API_KEY="your-api-key-here"\n\n' +
      'Or add to ~/.zshrc or ~/.bashrc for persistence.'
    );
  }

  if (!options.languages || options.languages.length === 0) {
    throw new Error('No target languages specified');
  }

  let savedFiles: Array<{ path: string; locale: string; fileName: string }> = [];
  let translations: Array<{ fileName: string; locale: string; content: string }> = [];

  try {
    const initialQuote = getRandomQuote();
    console.log(chalk.gray('\n' + chalk.italic.yellow(`"${initialQuote.text}"`)));
    console.log(chalk.gray(`   — ${initialQuote.author}\n`));
    
    const translateSpinner = ora({
      text: `Translating ${files.length} file(s) to ${options.languages.length} language(s)...`,
      spinner: 'dots2',
      color: 'magenta',
    }).start();
    
    const quoteInterval = setInterval(() => {
      const quote = getRandomQuote();
      const maxLength = 45;
      const quoteText = quote.text.length > maxLength 
        ? quote.text.substring(0, maxLength - 3) + '...' 
        : quote.text;
      const authorText = quote.author.length > 15 
        ? quote.author.substring(0, 12) + '...' 
        : quote.author;
      
      translateSpinner.text = `${chalk.magenta('Translating...')} ${chalk.gray('|')} ${chalk.italic.yellow(`"${quoteText}"`)} ${chalk.gray(`— ${authorText}`)}`;
    }, 5000);

    try {
      translations = await translateFiles(files, options.languages, apiKey);
      clearInterval(quoteInterval);
      translateSpinner.succeed(`Translated ${chalk.bold(translations.length)} file(s)`);
    } catch (error) {
      clearInterval(quoteInterval);
      translateSpinner.fail('Translation failed');
      throw error;
    }

    const saveSpinner = ora({
      text: `Saving translated files to ${options.outputDir}...`,
      spinner: 'arrow3',
      color: 'green',
    }).start();
    savedFiles = await saveTranslatedFiles(translations, options.outputDir);
    saveSpinner.succeed(`Saved ${chalk.bold(savedFiles.length)} file(s) successfully`);

    console.log(chalk.bold('\nTranslated files:'));
    savedFiles.forEach(cf => {
      console.log(chalk.gray('  -'), chalk.cyan(cf.fileName), chalk.gray(`(${cf.locale})`));
    });
  } catch (error) {
    throw error;
  }
}
