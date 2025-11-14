import { spinner, log, tasks } from '@clack/prompts';
import { parseRepoUrl, fetchReadme, fetchFile, fetchDirectory } from '../../lib/github';
import { parseAndValidateMarkdown } from '../../lib/markdown';
import {
  createTempWorkspace,
  writeFilesToWorkspace,
  createI18nConfig,
  runLingoCLI,
  copyTranslatedFilesFromWorkspace,
  cleanupWorkspace,
} from '../../lib/lingo';

interface TranslateOptions {
  repoUrl: string;
  token?: string;
  languages: string[];
  outputDir: string;
  includeContributing: boolean;
  includeDocs: boolean;
}

export async function translateRepo(options: TranslateOptions): Promise<void> {
  const s = spinner();

  s.start('Parsing repository URL...');
  const repoInfo = parseRepoUrl(options.repoUrl);
  if (!repoInfo) {
    s.stop('Invalid repository URL');
    throw new Error('Invalid repository URL. Use format: https://github.com/owner/repo or owner/repo');
  }
  s.stop(`Repository: ${repoInfo.owner}/${repoInfo.repo}`);

  s.start('Fetching repository files...');
  const files: Array<{ name: string; path: string; content: string; size: number }> = [];

  try {
    const readme = await fetchReadme(repoInfo.owner, repoInfo.repo, options.token);
    if (readme) {
      const parsedContent = parseAndValidateMarkdown(readme.content);
      files.push({
        name: readme.name,
        path: readme.path,
        content: parsedContent,
        size: readme.size,
      });
    }

    if (options.includeContributing) {
      const contributing = await fetchFile(repoInfo.owner, repoInfo.repo, 'CONTRIBUTING.md', options.token);
      if (contributing) {
        const parsedContent = parseAndValidateMarkdown(contributing.content);
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
        const docsFiles = await fetchDirectory(repoInfo.owner, repoInfo.repo, 'docs', options.token);
        files.push(...docsFiles.map(f => {
          const parsedContent = parseAndValidateMarkdown(f.content);
          return {
            name: f.name,
            path: f.path,
            content: parsedContent,
            size: f.size,
          };
        }));
      } catch (error) {
        log.warn('Could not fetch /docs folder');
      }
    }

    if (files.length === 0) {
      s.stop('No markdown files found');
      throw new Error('No markdown files found in repository');
    }

    s.stop(`Found ${files.length} file(s) to translate`);
  } catch (error) {
    s.stop('Failed to fetch repository files');
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
  
  if (apiKey.length < 20 || !apiKey.includes('_')) {
    throw new Error(
      'Invalid LINGODOTDEV_API_KEY format.\n' +
      'API key should be in format "api_..." or "lingo_...".\n' +
      'Please check your API key at https://lingo.dev/auth'
    );
  }

  let workspace: string | null = null;
  let copiedFiles: Array<{ path: string; locale: string; fileName: string }> = [];

  try {
    await tasks([
      {
        title: 'Creating temporary workspace',
        task: async () => {
          workspace = await createTempWorkspace();
          return 'Workspace created';
        },
      },
      {
        title: 'Preparing files for translation',
        task: async () => {
          if (!options.languages || options.languages.length === 0) {
            throw new Error('No target languages specified');
          }

          const fileMap = new Map<string, string>();
          const sourceLocale = 'en';

          for (const file of files) {
            const fileName = file.path.split('/').pop() || file.path;
            fileMap.set(fileName, file.content);
          }

          await writeFilesToWorkspace(workspace!, fileMap, sourceLocale);
          await createI18nConfig(workspace!, sourceLocale, options.languages, files.length);
          
          const { promises: fs } = await import('fs');
          const { join } = await import('path');
          const configPath = join(workspace!, 'i18n.json');
          const configContent = await fs.readFile(configPath, 'utf-8');
          log.info(`i18n.json configuration:\n${configContent}`);
          
          log.info(`Configuration: ${options.languages.length} language(s) - ${options.languages.join(', ')}`);
          return 'Files prepared';
        },
      },
      {
        title: `Translating to ${options.languages.length} language(s)`,
        task: async () => {
          const timeoutMs = 600000;
          let allOutput = '';
          
          const result = await runLingoCLI(workspace!, apiKey, timeoutMs, (output) => {
            allOutput += output;
            if (output.includes('Error') || output.includes('Failed') || output.includes('Canceled')) {
              log.warn(output.trim());
            }
          });
          
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          if (result.stdout) {
            const stdoutLines = result.stdout.split('\n').filter(l => l.trim());
            const hasSuccess = stdoutLines.some(l => 
              l.includes('completed') || 
              l.includes('✅') || 
              l.includes('Success') ||
              l.includes('translated')
            );
            if (!hasSuccess && stdoutLines.length > 0) {
              log.info('Lingo.dev CLI output:');
              stdoutLines.slice(-10).forEach(line => log.info(`  ${line}`));
            }
          }
          
          const combinedOutput = result.stdout + result.stderr;
          
          if (combinedOutput.includes('No changes detected') || combinedOutput.includes('skipped')) {
            log.warn('Translation may have been skipped - no changes detected');
          }
          
          const { listWorkspaceFiles } = await import('../../lib/lingo');
          const filesAfterTranslation = await listWorkspaceFiles(workspace!);
          const mdFilesAfter = filesAfterTranslation.filter(f => f.endsWith('.md') && !f.includes('i18n.lock'));
          
          if (mdFilesAfter.length > 0) {
            log.info(`Files in workspace after translation: ${mdFilesAfter.join(', ')}`);
          }
          
          return 'Translation completed';
        },
      },
      {
        title: `Copying translated files to ${options.outputDir}`,
        task: async () => {
          const { listWorkspaceFiles } = await import('../../lib/lingo');
          const allFiles = await listWorkspaceFiles(workspace!);
          const mdFiles = allFiles.filter(f => f.endsWith('.md') && !f.includes('i18n.lock'));
          
          log.info(`Workspace contains ${allFiles.length} file(s) total`);
          if (mdFiles.length > 0) {
            log.info(`Found ${mdFiles.length} markdown file(s): ${mdFiles.join(', ')}`);
          } else {
            log.warn('No markdown files found in workspace');
          }
          
          const sourceFileNames = files.map(f => {
            const fileName = f.path.split('/').pop() || f.path;
            return fileName;
          });
          
          log.info(`Looking for translations of: ${sourceFileNames.join(', ')}`);
          log.info(`Target locales: ${options.languages.join(', ')}`);
          
          copiedFiles = await copyTranslatedFilesFromWorkspace(
            workspace!,
            sourceFileNames,
            options.languages,
            options.outputDir
          );

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

          log.success(`Files copied to ${options.outputDir}`);
          log.info('\nTranslated files:');
          copiedFiles.forEach(cf => {
            log.step(`${cf.fileName} (${cf.locale})`);
          });

          return `Copied ${copiedFiles.length} file(s) successfully`;
        },
      },
    ]);

  } catch (error) {
    throw error;
  } finally {
    if (workspace) {
      await cleanupWorkspace(workspace);
    }
  }
}

