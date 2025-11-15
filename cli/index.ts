#!/usr/bin/env node

import { config } from 'dotenv';
import { resolve, join } from 'path';
import { existsSync } from 'fs';
import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { translateRepo } from './commands/translate';
import { readFileSync } from 'fs';

const findEnvFile = (): string | undefined => {
  const possiblePaths = [
    join(process.cwd(), '.env'),
    resolve(__dirname, '../../.env'),
    resolve(__dirname, '../.env'),
  ];

  for (const envPath of possiblePaths) {
    if (existsSync(envPath)) {
      return envPath;
    }
  }
  return undefined;
};

const getVersion = (): string => {
  const possiblePaths = [
    resolve(__dirname, '../../package.json'),
    resolve(__dirname, '../package.json'),
    join(process.cwd(), 'package.json'),
  ];

  for (const pkgPath of possiblePaths) {
    if (existsSync(pkgPath)) {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
      return pkg.version || '0.1.0';
    }
  }
  return '0.1.0';
};

const envPath = findEnvFile();
if (envPath) {
  config({ path: envPath });
} else {
  config();
}

const version = getVersion();

const program = new Command();

program
  .name('readmelingoo')
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

function validateRepoUrl(value: string): boolean | string {
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

function validateOutputDir(value: string): boolean | string {
  if (!value || value.trim().length === 0) {
    return 'Output directory is required';
  }
  return true;
}

function validateGitHubToken(value: string): boolean | string {
  if (!value || value.trim().length === 0) {
    return 'GitHub token is required';
  }
  if (!value.startsWith('ghp_') && !value.startsWith('gho_') && !value.startsWith('ghu_') && !value.startsWith('ghs_') && !value.startsWith('ghr_')) {
    return 'Invalid GitHub token format. Token should start with ghp_, gho_, ghu_, ghs_, or ghr_';
  }
  return true;
}

function printWelcome() {
  const logo = chalk.bold.cyan(`
+----------------------------------------------------------------------------------------------+
|                                                                                              |
|                                                                                              |
|  ${chalk.bold.cyan('██████╗ ███████╗ █████╗ ██████╗ ███╗   ███╗███████╗██╗     ██╗███╗   ██╗ ██████╗  ██████╗ ')}  |
|  ${chalk.bold.cyan('██╔══██╗██╔════╝██╔══██╗██╔══██╗████╗ ████║██╔════╝██║     ██║████╗  ██║██╔════╝ ██╔═══██╗')}  |
|  ${chalk.bold.cyan('██████╔╝█████╗  ███████║██║  ██║██╔████╔██║█████╗  ██║     ██║██╔██╗ ██║██║  ███╗██║   ██║')}  |
|  ${chalk.bold.cyan('██╔══██╗██╔══╝  ██╔══██║██║  ██║██║╚██╔╝██║██╔══╝  ██║     ██║██║╚██╗██║██║   ██║██║   ██║')}  |
|  ${chalk.bold.cyan('██║  ██║███████╗██║  ██║██████╔╝██║ ╚═╝ ██║███████╗███████╗██║██║ ╚████║╚██████╔╝╚██████╔╝')}  |
|  ${chalk.bold.cyan('╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝ ╚═╝     ╚═╝╚══════╝╚══════╝╚═╝╚═╝  ╚═══╝ ╚═════╝  ╚═════╝ ')}  |
|                                                                                              |
|                                                                                              |
+----------------------------------------------------------------------------------------------+
`);
  console.log(logo);
  console.log(chalk.gray('  Translate GitHub documentation into 40+ languages\n'));
}

function printSuccess(message: string) {
  console.log(chalk.green('[SUCCESS]'), chalk.bold(message));
}

function printError(message: string) {
  console.log(chalk.red('[ERROR]'), chalk.bold(message));
}

function printInfo(message: string) {
  console.log(chalk.blue('[INFO]'), message);
}

async function interactiveMode() {
  printWelcome();

  try {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: 'Translate Repository Documentation', value: 'translate' },
          { name: 'Exit', value: 'exit' },
        ],
      },
    ]);

    if (action === 'exit') {
      console.log(chalk.gray('\nGoodbye!\n'));
      process.exit(0);
    }

    if (action === 'translate') {
      await handleTranslate();
    }
  } catch (error) {
    if (error && typeof error === 'object' && 'isTtyError' in error) {
      printError('Prompt couldn\'t be rendered in the current environment');
    } else {
      printError(error instanceof Error ? error.message : String(error));
    }
    process.exit(1);
  }
}

