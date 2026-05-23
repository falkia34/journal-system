import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ directory: string; filename: string }> },
) {
  try {
    const { directory, filename } = await params;

    // Validate directory to prevent path traversal
    const allowedDirectories = ['revisions', 'feedbacks'];
    if (!allowedDirectories.includes(directory)) {
      return NextResponse.json({ error: 'Invalid directory' }, { status: 400 });
    }

    // Validate filename to prevent path traversal
    const sanitizedFilename = path.basename(filename);
    if (!sanitizedFilename.endsWith('.pdf')) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'uploads', directory, sanitizedFilename);

    try {
      const file = await readFile(filePath);
      return new NextResponse(file, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="${sanitizedFilename}"`,
        },
      });
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
      }
      throw error;
    }
  } catch (error) {
    console.error('Error serving file:', error);
    return NextResponse.json({ error: 'Failed to serve file' }, { status: 500 });
  }
}
