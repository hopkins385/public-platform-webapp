import fs from 'fs-extra';
import path from 'path';
import { existsSync } from 'fs';
import { CreateMediaDto } from './dto/media.dto';
import type { S3Client } from '@aws-sdk/client-s3';
import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import type { UploadFiletDto } from './dto/file.dto';
import { randomUUID } from 'crypto';
import axios from 'axios';

type Bucket = 'public' | 'images';

type R2Bucket = 'ragna-public' | 'ragna-cloud-images';

interface BucketSettings {
  bucket: R2Bucket;
  url: string;
}

export class StorageService {
  constructor(private readonly s3Client: S3Client) {}

  async uploadFile(payload: UploadFiletDto): Promise<CreateMediaDto> {
    if (!payload.file.mimetype) {
      throw createError({
        statusCode: 406,
        statusMessage: 'Not Acceptable',
        message: 'File mimetype is required.',
      });
    }
    const mimeType = this.getFileExtension(payload.file.mimetype);
    if (!mimeType) {
      throw createError({
        statusCode: 406,
        statusMessage: 'Not Acceptable',
        message: 'Unsupported file type: ' + payload.file.mimetype,
      });
    }

    const basePath = this.getBasePath();
    const userPath = path.join(basePath, payload.userId);

    if (!existsSync(basePath)) {
      await fs.mkdir(basePath);
    }

    if (!existsSync(userPath)) {
      await fs.mkdir(userPath);
    }

    const originalFilename = payload.file.originalFilename ?? 'Untitled';
    const fileName = `${Date.now()}-${payload.file.newFilename}.${mimeType}`;
    const newPath = `${path.join(this.getBasePath(), payload.userId, fileName)}`;
    await fs.copyFile(payload.file.filepath, newPath);

    const createMediaPayload = CreateMediaDto.fromInput({
      teamId: payload.teamId,
      name: originalFilename,
      fileName,
      filePath: newPath,
      fileMime: payload.file.mimetype,
      fileSize: payload.file.size,
      model: { id: payload.userId, type: 'user' },
    });

    return createMediaPayload;
  }

  getBucketSettings(bucket: Bucket): BucketSettings {
    switch (bucket) {
      case 'public':
        return {
          bucket: 'ragna-public',
          url: 'https://static.ragna.app',
        };
      case 'images':
        return {
          bucket: 'ragna-cloud-images',
          url: 'https://images.ragna.app',
        };
      default:
        return {
          bucket: 'ragna-public',
          url: 'https://static.ragna.app',
        };
    }
  }

  async uploadFileToBucketByUrl(payload: { fileName: string; fileUrl: string; bucket: Bucket; bucketFolder: string }) {
    const { fileName, fileUrl, bucketFolder } = payload;
    const { bucket, url } = this.getBucketSettings(payload.bucket);
    const newPath = `${url}/uploads/${bucketFolder}/${fileName}`;

    try {
      const localFilePath = await this.downloadFileToTemp(fileUrl);
      const fileBlob = await fs.readFile(localFilePath);

      const mimeType = this.getFileExtension(fileName);

      const putObjectCommand = new PutObjectCommand({
        Bucket: bucket,
        Key: `uploads/${bucketFolder}/${fileName}`,
        Body: fileBlob,
        ContentType: mimeType,
      });

      await this.s3Client.send(putObjectCommand);

      await this.deleteTempFile(localFilePath);

      return {
        filePath: newPath,
        fileMime: mimeType,
      };
    } catch (error) {
      console.error('Error uploading file to bucket', error);
      throw error;
    }
  }

  async uploadToBucketByUrl(payload: {
    fileName: string;
    fileMimeType: string;
    fileUrl: string;
    bucket: Bucket;
    bucketFolder: string;
  }) {
    const { fileName, fileMimeType, fileUrl, bucketFolder } = payload;
    const { bucket, url } = this.getBucketSettings(payload.bucket);
    const newfileUrl = `${url}/${bucketFolder}/${fileName}`;

    try {
      const response = await axios({
        url: fileUrl,
        method: 'GET',
        responseType: 'stream',
      });

      const contentLength = response.headers['content-length'];

      const putObjectCommand = new PutObjectCommand({
        Bucket: bucket,
        Key: `${bucketFolder}/${fileName}`,
        Body: response.data,
        ContentType: fileMimeType,
        ContentLength: contentLength ? parseInt(contentLength) : undefined,
      });

      await this.s3Client.send(putObjectCommand);

      return {
        storagefileUrl: newfileUrl,
      };
    } catch (error) {
      console.error('Error uploading file to bucket', error);
      throw error;
    }
  }

