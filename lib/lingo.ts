import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { tmpdir } from 'os';

export interface TranslatedFile {
  path: string;
  locale: string;
  content: string;
}

export async function createTempWorkspace(): Promise<string> {
  const workspaceId = uuidv4();
  const workspacePath = join(tmpdir(), `readmelingo-${workspaceId}`);
  
  await fs.mkdir(workspacePath, { recursive: true, mode: 0o700 });
  
  return workspacePath;
}

export async function writeFilesToWorkspace(
  workspace: string,
  files: Map<string, string>,
  sourceLocale: string = 'en'
): Promise<void> {
  for (const [path, content] of files.entries()) {
    const fileName = path.split('/').pop() || path;
    const localeDir = join(workspace, sourceLocale);
    const filePath = join(localeDir, fileName);
    
    await fs.mkdir(localeDir, { recursive: true, mode: 0o755 });
    await fs.writeFile(filePath, content, 'utf-8');
  }
}

export async function createI18nConfig(
  workspace: string,
  sourceLocale: string,
  targetLocales: string[],
  fileCount: number
): Promise<void> {
  if (!targetLocales || targetLocales.length === 0) {
    throw new Error('At least one target locale is required');
  }

  const includePattern = `${sourceLocale}/*.md`;

  const config = {
    $schema: 'https://lingo.dev/schema/i18n.json',
    version: '1.10',
    locale: {
      source: sourceLocale,
      targets: targetLocales,
    },
    buckets: {
      markdown: {
        include: [includePattern],
      },
    },
  };

  const configPath = join(workspace, 'i18n.json');
  await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
  
  const writtenConfig = await fs.readFile(configPath, 'utf-8');
  const parsedConfig = JSON.parse(writtenConfig);
  if (!parsedConfig.locale?.targets || parsedConfig.locale.targets.length === 0) {
    throw new Error('Failed to write valid i18n configuration');
  }
}

export async function runLingoCLI(
  workspace: string,
  apiKey: string,
  timeoutMs: number = 600000,
  onOutput?: (data: string) => void
): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn('npx', ['-y', 'lingo.dev@latest', 'run', '--force'], {
      cwd: workspace,
      env: {
        ...process.env,
        LINGODOTDEV_API_KEY: apiKey,
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';
    let lastActivity = Date.now();
    const activityCheckInterval = 120000;

    const activityMonitor = setInterval(() => {
      const timeSinceLastActivity = Date.now() - lastActivity;
      if (timeSinceLastActivity > activityCheckInterval) {
        const output = stdout || stderr || 'No output received';
        const lastOutput = output.split('\n').slice(-5).join('\n');
        reject(new Error(`Lingo CLI appears to be stuck. Last activity: ${Math.floor(timeSinceLastActivity / 1000)}s ago.\nLast output:\n${lastOutput}`));
        clearInterval(activityMonitor);
        child.kill('SIGTERM');
      }
    }, 30000);

    child.stdout?.on('data', (data) => {
      const output = data.toString();
      stdout += output;
      lastActivity = Date.now();
      if (onOutput) {
        onOutput(output);
      }
    });

    child.stderr?.on('data', (data) => {
      const output = data.toString();
      stderr += output;
      lastActivity = Date.now();
      if (onOutput) {
        onOutput(output);
      }
    });

    const timeout = setTimeout(() => {
      clearInterval(activityMonitor);
      child.kill('SIGTERM');
      setTimeout(() => {
        if (!child.killed) {
          child.kill('SIGKILL');
        }
      }, 5000);
      reject(new Error(`Lingo CLI execution timed out after ${Math.floor(timeoutMs / 1000)}s.\nOutput: ${stdout}\nErrors: ${stderr}`));
    }, timeoutMs);

    child.on('close', (code, signal) => {
      clearTimeout(timeout);
      clearInterval(activityMonitor);
      
      const combinedOutput = stdout + stderr;
      
      if (combinedOutput.includes('Authentication failed') || combinedOutput.includes('FAILED: Authentication')) {
        reject(new Error(
          'Lingo.dev authentication failed.\n\n' +
          'Your API key may be invalid or expired.\n\n' +
          'To fix this:\n' +
          '1. Visit https://lingo.dev/auth\n' +
          '2. Get a valid API key from Projects > API Key\n' +
          '3. Set it: export LINGODOTDEV_API_KEY="your-key"'
        ));
        return;
      }
      
      if (combinedOutput.includes('Failed Files') || combinedOutput.includes('❌')) {
        const failedMatch = combinedOutput.match(/\[Failed Files\]([\s\S]*?)(?=\n\n|\n\[|$)/);
        const quotaMatch = combinedOutput.match(/Maximum number of translated words.*?Please upgrade/);
        
        if (quotaMatch) {
          reject(new Error(
            'Lingo.dev free plan quota exceeded.\n\n' +
            quotaMatch[0] + '\n\n' +
            'To continue:\n' +
            '1. Visit https://lingo.dev to upgrade your plan\n' +
            '2. Or wait for your quota to reset\n' +
            '3. Or reduce the amount of content to translate'
          ));
          return;
        }
        
        if (failedMatch) {
          reject(new Error(
            'Translation failed for some files.\n\n' +
            failedMatch[0].trim() + '\n\n' +
            'Check the output above for details.'
          ));
          return;
        }
      }
      
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        const errorMsg = stderr || stdout || 'Unknown error';
        const exitInfo = code !== null ? `exit code ${code}` : `signal ${signal}`;
        reject(new Error(`Lingo CLI failed with ${exitInfo}.\nOutput: ${stdout}\nErrors: ${stderr}`));
      }
    });

    child.on('error', (error) => {
      clearTimeout(timeout);
      clearInterval(activityMonitor);
      reject(new Error(`Failed to spawn Lingo CLI: ${error.message}. Make sure Node.js and npm are installed.`));
    });
  });
}

