import fs from 'fs/promises';
import path from 'path';
import type { File as FormidableFile } from 'formidable';
import { CreateMediaDto } from './dto/media.dto';

export class StorageService {
  constructor() {}

  async uploadFile(
    file: FormidableFile,
    userId: string,
    teamId: string,
  ): Promise<CreateMediaDto> {
    if (!file.mimetype) {
      throw createError({
        statusCode: 406,
        statusMessage: 'Not Acceptable',
        message: 'File mimetype is required.',
      });
    }
    const mimeType = this.getFileExtension(file.mimetype);
    if (!mimeType) {
      throw createError({
        statusCode: 406,
        statusMessage: 'Not Acceptable',
        message: 'Unsupported file type: ' + file.mimetype,
      });
    }
    const originalFilename = file.originalFilename ?? 'Untitled';
    const fileName = `${Date.now()}-${file.newFilename}.${mimeType}`;
    const newPath = `${path.join(this.getBasePath(), userId, fileName)}`;
    await fs.copyFile(file.filepath, newPath);

    const payload = CreateMediaDto.fromInput({
      teamId,
      name: originalFilename,
      fileName,
      filePath: newPath,
      fileMime: file.mimetype,
      fileSize: file.size,
      model: { id: userId, type: 'user' },
    });

    return payload;
  }

  async deleteFile(path: string): Promise<void> {
    await fs.unlink(path);
  }

  getFileExtension(mimeType: string) {
    return {
      'application/pdf': 'pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        'docx',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        'xlsx',
      'text/markdown': 'md',
      'text/csv': 'csv',
      'text/html': 'html',
      'text/plain': 'txt',
      plain: 'txt',
    }[mimeType];
  }

  getBasePath() {
    return path.join('public', 'uploads');
  }
}
