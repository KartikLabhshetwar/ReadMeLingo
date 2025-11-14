import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { join } from 'path';
import {
  createTempWorkspace,
  writeFilesToWorkspace,
  createI18nConfig,
  runLingoCLI,
  readTranslatedFiles,
  cleanupWorkspace,
  listWorkspaceFiles,
} from '@/lib/lingo';

export async function POST(request: NextRequest) {
  let workspace: string | null = null;

  try {
    const body = await request.json();
    const { files, targetLocales, sourceLocale = 'en' } = body;

    if (!files || !Array.isArray(files) || files.length === 0) {
      return NextResponse.json(
        { error: 'Files array is required' },
        { status: 400 }
      );
    }

    if (!targetLocales || !Array.isArray(targetLocales) || targetLocales.length === 0) {
      return NextResponse.json(
        { error: 'Target locales array is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.LINGODOTDEV_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Lingo.dev API key not configured' },
        { status: 500 }
      );
    }

    workspace = await createTempWorkspace();

    const fileMap = new Map<string, string>();
    const includePatterns: string[] = [];

    for (const file of files) {
      fileMap.set(file.path, file.content);
      includePatterns.push(file.path);
    }

    await writeFilesToWorkspace(workspace, fileMap);
    await createI18nConfig(workspace, sourceLocale, targetLocales, includePatterns);

    try {
      const cliResult = await runLingoCLI(workspace, apiKey, 60000);
      console.log('Lingo CLI output:', cliResult.stdout);
      if (cliResult.stderr) {
        console.warn('Lingo CLI warnings:', cliResult.stderr);
      }
    } catch (error) {
      console.error('Lingo CLI error:', error);
      const workspaceFiles = await listWorkspaceFiles(workspace);
      console.log('Files in workspace after CLI failure:', workspaceFiles);
      throw error;
    }

    const workspaceFiles = await listWorkspaceFiles(workspace);
    console.log('Files in workspace after translation:', workspaceFiles);

    const sourceFilePaths = files.map((f: { path: string }) => f.path);
    let translatedFiles = await readTranslatedFiles(
      workspace,
      sourceFilePaths,
      targetLocales
    );

    if (translatedFiles.length === 0) {
      console.warn('No translated files found in workspace. Files present:', workspaceFiles);
      console.warn('Attempting to read from locale directories...');
      
      for (const locale of targetLocales) {
        const localeDir = join(workspace, locale);
        try {
          const localeFiles = await fs.readdir(localeDir, { recursive: true, withFileTypes: true });
          console.log(`Found ${localeFiles.length} items in ${locale} directory`);
          
          for (const file of files) {
            const localeFilePath = join(localeDir, file.path);
            try {
              const content = await fs.readFile(localeFilePath, 'utf-8');
              translatedFiles.push({
                path: file.path.replace(/\.md$/, `.${locale}.md`),
                locale,
                content,
              });
            } catch {
              continue;
            }
          }
        } catch (error) {
          console.warn(`Locale directory ${localeDir} not found or not accessible`);
        }
      }
    }

    if (translatedFiles.length === 0) {
      console.error('No translated files found after all attempts. Workspace contents:', workspaceFiles);
      throw new Error('No translated files were generated. Lingo.dev may be using cache without writing files. Try using --force flag or check your i18n.json configuration.');
    }

    return NextResponse.json({
      success: true,
      translatedFiles: translatedFiles.map(tf => ({
        path: tf.path,
        locale: tf.locale,
        content: tf.content,
      })),
    });
  } catch (error) {
    console.error('Error translating files:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to translate files',
      },
      { status: 500 }
    );
  } finally {
    if (workspace) {
      await cleanupWorkspace(workspace);
    }
  }
}

