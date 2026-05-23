import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const ALLOWED_MIME_TYPE = 'application/pdf';

export type UploadDirectory = 'revisions' | 'feedbacks';

export interface UploadFileResult {
  success: boolean;
  filename?: string;
  error?: string;
}

export function sanitizeFilename(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function generateFilename(
  journalName: string,
  submissionTitle: string,
  version: number,
): string {
  const journalWords = journalName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(sanitizeFilename)
    .join('-');

  const submissionWords = submissionTitle
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(sanitizeFilename)
    .join('-');

  return `${journalWords}-${submissionWords}-v${version}.pdf`;
}

export async function uploadFile(
  file: File,
  directory: UploadDirectory,
  customFilename?: string,
): Promise<UploadFileResult> {
  try {
    if (file.type !== ALLOWED_MIME_TYPE) {
      return {
        success: false,
        error: 'File must be a PDF',
      };
    }

    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: 'File size must not exceed 50MB',
      };
    }

    let filename = customFilename || file.name;
    if (!filename.endsWith('.pdf')) {
      filename += '.pdf';
    }

    // Store uploads outside public folder - in production-safe location
    const uploadDir = path.join(process.cwd(), 'uploads', directory);
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, filename);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    await writeFile(filePath, buffer);

    return {
      success: true,
      filename,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function deleteFile(filename: string, directory: UploadDirectory): Promise<void> {
  const { unlink } = await import('fs/promises');
  const filePath = path.join(process.cwd(), 'uploads', directory, filename);
  await unlink(filePath).catch(() => {
    // File may not exist, ignore error
  });
}
