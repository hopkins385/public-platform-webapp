import type { ExtendedPrismaClient } from '~/server/prisma';
import { StatusResponse, type FluxImageGenerator } from '../utils/fluxImageGen';
import type { FluxProInputs } from '~/server/schemas/fluxPro.schema';
import { join } from 'path';
import fs from 'fs/promises';
import { randomUUID } from 'crypto';

enum TextToImageRunStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  MODERATED = 'MODERATED',
  FAILED = 'FAILED',
}

export class TextToImageService {
  private readonly filePath: string;
  constructor(
    private readonly prisma: ExtendedPrismaClient,
    private readonly fluxImageGenerator: FluxImageGenerator,
  ) {
    this.filePath = join('public', 'ai-images');
  }

  /*
  public async generateImages(payload: FluxProInputs): Promise<string[]> {
    const imgCount = payload.imgCount ?? 1;

    const runPromises = Array.from({ length: imgCount }, () =>
      this.#createRun({
        folderId: payload.folderId,
        prompt: payload.prompt,
        settings: {},
      }),
    );
    const runs = await Promise.all(runPromises);

    const imagePromises = runs.map(() => this.fluxImageGenerator.generateImage(payload));
    const images = await Promise.all(imagePromises);

    const imageUrls = await Promise.all(
      images.map(async ({ id, imgUrl, status }) => {
        const castStatus = this.castStatus(status);
        console.log('castStatus', castStatus);
        const runStatus = await this.#updateRunStatus({ runId: id, status: castStatus });
        if (runStatus.status !== TextToImageRunStatus.COMPLETED || !imgUrl) {
          return '';
        }
        const textToImage = await this.#saveToDiskAndCreateTextToImage({
          runId: id,
          folderId: payload.folderId,
          externalImageUrl: imgUrl,
        });
        return textToImage.path;
      }),
    );

    return imageUrls;
  }
    */

  public async generateImages(payload: FluxProInputs): Promise<string[]> {
    const imgCount = payload.imgCount ?? 1;

    try {
      // Create runs
      const runs = await Promise.all(
        Array.from({ length: imgCount }, () =>
          this.#createRun({
            folderId: payload.folderId,
            prompt: payload.prompt,
            settings: {},
          }).catch((error) => {
            console.error('Failed to create run:', error);
            return null;
          }),
        ),
      );

      const validRuns = runs.filter((run): run is NonNullable<typeof run> => run !== null);

      if (validRuns.length === 0) {
        throw new Error('Failed to create any valid runs');
      }

      // Generate images
      const imageResults = await Promise.all(
        validRuns.map(async (run) => {
          try {
            const image = await this.fluxImageGenerator.generateImage(payload);
            return { run, image };
          } catch (error) {
            console.error(`Failed to generate image for run ${run.id}:`, error);
            await this.#updateRunStatus({ runId: run.id, status: TextToImageRunStatus.FAILED });
            return { run, image: null };
          }
        }),
      );

      // Process results
      const imageUrls = await Promise.all(
        imageResults.map(async ({ run, image }) => {
          if (!image) {
            return '';
          }

          const { imgUrl, status } = image;
          const castStatus = this.castStatus(status);
          console.log('castStatus', castStatus);

          try {
            await this.#updateRunStatus({ runId: run.id, status: castStatus });

            if (castStatus !== TextToImageRunStatus.COMPLETED || !imgUrl) {
              return '';
            }

            const textToImage = await this.#saveToDiskAndCreateTextToImage({
              runId: run.id,
              folderId: payload.folderId,
              externalImageUrl: imgUrl,
            });

            return textToImage.path;
          } catch (error) {
            console.error(`Failed to process image for run ${run.id}:`, error);
            await this.#updateRunStatus({ runId: run.id, status: TextToImageRunStatus.FAILED });
            return '';
          }
        }),
      );

      return imageUrls.filter((url) => url !== '');
    } catch (error) {
      console.error('Error in generateImages:', error);
      throw error;
    }
  }

  castStatus(status: StatusResponse): TextToImageRunStatus {
    switch (status) {
      case StatusResponse.Pending:
        return TextToImageRunStatus.PENDING;
      case StatusResponse.Ready:
        return TextToImageRunStatus.COMPLETED;
      case StatusResponse.Error:
        return TextToImageRunStatus.FAILED;
      case StatusResponse.RequestModerated:
      case StatusResponse.ContentModerated:
        return TextToImageRunStatus.MODERATED;
      default:
        return TextToImageRunStatus.FAILED;
    }
  }

  async #saveImageToDisk(payload: { folderId: string; imageId: string | undefined; externalUrl: string }) {
    const id = payload.imageId ?? randomUUID();
    // Save image to disk
    const response = await fetch(payload.externalUrl);
    const buffer = await response.arrayBuffer();
    const bufferData = Buffer.from(buffer);
    const fileName = `${id}.jpg`;
    const filePath = join(this.filePath, payload.folderId, fileName);
    try {
      await fs.writeFile(filePath, bufferData);
      return { fileName, filePath, mimeType: 'image/jpg' };
    } catch (error) {
      console.error('Error saving image to disk:', error);
      throw error;
    }
  }

  async #deleteImageFromDisk(filePath: string) {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Error deleting image from disk:', error);
    }
  }

  async #deleteImagesFromDisk(filePaths: string[]) {
    await Promise.all(filePaths.map(async (filePath) => this.#deleteImageFromDisk(filePath)));
  }

  public async createFolder(payload: { projectId: string; folderName: string }) {
    const { projectId, folderName } = payload;
    const folder = await this.prisma.textToImageFolder.create({
      data: {
        projectId,
        name: folderName,
      },
    });
    await this.#createFolderPathOnDisk(join(this.filePath, folder.id));
    return folder;
  }

  public async findFolders(payload: { projectId: string }) {
    return this.prisma.textToImageFolder.findMany({
      where: {
        projectId: payload.projectId,
        deletedAt: null,
      },
    });
  }

  public async findFolderById(id: string) {
    return this.prisma.textToImageFolder.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  async #createFolderPathOnDisk(path: string): Promise<void> {
    fs.access(path)
      .then(() => {
        // Path exists, do nothing
      })
      .catch(async () => {
        // Path does not exist, create it
        try {
          await fs.mkdir(path, { recursive: true });
        } catch (error) {
          console.error('Error creating folder:', error);
        }
      });
  }

  async #createRun(payload: { folderId: string; prompt: string; settings: any }) {
    return this.prisma.textToImageRun.create({
      data: {
        folderId: payload.folderId,
        prompt: payload.prompt,
        settings: payload.settings,
        status: TextToImageRunStatus.PENDING,
      },
    });
  }

  async #updateRunStatus(payload: { runId: string; status: TextToImageRunStatus }) {
    return this.prisma.textToImageRun.update({
      where: {
        id: payload.runId,
      },
      data: {
        status: payload.status,
      },
    });
  }

  async #saveToDiskAndCreateTextToImage(payload: { runId: string; folderId: string; externalImageUrl: string }) {
    const { runId, folderId, externalImageUrl } = payload;
    const { fileName, filePath, mimeType } = await this.#saveImageToDisk({
      folderId,
      imageId: runId,
      externalUrl: externalImageUrl,
    });
    return this.#createTextToImage({ runId, fileName, filePath, mimeType });
  }

  async #createTextToImage(payload: { runId: string; fileName: string; filePath: string; mimeType: string }) {
    return this.prisma.textToImage.create({
      data: {
        runId: payload.runId,
        name: payload.fileName,
        path: payload.filePath,
        mimeType: payload.mimeType,
      },
    });
  }
}
