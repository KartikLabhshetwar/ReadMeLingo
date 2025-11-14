"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createZipFromFiles = createZipFromFiles;
exports.sanitizeFilename = sanitizeFilename;
const jszip_1 = __importDefault(require("jszip"));
async function createZipFromFiles(files) {
    const zip = new jszip_1.default();
    for (const [path, content] of files.entries()) {
        zip.file(path, content);
    }
    const buffer = await zip.generateAsync({
        type: 'nodebuffer',
        compression: 'DEFLATE',
        compressionOptions: {
            level: 9,
        },
    });
    return buffer;
}
function sanitizeFilename(filename) {
    return filename.replace(/[^a-z0-9_\-\.]/gi, '_');
}
