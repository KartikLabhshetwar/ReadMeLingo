import { spinner, log, tasks } from '@clack/prompts';
import { parseRepoUrl, fetchReadme, fetchFile, fetchDirectory } from '../../lib/github';
import { parseAndValidateMarkdown } from '../../lib/markdown';
import { translateFiles, saveTranslatedFiles } from '../../lib/lingo';

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
  const files: Array<{ name: string; path: string; content: string }> = [];

  try {
    const readme = await fetchReadme(repoInfo.owner, repoInfo.repo, options.token);
    if (readme) {
      const parsedContent = parseAndValidateMarkdown(readme.content);
      files.push({
        name: readme.name,
        path: readme.path,
        content: parsedContent,
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

  if (!options.languages || options.languages.length === 0) {
    throw new Error('No target languages specified');
  }

  let savedFiles: Array<{ path: string; locale: string; fileName: string }> = [];
  let translations: Array<{ fileName: string; locale: string; content: string }> = [];

  try {
    await tasks([
      {
        title: `Translating ${files.length} file(s) to ${options.languages.length} language(s)`,
        task: async () => {
          translations = await translateFiles(files, options.languages, apiKey);
          log.info(`Translated ${translations.length} file(s)`);
          return 'Translation completed';
        },
      },
      {
        title: `Saving translated files to ${options.outputDir}`,
        task: async () => {
          savedFiles = await saveTranslatedFiles(translations, options.outputDir);
          
          log.success(`Files saved to ${options.outputDir}`);
          log.info('\nTranslated files:');
          savedFiles.forEach(cf => {
            log.step(`${cf.fileName} (${cf.locale})`);
          });

          return `Saved ${savedFiles.length} file(s) successfully`;
        },
      },
    ]);
  } catch (error) {
    throw error;
  }
}
