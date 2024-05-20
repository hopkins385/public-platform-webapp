import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import type { File as FormidableFile } from 'formidable';
import { CreateMediaDto } from './dto/media.dto';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';

const { accountId, accessKeyId, secretAccessKey, bucket } =
  useRuntimeConfig().cloudflare;

export class StorageService {
  private readonly s3Client: S3Client;
  constructor() {
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      },
    });
  }

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

    const basePath = this.getBasePath();
    const userPath = path.join(basePath, userId);

    if (!existsSync(basePath)) {
      await fs.mkdir(basePath);
    }

    if (!existsSync(userPath)) {
      await fs.mkdir(userPath);
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

  async uploadFileToBucket(
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
    const newPath = `https://static.ragna.app/uploads/${userId}/${fileName}`;
    const fileBlob = await fs.readFile(file.filepath);

    const putObjectCommand = new PutObjectCommand({
      Bucket: bucket,
      Key: `uploads/${userId}/${fileName}`,
      Body: fileBlob,
      ContentType: file.mimetype,
    });

    await this.s3Client.send(putObjectCommand);

    // wait 1000ms
    await new Promise((resolve) => setTimeout(resolve, 1000));

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

  async downloadFile(path: string): Promise<Buffer> {
    const getObjectCommand = new GetObjectCommand({
      Bucket: bucket,
      Key: path,
    });
    const { Body } = await this.s3Client.send(getObjectCommand);
    if (!Body) throw new Error('File not found');
    const file = await new Response(Body as BodyInit).arrayBuffer();
    if (!file) throw new Error('File not found');
    return Buffer.from(file);
  }

  async downloadFileToTemp(vpath: string): Promise<string> {
    const buffer = await this.downloadFile(vpath);
    if (!buffer) throw new Error('File not found');
    const fpath = path.join(process.cwd(), 'temp', vpath);
    await fs.mkdir(path.dirname(fpath), { recursive: true });
    await fs.writeFile(fpath, buffer, 'binary');
    return fpath;
  }

  async deleteTempFile(path: string): Promise<boolean> {
    await fs.unlink(path);
    return true;
  }

  async deleteFile(path: string): Promise<boolean> {
    // await fs.unlink(path);
    const deleteObjectCommand = new DeleteObjectCommand({
      Bucket: bucket,
      Key: path,
    });
    await this.s3Client.send(deleteObjectCommand);

    return true;
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
      'image/png': 'png',
      'image/jpg': 'jpg',
      'image/jpeg': 'jpeg',
      'image/gif': 'gif',
      'image/webp': 'webp',
    }[mimeType];
  }

  getBasePath() {
    return path.join(process.cwd(), 'uploads');
  }
}
