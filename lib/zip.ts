import JSZip from 'jszip';

export async function createZipFromFiles(
  files: Map<string, string>
): Promise<Buffer> {
  const zip = new JSZip();

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

export function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-z0-9_\-\.]/gi, '_');
}

