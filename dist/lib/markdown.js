"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractMarkdownFiles = extractMarkdownFiles;
exports.decodeBase64 = decodeBase64;
exports.getFileExtension = getFileExtension;
exports.isMarkdownFile = isMarkdownFile;
exports.formatFileSize = formatFileSize;
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
