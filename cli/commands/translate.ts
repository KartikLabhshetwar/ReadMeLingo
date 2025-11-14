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
          const includePatterns: string[] = [];

          for (const file of files) {
            fileMap.set(file.path, file.content);
            includePatterns.push(file.path);
          }

          await writeFilesToWorkspace(workspace!, fileMap);
          await createI18nConfig(workspace!, 'en', options.languages, includePatterns);
          
          log.info(`Configuration: ${options.languages.length} language(s) - ${options.languages.join(', ')}`);
          return 'Files prepared';
        },
      },
      {
        title: `Translating to ${options.languages.length} language(s)`,
        task: async () => {
          const timeoutMs = 600000;
          let lastOutput = '';
          
          await runLingoCLI(workspace!, apiKey, timeoutMs, (output) => {
            lastOutput = output;
            if (output.includes('Error') || output.includes('Failed') || output.includes('Canceled')) {
              log.warn(output.trim());
            }
          });
          return 'Translation completed';
        },
      },
      {
        title: `Copying translated files to ${options.outputDir}`,
        task: async () => {
          const sourceFilePaths = files.map(f => f.path);
          copiedFiles = await copyTranslatedFilesFromWorkspace(
            workspace!,
            sourceFilePaths,
            options.languages,
            options.outputDir
          );

          if (copiedFiles.length === 0) {
            throw new Error('Translation completed but no files were found. Check Lingo.dev output location.');
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

