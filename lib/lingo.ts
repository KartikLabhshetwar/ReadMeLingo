import { promises as fs } from 'fs';
import { join } from 'path';
import { LingoDotDevEngine } from 'lingo.dev/sdk';
import type { LocaleCode } from 'lingo.dev/spec';

export interface TranslatedFile {
  path: string;
  locale: string;
  content: string;
}

export interface TranslationResult {
  fileName: string;
  locale: string;
  content: string;
}

export async function translateFiles(
  files: Array<{ name: string; path: string; content: string }>,
  targetLocales: string[],
  apiKey: string,
  sourceLocale: string = 'en'
): Promise<TranslationResult[]> {
  if (!apiKey || apiKey.length < 20 || !apiKey.includes('_')) {
    throw new Error(
      'Invalid LINGODOTDEV_API_KEY format.\n' +
      'API key should be in format "api_..." or "lingo_...".\n' +
      'Please check your API key at https://lingo.dev/auth'
    );
  }

  const engine = new LingoDotDevEngine({
    apiKey,
    batchSize: 100,
    idealBatchItemSize: 1000,
  });

  const results: TranslationResult[] = [];

  for (const file of files) {
    try {
      const translatedContents = await engine.batchLocalizeText(file.content, {
        sourceLocale: sourceLocale as LocaleCode,
        targetLocales: targetLocales as LocaleCode[],
      });

      for (let i = 0; i < targetLocales.length; i++) {
        results.push({
          fileName: file.name,
          locale: targetLocales[i],
          content: translatedContents[i],
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage.includes('Authentication') || errorMessage.includes('auth')) {
        throw new Error(
          'Lingo.dev authentication failed.\n\n' +
          'Your API key may be invalid or expired.\n\n' +
          'To fix this:\n' +
          '1. Visit https://lingo.dev/auth\n' +
          '2. Get a valid API key from Projects > API Key\n' +
          '3. Set it: export LINGODOTDEV_API_KEY="your-key"'
        );
      }

      if (errorMessage.includes('quota') || errorMessage.includes('limit') || errorMessage.includes('Maximum')) {
        throw new Error(
          'Lingo.dev quota exceeded.\n\n' +
          errorMessage + '\n\n' +
          'To continue:\n' +
          '1. Visit https://lingo.dev to upgrade your plan\n' +
          '2. Or wait for your quota to reset\n' +
          '3. Or reduce the amount of content to translate'
        );
      }

      throw new Error(
        `Translation failed for ${file.name}.\n` +
        `Error: ${errorMessage}`
      );
    }
  }

  return results;
}

export async function saveTranslatedFiles(
  translations: TranslationResult[],
  outputDir: string
): Promise<Array<{ path: string; locale: string; fileName: string }>> {
  const savedFiles: Array<{ path: string; locale: string; fileName: string }> = [];

  await fs.mkdir(outputDir, { recursive: true });

  for (const translation of translations) {
    const fileNameWithoutExt = translation.fileName.replace(/\.md$/, '');
    const outputFileName = `${fileNameWithoutExt}.${translation.locale}.md`;
    const outputPath = join(outputDir, outputFileName);

    await fs.writeFile(outputPath, translation.content, 'utf-8');

    savedFiles.push({
      path: outputPath,
      locale: translation.locale,
      fileName: outputFileName,
    });
  }

  return savedFiles;
}
