"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractMarkdownFiles = extractMarkdownFiles;
exports.decodeBase64 = decodeBase64;
exports.getFileExtension = getFileExtension;
exports.isMarkdownFile = isMarkdownFile;
exports.formatFileSize = formatFileSize;
exports.parseAndValidateMarkdown = parseAndValidateMarkdown;
function extractMarkdownFiles(files) {
    return files.filter(file => file.type === 'file' && file.name.endsWith('.md'));
}
function decodeBase64(content) {
    return Buffer.from(content, 'base64').toString('utf-8');
}
function getFileExtension(filename) {
    const parts = filename.split('.');
    return parts.length > 1 ? parts[parts.length - 1] : '';
}
function isMarkdownFile(filename) {
    return filename.toLowerCase().endsWith('.md');
}
function formatFileSize(bytes) {
    if (bytes === 0)
        return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
function parseAndValidateMarkdown(content) {
    if (!content || content.trim().length === 0) {
        throw new Error('Markdown content is empty');
    }
    const trimmed = content.trim();
    if (trimmed.length < 10) {
        throw new Error('Markdown content is too short to be valid');
    }
    const normalized = trimmed
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .replace(/\n{3,}/g, '\n\n');
    return normalized;
}
