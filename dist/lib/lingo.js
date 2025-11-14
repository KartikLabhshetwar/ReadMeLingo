"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTempWorkspace = createTempWorkspace;
exports.writeFilesToWorkspace = writeFilesToWorkspace;
exports.createI18nConfig = createI18nConfig;
exports.runLingoCLI = runLingoCLI;
exports.readTranslatedFiles = readTranslatedFiles;
exports.listWorkspaceFiles = listWorkspaceFiles;
exports.cleanupWorkspace = cleanupWorkspace;
exports.copyTranslatedFilesFromWorkspace = copyTranslatedFilesFromWorkspace;
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const path_1 = require("path");
const uuid_1 = require("uuid");
const os_1 = require("os");
async function createTempWorkspace() {
    const workspaceId = (0, uuid_1.v4)();
    const workspacePath = (0, path_1.join)((0, os_1.tmpdir)(), `readmelingo-${workspaceId}`);
    await fs_1.promises.mkdir(workspacePath, { recursive: true, mode: 0o700 });
    return workspacePath;
}
async function writeFilesToWorkspace(workspace, files) {
    for (const [path, content] of files.entries()) {
        const filePath = (0, path_1.join)(workspace, path);
        const dir = (0, path_1.dirname)(filePath);
        await fs_1.promises.mkdir(dir, { recursive: true, mode: 0o755 });
        await fs_1.promises.writeFile(filePath, content, 'utf-8');
    }
}
async function createI18nConfig(workspace, sourceLocale, targetLocales, includePatterns) {
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
    const configPath = (0, path_1.join)(workspace, 'i18n.json');
    await fs_1.promises.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
    const writtenConfig = await fs_1.promises.readFile(configPath, 'utf-8');
    const parsedConfig = JSON.parse(writtenConfig);
    if (!parsedConfig.locale?.targets || parsedConfig.locale.targets.length === 0) {
        throw new Error('Failed to write valid i18n configuration');
    }
}
async function runLingoCLI(workspace, apiKey, timeoutMs = 600000, onOutput) {
    return new Promise((resolve, reject) => {
        console.log('\n[DEBUG] Running Lingo CLI with command: npx -y lingo.dev@latest run');
        console.log('[DEBUG] Workspace:', workspace);
        console.log('[DEBUG] API Key set:', !!apiKey);
        const child = (0, child_process_1.spawn)('npx', ['-y', 'lingo.dev@latest', 'run'], {
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
                reject(new Error('Lingo.dev authentication failed.\n\n' +
                    'Your API key may be invalid or expired.\n\n' +
                    'To fix this:\n' +
                    '1. Visit https://lingo.dev/auth\n' +
                    '2. Get a valid API key from Projects > API Key\n' +
                    '3. Set it: export LINGODOTDEV_API_KEY="your-key"\n\n' +
                    `Full output:\n${combinedOutput}`));
                return;
            }
            if (code === 0) {
                resolve({ stdout, stderr });
            }
            else {
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
async function readTranslatedFiles(workspace, sourceFiles, targetLocales) {
    const translatedFiles = [];
    for (const sourceFile of sourceFiles) {
        const baseName = sourceFile.replace(/\.md$/, '');
        for (const locale of targetLocales) {
            const translatedPath = `${baseName}.${locale}.md`;
            const fullPath = (0, path_1.join)(workspace, translatedPath);
            try {
                await fs_1.promises.access(fullPath);
                const content = await fs_1.promises.readFile(fullPath, 'utf-8');
                translatedFiles.push({
                    path: translatedPath,
                    locale,
                    content,
                });
            }
            catch (error) {
                const allFiles = await listWorkspaceFiles(workspace);
                const mdFiles = allFiles.filter(f => f.endsWith('.md'));
                console.warn(`Warning: Could not find translated file at ${translatedPath}`);
                console.warn(`Available markdown files in workspace: ${mdFiles.join(', ')}`);
            }
        }
    }
    return translatedFiles;
}
async function listWorkspaceFiles(workspace) {
    const files = [];
    async function walkDir(dir, baseDir = workspace) {
        try {
            const entries = await fs_1.promises.readdir(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = (0, path_1.join)(dir, entry.name);
                const relativePath = fullPath.replace(baseDir + '/', '').replace(baseDir + '\\', '');
                if (entry.isDirectory()) {
                    await walkDir(fullPath, baseDir);
                }
                else {
                    files.push(relativePath);
                }
            }
        }
        catch (error) {
            console.error(`Error reading directory ${dir}:`, error);
        }
    }
    try {
        await walkDir(workspace);
    }
    catch (error) {
        console.error('Error listing workspace files:', error);
    }
    return files;
}
async function cleanupWorkspace(workspace) {
    try {
        await fs_1.promises.rm(workspace, { recursive: true, force: true });
    }
    catch (error) {
        console.error(`Failed to cleanup workspace ${workspace}:`, error);
    }
}
async function copyTranslatedFilesFromWorkspace(workspace, sourceFiles, targetLocales, outputDir) {
    const copiedFiles = [];
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
            const sourcePath = (0, path_1.join)(workspace, translatedFileName);
            console.log(`[DEBUG] Looking for translated file at: ${sourcePath}`);
            try {
                await fs_1.promises.access(sourcePath);
                const content = await fs_1.promises.readFile(sourcePath, 'utf-8');
                const outputFileName = `${fileNameWithoutExt}.${locale}.md`;
                const outputPath = (0, path_1.join)(outputDir, outputFileName);
                await fs_1.promises.mkdir(outputDir, { recursive: true });
                await fs_1.promises.writeFile(outputPath, content, 'utf-8');
                console.log(`[DEBUG] Successfully copied ${translatedFileName} to ${outputPath}`);
                copiedFiles.push({
                    path: outputPath,
                    locale,
                    fileName: outputFileName,
                });
            }
            catch (error) {
                const allFiles = await listWorkspaceFiles(workspace);
                const mdFiles = allFiles.filter(f => f.endsWith('.md'));
                console.warn(`Warning: Could not find translated file for ${sourceFile} in locale ${locale}`);
                console.warn(`Available markdown files in workspace: ${mdFiles.join(', ')}`);
            }
        }
    }
    return copiedFiles;
}
