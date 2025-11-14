#!/usr/bin/env node

import { Command } from 'commander';
import { intro, outro, cancel, isCancel, text, confirm, multiselect } from '@clack/prompts';
import { translateRepo } from './commands/translate';
import * as packageJson from '../package.json';

const version = packageJson.version;

const program = new Command();

program
  .name('readmelingo')
  .description('CLI tool to translate GitHub repository documentation using Lingo.dev')
  .version(version);

program
  .command('translate')
  .description('Translate repository documentation files')
  .option('-r, --repo <repo>', 'GitHub repository URL or owner/repo')
  .option('-t, --token <token>', 'GitHub personal access token (for private repos)')
  .option('-l, --languages <languages>', 'Comma-separated list of target languages (default: es,fr,de)')
  .option('-o, --output <dir>', 'Output directory for translated files (default: ./translations)')
  .option('--include-contributing', 'Include CONTRIBUTING.md', false)
  .option('--include-docs', 'Include /docs folder', false)
  .action(async (options) => {
    intro('ReadMeLingo - Translation CLI');

    try {
      let repoUrl = options.repo;
      if (!repoUrl) {
        repoUrl = await text({
          message: 'Enter GitHub repository URL or owner/repo',
          placeholder: 'owner/repo or https://github.com/owner/repo',
          validate(value) {
            if (!value || value.trim().length === 0) {
              return 'Repository URL is required';
            }
          },
        });

        if (isCancel(repoUrl)) {
          cancel('Operation cancelled.');
          process.exit(0);
        }
      }

      let languages = options.languages
        ? options.languages.split(',').map((l: string) => l.trim())
        : null;

      if (!languages) {
        const languageOptions = [
          { value: 'es', label: 'Spanish (es)' },
          { value: 'fr', label: 'French (fr)' },
          { value: 'de', label: 'German (de)' },
          { value: 'it', label: 'Italian (it)' },
          { value: 'pt', label: 'Portuguese (pt)' },
          { value: 'ja', label: 'Japanese (ja)' },
          { value: 'ko', label: 'Korean (ko)' },
          { value: 'zh', label: 'Chinese (zh)' },
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

        languages = selected as string[];
      }

      let token = options.token;
      if (!token && process.env.GITHUB_TOKEN) {
        token = process.env.GITHUB_TOKEN;
      }

      let includeContributing = options.includeContributing;
      if (includeContributing === undefined) {
        const shouldInclude = await confirm({
          message: 'Include CONTRIBUTING.md?',
          initialValue: false,
        });

        if (isCancel(shouldInclude)) {
          cancel('Operation cancelled.');
          process.exit(0);
        }

        includeContributing = shouldInclude as boolean;
      }

      let includeDocs = options.includeDocs;
      if (includeDocs === undefined) {
        const shouldInclude = await confirm({
          message: 'Include /docs folder?',
          initialValue: false,
        });

        if (isCancel(shouldInclude)) {
          cancel('Operation cancelled.');
          process.exit(0);
        }

        includeDocs = shouldInclude as boolean;
      }

      await translateRepo({
        repoUrl: repoUrl as string,
        token,
        languages,
        outputDir: options.output || './translations',
        includeContributing,
        includeDocs,
      });

      outro('✨ Translation completed successfully!');
    } catch (error) {
      cancel(error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program.parse();

