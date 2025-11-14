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
  if (!targetLocales || targetLocales.length === 0) {
    throw new Error('At least one target locale is required');
  }

  if (!includePatterns || includePatterns.length === 0) {
    throw new Error('At least one include pattern is required');
  }

  const config = {
    $schema: 'https://lingo.dev/schema/i18n.json',
    version: '1.10',
    locale: {
      source: sourceLocale,
      targets: targetLocales,
    },
    buckets: {
      markdown: {
        include: includePatterns,
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
    console.log('\n[DEBUG] Running Lingo CLI with command: npx -y lingo.dev@latest run');
    console.log('[DEBUG] Workspace:', workspace);
    console.log('[DEBUG] API Key set:', !!apiKey);
    
    const child = spawn('npx', ['-y', 'lingo.dev@latest', 'run'], {
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
    const activityCheckInterval = 30000;

    const activityMonitor = setInterval(() => {
      const timeSinceLastActivity = Date.now() - lastActivity;
      if (timeSinceLastActivity > activityCheckInterval) {
        const output = stdout || stderr || 'No output received';
        reject(new Error(`Lingo CLI appears to be stuck. Last activity: ${Math.floor(timeSinceLastActivity / 1000)}s ago.\nOutput so far:\n${output}`));
        clearInterval(activityMonitor);
        child.kill('SIGTERM');
      }
    }, activityCheckInterval);

    child.stdout?.on('data', (data) => {
      const output = data.toString();
      stdout += output;
      lastActivity = Date.now();
      console.log('[LINGO STDOUT]', output);
      if (onOutput) {
        onOutput(output);
      }
    });

    child.stderr?.on('data', (data) => {
      const output = data.toString();
      stderr += output;
      lastActivity = Date.now();
      console.log('[LINGO STDERR]', output);
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
      
      console.log('[DEBUG] Lingo CLI closed with code:', code, 'signal:', signal);
      console.log('[DEBUG] Full stdout:', stdout);
      console.log('[DEBUG] Full stderr:', stderr);
      
      const combinedOutput = stdout + stderr;
      
      if (combinedOutput.includes('Authentication failed') || combinedOutput.includes('FAILED: Authentication')) {
        reject(new Error(
          'Lingo.dev authentication failed.\n\n' +
          'Your API key may be invalid or expired.\n\n' +
          'To fix this:\n' +
          '1. Visit https://lingo.dev/auth\n' +
          '2. Get a valid API key from Projects > API Key\n' +
          '3. Set it: export LINGODOTDEV_API_KEY="your-key"\n\n' +
          `Full output:\n${combinedOutput}`
        ));
        return;
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

export async function copyTranslatedFilesFromWorkspace(
  workspace: string,
  sourceFiles: string[],
  targetLocales: string[],
  outputDir: string
): Promise<Array<{ path: string; locale: string; fileName: string }>> {
  const copiedFiles: Array<{ path: string; locale: string; fileName: string }> = [];

  console.log('\n[DEBUG] Listing all files in workspace before copying:');
  const allWorkspaceFiles = await listWorkspaceFiles(workspace);
  console.log('[DEBUG] All files:', allWorkspaceFiles);
  
  for (const sourceFile of sourceFiles) {
    const fileName = sourceFile.split('/').pop() || sourceFile;
    const baseName = sourceFile.replace(/\.md$/, '');
    const fileNameWithoutExt = fileName.replace(/\.md$/, '');

    console.log(`\n[DEBUG] Processing source file: ${sourceFile}`);
    console.log(`[DEBUG] baseName: ${baseName}, fileName: ${fileName}`);

    for (const locale of targetLocales) {
      const translatedFileName = `${baseName}.${locale}.md`;
      const sourcePath = join(workspace, translatedFileName);
      
      console.log(`[DEBUG] Looking for translated file at: ${sourcePath}`);
      
      try {
        await fs.access(sourcePath);
        const content = await fs.readFile(sourcePath, 'utf-8');
        const outputFileName = `${fileNameWithoutExt}.${locale}.md`;
        const outputPath = join(outputDir, outputFileName);
        
        await fs.mkdir(outputDir, { recursive: true });
        await fs.writeFile(outputPath, content, 'utf-8');
        
        console.log(`[DEBUG] Successfully copied ${translatedFileName} to ${outputPath}`);
        
        copiedFiles.push({
          path: outputPath,
          locale,
          fileName: outputFileName,
        });
      } catch (error) {
        const allFiles = await listWorkspaceFiles(workspace);
        const mdFiles = allFiles.filter(f => f.endsWith('.md'));
        console.warn(`Warning: Could not find translated file for ${sourceFile} in locale ${locale}`);
        console.warn(`Available markdown files in workspace: ${mdFiles.join(', ')}`);
      }
    }
  }

  return copiedFiles;
}

