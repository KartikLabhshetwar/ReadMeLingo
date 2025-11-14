"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTempWorkspace = createTempWorkspace;
exports.writeFilesToWorkspace = writeFilesToWorkspace;
exports.createI18nConfig = createI18nConfig;
exports.runLingoCLI = runLingoCLI;
exports.readTranslatedFiles = readTranslatedFiles;
exports.listWorkspaceFiles = listWorkspaceFiles;
exports.cleanupWorkspace = cleanupWorkspace;
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
}
async function runLingoCLI(workspace, apiKey, timeoutMs = 60000) {
    return new Promise((resolve, reject) => {
        const child = (0, child_process_1.spawn)('npx', ['-y', 'lingo.dev@latest', 'run', '--force'], {
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
            }
            else {
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
