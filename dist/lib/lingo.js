"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.translateFiles = translateFiles;
exports.saveTranslatedFiles = saveTranslatedFiles;
const fs_1 = require("fs");
const path_1 = require("path");
const sdk_1 = require("lingo.dev/sdk");
async function translateFiles(files, targetLocales, apiKey, sourceLocale = 'en') {
    if (!apiKey || apiKey.length < 20 || !apiKey.includes('_')) {
        throw new Error('Invalid LINGODOTDEV_API_KEY format.\n' +
            'API key should be in format "api_..." or "lingo_...".\n' +
            'Please check your API key at https://lingo.dev/auth');
    }
    const engine = new sdk_1.LingoDotDevEngine({
        apiKey,
        batchSize: 100,
        idealBatchItemSize: 1000,
    });
    const results = [];
    for (const file of files) {
        try {
            const translatedContents = await engine.batchLocalizeText(file.content, {
                sourceLocale: sourceLocale,
                targetLocales: targetLocales,
            });
            for (let i = 0; i < targetLocales.length; i++) {
                results.push({
                    fileName: file.name,
                    locale: targetLocales[i],
                    content: translatedContents[i],
                });
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            if (errorMessage.includes('Authentication') || errorMessage.includes('auth')) {
                throw new Error('Lingo.dev authentication failed.\n\n' +
                    'Your API key may be invalid or expired.\n\n' +
                    'To fix this:\n' +
                    '1. Visit https://lingo.dev/auth\n' +
                    '2. Get a valid API key from Projects > API Key\n' +
                    '3. Set it: export LINGODOTDEV_API_KEY="your-key"');
            }
            if (errorMessage.includes('quota') || errorMessage.includes('limit') || errorMessage.includes('Maximum')) {
                throw new Error('Lingo.dev quota exceeded.\n\n' +
                    errorMessage + '\n\n' +
                    'To continue:\n' +
                    '1. Visit https://lingo.dev to upgrade your plan\n' +
                    '2. Or wait for your quota to reset\n' +
                    '3. Or reduce the amount of content to translate');
            }
            throw new Error(`Translation failed for ${file.name}.\n` +
                `Error: ${errorMessage}`);
        }
    }
    return results;
}
async function saveTranslatedFiles(translations, outputDir) {
    const savedFiles = [];
    await fs_1.promises.mkdir(outputDir, { recursive: true });
    for (const translation of translations) {
        const fileNameWithoutExt = translation.fileName.replace(/\.md$/, '');
        const outputFileName = `${fileNameWithoutExt}.${translation.locale}.md`;
        const outputPath = (0, path_1.join)(outputDir, outputFileName);
        await fs_1.promises.writeFile(outputPath, translation.content, 'utf-8');
        savedFiles.push({
            path: outputPath,
            locale: translation.locale,
            fileName: outputFileName,
        });
    }
    return savedFiles;
}
