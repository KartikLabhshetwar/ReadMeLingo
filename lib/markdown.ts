import { GitHubFile } from './github';

export function extractMarkdownFiles(files: GitHubFile[]): GitHubFile[] {
  return files.filter(file => 
    file.type === 'file' && file.name.endsWith('.md')
  );
}

export function decodeBase64(content: string): string {
  return Buffer.from(content, 'base64').toString('utf-8');
}

export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1] : '';
}

export function isMarkdownFile(filename: string): boolean {
  return filename.toLowerCase().endsWith('.md');
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

export function parseAndValidateMarkdown(content: string): string {
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