async function handleTranslate() {
  try {
    const { repoUrl } = await inquirer.prompt([
      {
        type: 'input',
        name: 'repoUrl',
        message: 'Enter GitHub repository URL or owner/repo',
        default: '',
        validate: validateRepoUrl,
        transformer: (input: string) => {
          return input.trim();
        },
      },
    ]);

    const { filesToInclude } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'filesToInclude',
        message: 'Which files would you like to translate?',
        choices: [
          { name: 'README.md (Main documentation file)', value: 'readme', checked: true },
          { name: 'CONTRIBUTING.md (Contribution guidelines)', value: 'contributing' },
          { name: '/docs folder (Documentation directory)', value: 'docs' },
        ],
        validate: (answer: string[]) => {
          if (answer.length === 0) {
            return 'Please select at least one file type to translate';
          }
          return true;
        },
      },
    ]);

    const { selectedLanguages } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selectedLanguages',
        message: 'Select target languages (use space to select, arrow keys to navigate)',
        choices: LANGUAGE_OPTIONS,
        pageSize: 15,
        validate: (answer: string[]) => {
          if (answer.length === 0) {
            return 'Please select at least one language';
          }
          return true;
        },
      },
    ]);

    printInfo(`Selected ${selectedLanguages.length} language(s): ${selectedLanguages.join(', ')}\n`);

    const { outputDir } = await inquirer.prompt([
      {
        type: 'input',
        name: 'outputDir',
        message: 'Output directory for translated files',
        default: './translations',
        validate: validateOutputDir,
      },
    ]);

    let token: string | undefined = process.env.GITHUB_TOKEN;

    if (!token) {
      const { useToken } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'useToken',
          message: 'Do you have a GitHub token for private repositories?',
          default: false,
        },
      ]);

      if (useToken) {
        const { tokenInput } = await inquirer.prompt([
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
    } else {
      printInfo('Using GitHub token from environment variable\n');
    }

    console.log(chalk.bold('\nStarting translation process...\n'));

    await translateRepo({
      repoUrl: repoUrl.trim(),
      token,
      languages: selectedLanguages,
      outputDir: outputDir.trim(),
      includeContributing: filesToInclude.includes('contributing'),
      includeDocs: filesToInclude.includes('docs'),
    });

    console.log(chalk.bold.green('\n✨ Translation completed successfully!\n'));
  } catch (error) {
    if (error && typeof error === 'object' && 'isTtyError' in error) {
      printError('Prompt couldn\'t be rendered in the current environment');
    } else {
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
      let languages: string[] = [];

      if (options.languages) {
        languages = options.languages.split(',').map((l: string) => l.trim()).filter((l: string) => l.length > 0);
      }

      if (!options.languages || languages.length === 0) {
        const { selectedLanguages } = await inquirer.prompt([
          {
            type: 'checkbox',
            name: 'selectedLanguages',
            message: 'Select target languages',
            choices: LANGUAGE_OPTIONS,
            pageSize: 15,
            validate: (answer: string[]) => {
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

      console.log(chalk.bold('\nStarting translation process...\n'));

      await translateRepo({
        repoUrl: options.repo,
        token,
        languages,
        outputDir: options.output || './translations',
        includeContributing: options.includeContributing,
        includeDocs: options.includeDocs,
      });

      console.log(chalk.bold.green('\n✨ Translation completed successfully!\n'));
    } catch (error) {
      if (error && typeof error === 'object' && 'isTtyError' in error) {
        printError('Prompt couldn\'t be rendered in the current environment');
      } else {
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
