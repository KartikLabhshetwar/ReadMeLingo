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
            if (code === 0 || (code === null && signal === 'SIGTERM' && stdout.includes('✔'))) {
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
        const extension = '.md';
        const fileName = sourceFile.split('/').pop() || sourceFile;
        const dirPath = sourceFile.includes('/') ? sourceFile.substring(0, sourceFile.lastIndexOf('/')) : '';
        for (const locale of targetLocales) {
            const possiblePaths = [
                (0, path_1.join)(locale, sourceFile),
                (0, path_1.join)(locale, fileName),
                dirPath ? (0, path_1.join)(locale, dirPath, fileName) : (0, path_1.join)(locale, fileName),
                `${baseName}.${locale}${extension}`,
                `${baseName}.${locale}.md`,
                `${fileName.replace(/\.md$/, '')}.${locale}.md`,
                (0, path_1.join)('.lingo', locale, sourceFile),
                (0, path_1.join)('.lingo', locale, fileName),
                (0, path_1.join)('lingo', locale, sourceFile),
                (0, path_1.join)('lingo', locale, fileName),
            ];
            let found = false;
            for (const possiblePath of possiblePaths) {
                const fullPath = (0, path_1.join)(workspace, possiblePath);
                try {
                    await fs_1.promises.access(fullPath);
                    const content = await fs_1.promises.readFile(fullPath, 'utf-8');
                    translatedFiles.push({
                        path: sourceFile.replace(/\.md$/, `.${locale}.md`),
                        locale,
                        content,
                    });
                    found = true;
                    break;
                }
                catch {
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
    for (const sourceFile of sourceFiles) {
        const fileName = sourceFile.split('/').pop() || sourceFile;
        const baseName = fileName.replace(/\.md$/, '');
        const dirPath = sourceFile.includes('/') ? sourceFile.substring(0, sourceFile.lastIndexOf('/')) : '';
        for (const locale of targetLocales) {
            const possiblePaths = [
                (0, path_1.join)(locale, sourceFile),
                (0, path_1.join)(locale, fileName),
                dirPath ? (0, path_1.join)(locale, dirPath, fileName) : (0, path_1.join)(locale, fileName),
                (0, path_1.join)('.lingo', locale, sourceFile),
                (0, path_1.join)('.lingo', locale, fileName),
                (0, path_1.join)('lingo', locale, sourceFile),
                (0, path_1.join)('lingo', locale, fileName),
            ];
            let found = false;
            for (const possiblePath of possiblePaths) {
                const sourcePath = (0, path_1.join)(workspace, possiblePath);
                try {
                    await fs_1.promises.access(sourcePath);
                    const content = await fs_1.promises.readFile(sourcePath, 'utf-8');
                    const outputFileName = `${baseName}.${locale}.md`;
                    const outputPath = (0, path_1.join)(outputDir, outputFileName);
                    await fs_1.promises.mkdir(outputDir, { recursive: true });
                    await fs_1.promises.writeFile(outputPath, content, 'utf-8');
                    copiedFiles.push({
                        path: outputPath,
                        locale,
                        fileName: outputFileName,
                    });
                    found = true;
                    break;
                }
                catch {
                    continue;
                }
            }
            if (!found) {
                console.warn(`Warning: Could not find translated file for ${sourceFile} in locale ${locale}`);
            }
        }
    }
    return copiedFiles;
}
