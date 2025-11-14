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
  files: Map<string, string>
): Promise<void> {
  for (const [path, content] of files.entries()) {
    const filePath = join(workspace, path);
    const dir = dirname(filePath);
    
    await fs.mkdir(dir, { recursive: true, mode: 0o755 });
    await fs.writeFile(filePath, content, 'utf-8');
  }
}

export async function createI18nConfig(
  workspace: string,
  sourceLocale: string,
  targetLocales: string[],
  includePatterns: string[]
): Promise<void> {
  const config = {
    $schema: 'https://lingo.dev/schema/i18n.json',
    version: '1.0',
    locale: {
      source: sourceLocale,
      targets: targetLocales,
    },
    buckets: {
      markdown: {
        include: includePatterns,
        type: 'markdown',
        output: {
          mode: 'files',
        },
      },
    },
    provider: {
      default: 'lingo.dev',
    },
  };

  const configPath = join(workspace, 'i18n.json');
  await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
}

export async function runLingoCLI(
  workspace: string,
  apiKey: string,
  timeoutMs: number = 60000
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

    child.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    const timeout = setTimeout(() => {
      child.kill('SIGTERM');
      reject(new Error(`Lingo CLI execution timed out after ${timeoutMs}ms. Output: ${stdout}\nErrors: ${stderr}`));
    }, timeoutMs);

    child.on('close', (code) => {
      clearTimeout(timeout);
      
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        const errorMsg = stderr || stdout || 'Unknown error';
        reject(new Error(`Lingo CLI failed with exit code ${code}.\nOutput: ${stdout}\nErrors: ${stderr}`));
      }
    });

    child.on('error', (error) => {
      clearTimeout(timeout);
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
    const extension = '.md';
    const fileName = sourceFile.split('/').pop() || sourceFile;
    const dirPath = sourceFile.includes('/') ? sourceFile.substring(0, sourceFile.lastIndexOf('/')) : '';

    for (const locale of targetLocales) {
      const possiblePaths = [
        join(locale, sourceFile),
        join(locale, fileName),
        dirPath ? join(locale, dirPath, fileName) : join(locale, fileName),
        `${baseName}.${locale}${extension}`,
        `${baseName}.${locale}.md`,
        `${fileName.replace(/\.md$/, '')}.${locale}.md`,
        join('.lingo', locale, sourceFile),
        join('.lingo', locale, fileName),
        join('lingo', locale, sourceFile),
        join('lingo', locale, fileName),
      ];

      let found = false;
      for (const possiblePath of possiblePaths) {
        const fullPath = join(workspace, possiblePath);
        try {
          await fs.access(fullPath);
          const content = await fs.readFile(fullPath, 'utf-8');
          translatedFiles.push({
            path: sourceFile.replace(/\.md$/, `.${locale}.md`),
            locale,
            content,
          });
          found = true;
          break;
        } catch {
          continue;
        }
      }

      if (!found) {
        console.warn(`Warning: Could not find translated file for ${sourceFile} in locale ${locale}. Tried paths: ${possiblePaths.join(', ')}`);
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

