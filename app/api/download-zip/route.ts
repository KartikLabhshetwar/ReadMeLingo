import { NextRequest, NextResponse } from 'next/server';
import { createZipFromFiles } from '@/lib/zip';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { files, filename = 'readmelingo-translations.zip' } = body;

    if (!files || !Array.isArray(files) || files.length === 0) {
      return NextResponse.json(
        { error: 'Files array is required' },
        { status: 400 }
      );
    }

    const fileMap = new Map<string, string>();
    for (const file of files) {
      if (file.path && file.content) {
        fileMap.set(file.path, file.content);
      }
    }

    const zipBuffer = await createZipFromFiles(fileMap);

    return new NextResponse(zipBuffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': zipBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error creating ZIP file:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to create ZIP file',
      },
      { status: 500 }
    );
  }
}

