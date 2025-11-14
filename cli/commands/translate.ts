import { spinner, log, tasks } from '@clack/prompts';
import { promises as fs } from 'fs';
import { join } from 'path';
import { parseRepoUrl, fetchReadme, fetchFile, fetchDirectory } from '../../lib/github';
import {
  createTempWorkspace,
  writeFilesToWorkspace,
  createI18nConfig,
  runLingoCLI,
  readTranslatedFiles,
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
      files.push({
        name: readme.name,
        path: readme.path,
        content: readme.content,
        size: readme.size,
      });
    }

    if (options.includeContributing) {
      const contributing = await fetchFile(repoInfo.owner, repoInfo.repo, 'CONTRIBUTING.md', options.token);
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
        const docsFiles = await fetchDirectory(repoInfo.owner, repoInfo.repo, 'docs', options.token);
        files.push(...docsFiles.map(f => ({
          name: f.name,
          path: f.path,
          content: f.content,
          size: f.size,
        })));
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
    throw new Error('LINGODOTDEV_API_KEY environment variable is required');
  }

  let workspace: string | null = null;
  let translatedFiles: Array<{ path: string; content: string; locale: string }> = [];

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
          const fileMap = new Map<string, string>();
          const includePatterns: string[] = [];

          for (const file of files) {
            fileMap.set(file.path, file.content);
            includePatterns.push(file.path);
          }

          await writeFilesToWorkspace(workspace!, fileMap);
          await createI18nConfig(workspace!, 'en', options.languages, includePatterns);
          return 'Files prepared';
        },
      },
      {
        title: `Translating to ${options.languages.length} language(s)`,
        task: async () => {
          await runLingoCLI(workspace!, apiKey, 120000);
          return 'Translation completed';
        },
      },
      {
        title: 'Reading translated files',
        task: async () => {
          const sourceFilePaths = files.map(f => f.path);
          translatedFiles = await readTranslatedFiles(workspace!, sourceFilePaths, options.languages);

          if (translatedFiles.length === 0) {
            throw new Error('Translation completed but no files were generated. Check Lingo.dev configuration.');
          }

          return `Generated ${translatedFiles.length} translation(s)`;
        },
      },
      {
        title: `Saving files to ${options.outputDir}`,
        task: async () => {
          await fs.mkdir(options.outputDir, { recursive: true });

          for (const translatedFile of translatedFiles) {
            const sourceFileName = translatedFile.path.split('/').pop() || 'README.md';
            const baseName = sourceFileName.replace(/\.md$/, '').replace(/\.\w+$/, '');
            const outputFileName = `${baseName}.${translatedFile.locale}.md`;
            const outputPath = join(options.outputDir, outputFileName);
            
            await fs.writeFile(outputPath, translatedFile.content, 'utf-8');
          }

          log.success(`Files saved to ${options.outputDir}`);
          log.info('\nTranslated files:');
          translatedFiles.forEach(tf => {
            const sourceFileName = tf.path.split('/').pop() || 'README.md';
            const baseName = sourceFileName.replace(/\.md$/, '').replace(/\.\w+$/, '');
            const outputFileName = `${baseName}.${tf.locale}.md`;
            log.step(`${outputFileName} (${tf.locale})`);
          });

          return `Files saved successfully`;
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