export async function readTranslatedFiles(
  workspace: string,
  sourceFiles: string[],
  targetLocales: string[]
): Promise<TranslatedFile[]> {
  const translatedFiles: TranslatedFile[] = [];

  for (const sourceFile of sourceFiles) {
    const baseName = sourceFile.replace(/\.md$/, '');

    for (const locale of targetLocales) {
      const translatedPath = `${baseName}.${locale}.md`;
      const fullPath = join(workspace, translatedPath);
      
      try {
        await fs.access(fullPath);
        const content = await fs.readFile(fullPath, 'utf-8');
        translatedFiles.push({
          path: translatedPath,
          locale,
          content,
        });
      } catch (error) {
        const allFiles = await listWorkspaceFiles(workspace);
        const mdFiles = allFiles.filter(f => f.endsWith('.md'));
        console.warn(`Warning: Could not find translated file at ${translatedPath}`);
        console.warn(`Available markdown files in workspace: ${mdFiles.join(', ')}`);
      }
    }
  }

  return translatedFiles;
}

export async function listWorkspaceFiles(workspace: string): Promise<string[]> {
  const files: string[] = [];
  
  async function walkDir(dir: string, baseDir: string = workspace): Promise<void> {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        const relativePath = fullPath.replace(baseDir + '/', '').replace(baseDir + '\\', '');
        
        if (entry.isDirectory()) {
          await walkDir(fullPath, baseDir);
        } else {
          files.push(relativePath);
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${dir}:`, error);
    }
  }
  
  try {
    await walkDir(workspace);
  } catch (error) {
    console.error('Error listing workspace files:', error);
  }
  
  return files;
}

export async function cleanupWorkspace(workspace: string): Promise<void> {
  try {
    await fs.rm(workspace, { recursive: true, force: true });
  } catch (error) {
    console.error(`Failed to cleanup workspace ${workspace}:`, error);
  }
}

function findTranslatedFile(
  allFiles: string[],
  sourceFile: string,
  locale: string
): string | null {
  const fileName = sourceFile.split('/').pop() || sourceFile;
  const fileNameWithoutExt = fileName.replace(/\.md$/, '');
  
  const normalizedFiles = allFiles.map(f => ({
    original: f,
    normalized: f.replace(/\\/g, '/').toLowerCase()
  }));
  
  const localeLower = locale.toLowerCase();
  const fileNameLower = fileName.toLowerCase();
  const fileNameWithoutExtLower = fileNameWithoutExt.toLowerCase();
  
  const exactPatterns = [
    `${locale}/${fileName}`,
    `${locale}/${fileNameWithoutExt}.md`,
    `markdown/${locale}/${fileName}`,
    `markdown/${locale}/${fileNameWithoutExt}.md`,
  ];
  
  for (const pattern of exactPatterns) {
    const normalizedPattern = pattern.toLowerCase();
    const found = normalizedFiles.find(({ normalized }) => 
      normalized === normalizedPattern
    );
    if (found) {
      return found.original;
    }
  }
  
  const matchingFiles = normalizedFiles.filter(({ normalized }) => {
    const hasLocaleDir = normalized.includes(`/${localeLower}/`) || 
                         normalized.startsWith(`${localeLower}/`) ||
                         normalized.includes(`markdown/${localeLower}/`);
    
    if (!hasLocaleDir) {
      return false;
    }
    
    const endsWithFileName = normalized.endsWith(`/${fileNameLower}`) ||
                             normalized.endsWith(`/${fileNameWithoutExtLower}.md`) ||
                             normalized === `${localeLower}/${fileNameLower}` ||
                             normalized === `${localeLower}/${fileNameWithoutExtLower}.md` ||
                             normalized.endsWith(`markdown/${localeLower}/${fileNameLower}`) ||
                             normalized.endsWith(`markdown/${localeLower}/${fileNameWithoutExtLower}.md`);
    
    return endsWithFileName;
  });
  
  if (matchingFiles.length === 1) {
    return matchingFiles[0].original;
  }
  
  if (matchingFiles.length > 1) {
    const exactMatch = matchingFiles.find(({ normalized }) => 
      normalized === `${localeLower}/${fileNameLower}` ||
      normalized === `${localeLower}/${fileNameWithoutExtLower}.md` ||
      normalized === `markdown/${localeLower}/${fileNameLower}` ||
      normalized === `markdown/${localeLower}/${fileNameWithoutExtLower}.md`
    );
    if (exactMatch) {
      return exactMatch.original;
    }
    return matchingFiles[0].original;
  }
  
  return null;
}

export async function copyTranslatedFilesFromWorkspace(
  workspace: string,
  sourceFiles: string[],
  targetLocales: string[],
  outputDir: string
): Promise<Array<{ path: string; locale: string; fileName: string }>> {
  const copiedFiles: Array<{ path: string; locale: string; fileName: string }> = [];
  
  const allWorkspaceFiles = await listWorkspaceFiles(workspace);
  const markdownFiles = allWorkspaceFiles.filter(f => f.endsWith('.md') && !f.includes('i18n.lock'));
  
  for (const sourceFile of sourceFiles) {
    const fileName = sourceFile.split('/').pop() || sourceFile;
    const fileNameWithoutExt = fileName.replace(/\.md$/, '');

    for (const locale of targetLocales) {
      const translatedFilePath = findTranslatedFile(markdownFiles, sourceFile, locale);
      
      if (translatedFilePath) {
        const sourcePath = join(workspace, translatedFilePath);
        
        try {
          const content = await fs.readFile(sourcePath, 'utf-8');
          const outputFileName = `${fileNameWithoutExt}.${locale}.md`;
          const outputPath = join(outputDir, outputFileName);
          
          await fs.mkdir(outputDir, { recursive: true });
          await fs.writeFile(outputPath, content, 'utf-8');
          
          copiedFiles.push({
            path: outputPath,
            locale,
            fileName: outputFileName,
          });
        } catch (error) {
          console.warn(`Failed to read translated file at ${translatedFilePath}:`, error);
        }
      }
    }
  }

  if (copiedFiles.length === 0 && markdownFiles.length > 0) {
    console.warn(`No translated files matched. Found ${markdownFiles.length} markdown file(s) in workspace:`);
    markdownFiles.forEach(f => console.warn(`  - ${f}`));
    console.warn(`Looking for ${sourceFiles.length} source file(s):`);
    sourceFiles.forEach(f => console.warn(`  - ${f}`));
    console.warn(`Target locales: ${targetLocales.join(', ')}`);
    
    for (const sourceFile of sourceFiles) {
      const fileName = sourceFile.split('/').pop() || sourceFile;
      for (const locale of targetLocales) {
        const searchedPatterns = [
          `${locale}/${fileName}`,
          `${locale}/${fileName.replace(/\.md$/, '')}.md`,
        ];
        console.warn(`  Searched for: ${searchedPatterns.join(', ')}`);
      }
    }
  }

  return copiedFiles;
}