  async uploadFileToBucket(bucket: Bucket, payload: UploadFiletDto): Promise<CreateMediaDto> {
    if (!payload.file.mimetype) {
      throw createError({
        statusCode: 406,
        statusMessage: 'Not Acceptable',
        message: 'File mimetype is required.',
      });
    }
    const mimeType = this.getFileExtension(payload.file.mimetype);
    if (!mimeType) {
      throw createError({
        statusCode: 406,
        statusMessage: 'Not Acceptable',
        message: 'Unsupported file type: ' + payload.file.mimetype,
      });
    }
    const originalFilename = payload.file.originalFilename ?? 'Untitled';
    const fileName = `${Date.now()}-${payload.file.newFilename}.${mimeType}`;
    const { bucket: Bucket, url } = this.getBucketSettings(bucket);
    const filePath = `${payload.userId}/uploads/${bucket}/${fileName}`;
    const bucketUrl = `${url}/${payload.userId}/uploads/${bucket}/${fileName}`;
    const fileBlob = await fs.readFile(payload.file.filepath);

    const putObjectCommand = new PutObjectCommand({
      Bucket,
      Key: filePath,
      Body: fileBlob,
      ContentType: payload.file.mimetype,
    });

    await this.s3Client.send(putObjectCommand);

    // wait 1000ms
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const createMediaPayload = CreateMediaDto.fromInput({
      teamId: payload.teamId,
      name: originalFilename,
      fileName,
      filePath: bucketUrl,
      fileMime: payload.file.mimetype,
      fileSize: payload.file.size,
      model: { id: payload.userId, type: 'user' },
    });

    return createMediaPayload;
  }

  async downloadFileFromBucket(path: string): Promise<Buffer> {
    const getObjectCommand = new GetObjectCommand({
      Bucket: 'ragna-public',
      Key: path,
    });
    const { Body } = await this.s3Client.send(getObjectCommand);
    if (!Body) throw new Error('File not found');
    const file = await new Response(Body as BodyInit).arrayBuffer();
    if (!file) throw new Error('File not found');
    return Buffer.from(file);
  }

  async downloadFileFromBucketToTemp(vpath: string): Promise<string> {
    const buffer = await this.downloadFileFromBucket(vpath);
    if (!buffer) throw new Error('File not found');
    const fpath = path.join(process.cwd(), 'temp', vpath);
    await fs.mkdir(path.dirname(fpath), { recursive: true });
    await fs.writeFile(fpath, buffer, 'binary');
    return fpath;
  }

  async downloadFileToTemp(url: string): Promise<string> {
    const response = await fetch(url);
    const buffer = Buffer.from(await response.arrayBuffer());
    const fpath = path.join(process.cwd(), 'temp', 'files', randomUUID(), path.basename(url));
    await fs.mkdir(path.dirname(fpath), { recursive: true });
    await fs.writeFile(fpath, buffer, 'binary');
    return fpath;
  }

  async deleteTempFile(filePath: string): Promise<boolean> {
    await fs.unlink(filePath);
    // delete also the directory if it's empty
    const dir = path.dirname(filePath);
    const files = await fs.readdir(dir);
    if (files.length === 0) {
      await fs.rmdir(dir);
    }
    return true;
  }

  async deleteFileFromBucket(filePath: string): Promise<boolean> {
    const deleteObjectCommand = new DeleteObjectCommand({
      Bucket: 'ragna-public',
      Key: filePath,
    });
    await this.s3Client.send(deleteObjectCommand);

    return true;
  }

  getFileExtension(mimeType: string) {
    return {
      'application/pdf': 'pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
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
