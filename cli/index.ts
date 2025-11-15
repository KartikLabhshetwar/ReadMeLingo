#!/usr/bin/env node

import { config } from 'dotenv';
import { resolve, join } from 'path';
import { existsSync } from 'fs';
import { Command } from 'commander';
import { intro, outro, cancel, isCancel, text, confirm, multiselect, select, log } from '@clack/prompts';
import { translateRepo } from './commands/translate';
import * as packageJson from '../package.json';

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

const envPath = findEnvFile();
if (envPath) {
  config({ path: envPath });
} else {
  config();
}

const version = packageJson.version;

const program = new Command();

program
  .name('readmelingo')
  .description('CLI tool to translate GitHub repository documentation using Lingo.dev')
  .version(version);

async function interactiveMode() {
  intro('🌍 ReadMeLingo - Translation CLI');

  try {
    const action = await select({
      message: 'What would you like to do?',
      options: [
        { value: 'translate', label: '📝 Translate Repository Documentation', hint: 'Fetch and translate README files' },
        { value: 'exit', label: '❌ Exit', hint: 'Close the application' },
      ],
    });

    if (isCancel(action) || action === 'exit') {
      cancel('Operation cancelled.');
      process.exit(0);
    }

    if (action === 'translate') {
      await handleTranslate();
    }
  } catch (error) {
    cancel(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

async function handleTranslate() {
  const repoUrl = await text({
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

  if (isCancel(repoUrl)) {
    cancel('Operation cancelled.');
    process.exit(0);
  }

  const filesToInclude = await multiselect({
    message: 'Which files would you like to translate?',
    options: [
      { value: 'readme', label: '📄 README.md', hint: 'Main documentation file' },
      { value: 'contributing', label: '📋 CONTRIBUTING.md', hint: 'Contribution guidelines' },
      { value: 'docs', label: '📁 /docs folder', hint: 'Documentation directory' },
    ],
    required: true,
    initialValues: ['readme'],
  });

  if (isCancel(filesToInclude)) {
    cancel('Operation cancelled.');
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
    { value: 'ru', label: '🇷🇺 Russian (ru)', hint: 'Русский' },
    { value: 'ar', label: '🇸🇦 Arabic (ar)', hint: 'العربية' },
    { value: 'hi', label: '🇮🇳 Hindi (hi)', hint: 'हिन्दी' },
    { value: 'nl', label: '🇳🇱 Dutch (nl)', hint: 'Nederlands' },
    { value: 'pl', label: '🇵🇱 Polish (pl)', hint: 'Polski' },
    { value: 'tr', label: '🇹🇷 Turkish (tr)', hint: 'Türkçe' },
    { value: 'sv', label: '🇸🇪 Swedish (sv)', hint: 'Svenska' },
    { value: 'no', label: '🇳🇴 Norwegian (no)', hint: 'Norsk' },
    { value: 'da', label: '🇩🇰 Danish (da)', hint: 'Dansk' },
    { value: 'fi', label: '🇫🇮 Finnish (fi)', hint: 'Suomi' },
    { value: 'el', label: '🇬🇷 Greek (el)', hint: 'Ελληνικά' },
    { value: 'cs', label: '🇨🇿 Czech (cs)', hint: 'Čeština' },
    { value: 'ro', label: '🇷🇴 Romanian (ro)', hint: 'Română' },
    { value: 'hu', label: '🇭🇺 Hungarian (hu)', hint: 'Magyar' },
    { value: 'vi', label: '🇻🇳 Vietnamese (vi)', hint: 'Tiếng Việt' },
    { value: 'th', label: '🇹🇭 Thai (th)', hint: 'ไทย' },
    { value: 'id', label: '🇮🇩 Indonesian (id)', hint: 'Bahasa Indonesia' },
    { value: 'he', label: '🇮🇱 Hebrew (he)', hint: 'עברית' },
    { value: 'uk', label: '🇺🇦 Ukrainian (uk)', hint: 'Українська' },
    { value: 'ca', label: '🇪🇸 Catalan (ca)', hint: 'Català' },
    { value: 'bg', label: '🇧🇬 Bulgarian (bg)', hint: 'Български' },
    { value: 'hr', label: '🇭🇷 Croatian (hr)', hint: 'Hrvatski' },
    { value: 'sk', label: '🇸🇰 Slovak (sk)', hint: 'Slovenčina' },
    { value: 'sl', label: '🇸🇮 Slovenian (sl)', hint: 'Slovenščina' },
    { value: 'lt', label: '🇱🇹 Lithuanian (lt)', hint: 'Lietuvių' },
    { value: 'lv', label: '🇱🇻 Latvian (lv)', hint: 'Latviešu' },
    { value: 'et', label: '🇪🇪 Estonian (et)', hint: 'Eesti' },
    { value: 'ms', label: '🇲🇾 Malay (ms)', hint: 'Bahasa Melayu' },
    { value: 'tl', label: '🇵🇭 Filipino (tl)', hint: 'Filipino' },
  ];

  const selectedLanguages = await multiselect({
    message: 'Select target languages',
    options: languageOptions,
    required: true,
  });

  if (isCancel(selectedLanguages)) {
    cancel('Operation cancelled.');
    process.exit(0);
  }

  if (!selectedLanguages || (Array.isArray(selectedLanguages) && selectedLanguages.length === 0)) {
    cancel('No languages selected. Please select at least one language.');
    process.exit(1);
  }

  const selectedLangs = Array.isArray(selectedLanguages) ? selectedLanguages : [selectedLanguages];
  log.info(`Selected ${selectedLangs.length} language(s): ${selectedLangs.join(', ')}`);

  const outputDir = await text({
    message: 'Output directory for translated files',
    placeholder: './translations',
    initialValue: './translations',
    validate(value) {
      if (!value || value.trim().length === 0) {
        return 'Output directory is required';
      }
    },
  });

  if (isCancel(outputDir)) {
    cancel('Operation cancelled.');
    process.exit(0);
  }

  let token: string | undefined = process.env.GITHUB_TOKEN;

  if (!token) {
    const useToken = await confirm({
      message: 'Do you have a GitHub token for private repositories?',
      initialValue: false,
    });

    if (isCancel(useToken)) {
      cancel('Operation cancelled.');
      process.exit(0);
    }

    if (useToken) {
      const tokenInput = await text({
        message: 'Enter your GitHub token',
        placeholder: 'ghp_...',
        validate(value) {
          if (!value || value.trim().length === 0) {
            return 'GitHub token is required';
          }
        },
      });

      if (isCancel(tokenInput)) {
        cancel('Operation cancelled.');
        process.exit(0);
      }

      token = tokenInput as string;
    }
  }

  log.info('\nStarting translation process...\n');
  
  await translateRepo({
    repoUrl: repoUrl as string,
    token,
    languages: selectedLangs as string[],
    outputDir: outputDir as string,
    includeContributing: (filesToInclude as string[]).includes('contributing'),
    includeDocs: (filesToInclude as string[]).includes('docs'),
  });

  outro('✨ Translation completed successfully!');
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

    intro('🌍 ReadMeLingo - Translation CLI');

    try {
      let languages: string[] = [];

      if (options.languages) {
        languages = options.languages.split(',').map((l: string) => l.trim()).filter((l: string) => l.length > 0);
      }

      if (!options.languages || languages.length === 0) {
        const languageOptions = [
          { value: 'es', label: '🇪🇸 Spanish (es)' },
          { value: 'fr', label: '🇫🇷 French (fr)' },
          { value: 'de', label: '🇩🇪 German (de)' },
          { value: 'it', label: '🇮🇹 Italian (it)' },
          { value: 'pt', label: '🇵🇹 Portuguese (pt)' },
          { value: 'ja', label: '🇯🇵 Japanese (ja)' },
          { value: 'ko', label: '🇰🇷 Korean (ko)' },
          { value: 'zh', label: '🇨🇳 Chinese (zh)' },
          { value: 'ru', label: '🇷🇺 Russian (ru)' },
          { value: 'ar', label: '🇸🇦 Arabic (ar)' },
          { value: 'hi', label: '🇮🇳 Hindi (hi)' },
          { value: 'nl', label: '🇳🇱 Dutch (nl)' },
          { value: 'pl', label: '🇵🇱 Polish (pl)' },
          { value: 'tr', label: '🇹🇷 Turkish (tr)' },
          { value: 'sv', label: '🇸🇪 Swedish (sv)' },
          { value: 'no', label: '🇳🇴 Norwegian (no)' },
          { value: 'da', label: '🇩🇰 Danish (da)' },
          { value: 'fi', label: '🇫🇮 Finnish (fi)' },
          { value: 'el', label: '🇬🇷 Greek (el)' },
          { value: 'cs', label: '🇨🇿 Czech (cs)' },
          { value: 'ro', label: '🇷🇴 Romanian (ro)' },
          { value: 'hu', label: '🇭🇺 Hungarian (hu)' },
          { value: 'vi', label: '🇻🇳 Vietnamese (vi)' },
          { value: 'th', label: '🇹🇭 Thai (th)' },
          { value: 'id', label: '🇮🇩 Indonesian (id)' },
          { value: 'he', label: '🇮🇱 Hebrew (he)' },
          { value: 'uk', label: '🇺🇦 Ukrainian (uk)' },
          { value: 'ca', label: '🇪🇸 Catalan (ca)' },
          { value: 'bg', label: '🇧🇬 Bulgarian (bg)' },
          { value: 'hr', label: '🇭🇷 Croatian (hr)' },
          { value: 'sk', label: '🇸🇰 Slovak (sk)' },
          { value: 'sl', label: '🇸🇮 Slovenian (sl)' },
          { value: 'lt', label: '🇱🇹 Lithuanian (lt)' },
          { value: 'lv', label: '🇱🇻 Latvian (lv)' },
          { value: 'et', label: '🇪🇪 Estonian (et)' },
          { value: 'ms', label: '🇲🇾 Malay (ms)' },
          { value: 'tl', label: '🇵🇭 Filipino (tl)' },
        ];

        const selected = await multiselect({
          message: 'Select target languages',
          options: languageOptions,
          required: true,
        });

        if (isCancel(selected)) {
          cancel('Operation cancelled.');
          process.exit(0);
        }

        if (!selected || (Array.isArray(selected) && selected.length === 0)) {
          cancel('No languages selected. Please select at least one language.');
          process.exit(1);
        }

        languages = Array.isArray(selected) ? selected : [selected];
        log.info(`Selected ${languages.length} language(s): ${languages.join(', ')}`);
      }

      let token = options.token;
      if (!token && process.env.GITHUB_TOKEN) {
        token = process.env.GITHUB_TOKEN;
      }

      await translateRepo({
        repoUrl: options.repo,
        token,
        languages,
        outputDir: options.output || './translations',
        includeContributing: options.includeContributing,
        includeDocs: options.includeDocs,
      });

      outro('✨ Translation completed successfully!');
    } catch (error) {
      cancel(error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program
  .action(async () => {
    await interactiveMode();
  });

program.parse();
