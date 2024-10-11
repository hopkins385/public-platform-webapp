import type { ExtendedPrismaClient } from '../prisma';
import type { StorageService } from './storage.service';
import type { FluxProInputs } from '~/server/schemas/fluxPro.schema';
import type { SessionUser } from '../api/auth/[...]';
import { StatusResponse, type FluxImageGenerator } from '../utils/fluxImageGen';
import consola from 'consola';

const logger = consola.create({}).withTag('TextToImageService');

enum TextToImageRunStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  MODERATED = 'MODERATED',
  FAILED = 'FAILED',
}

interface Run {
  id: string;
}

interface GenImageResult {
  run: Run;
  genImage: {
    id: string;
    imgUrl: string | null;
    status: StatusResponse;
  };
}

export class TextToImageService {
  constructor(
    private readonly prisma: ExtendedPrismaClient,
    private readonly fluxImageGenerator: FluxImageGenerator,
    private readonly storageService: StorageService,
  ) {}

  public async createFolder(payload: { projectId: string; folderName: string }) {
    return this.prisma.textToImageFolder.create({
      data: {
        projectId: payload.projectId,
        name: payload.folderName,
      },
    });
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

  public async getFolderImages(folderId: string) {
    return this.prisma.textToImage.findMany({
      select: {
        id: true,
        name: true,
        path: true,
        run: {
          select: {
            status: true,
          },
        },
      },
      where: {
        run: {
          folderId,
        },
        deletedAt: null,
      },
    });
  }

  public async getFolderImagesRuns(folderId: string) {
    // get all images of a folder but group them by run
    return this.prisma.textToImageRun.findMany({
      select: {
        id: true,
        status: true,
        prompt: true,
        settings: true,
        images: {
          select: {
            id: true,
            name: true,
            path: true,
            status: true,
          },
          where: {
            deletedAt: null,
          },
        },
      },
      where: {
        folderId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  public async getFolderImagesSliced(folderId: string, skip: number, take: number) {
    const images = await this.prisma.textToImage.findMany({
      select: {
        id: true,
        name: true,
        path: true,
      },
      where: {
        run: {
          folderId,
        },
        deletedAt: null,
      },
      skip,
      take,
    });
    return images.map((image) => {
      return {
        id: image.id,
        name: image.name,
        path: image.path,
      };
    });
  }

  public async generateFluxProImages(user: SessionUser, payload: FluxProInputs): Promise<string[]> {
    const imgCount = payload.imgCount ?? 1;

    try {
      const run = await this.#createSingleRun(payload);
      const genImageResults = await this.#generateImagesForRun(run, imgCount, payload);
      return this.#processImageResults(user.id, genImageResults, payload);
    } catch (error) {
      logger.error('Failed to generate images:', error);
      throw new Error('Failed to generate images');
    }
  }

  public async softDeleteRun(runId: string) {
    return this.prisma.textToImageRun.update({
      where: {
        id: runId,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async #createSingleRun(payload: FluxProInputs): Promise<Run> {
    try {
      return await this.#createRun({
        folderId: payload.folderId,
        prompt: payload.prompt,
        settings: {},
      });
    } catch (error) {
      logger.error('Failed to create run:', error);
      throw new Error('Failed to create run');
    }
  }

  async #createRun(payload: { folderId: string; prompt: string; settings: any }): Promise<Run> {
    const run = await this.prisma.textToImageRun.create({
      data: {
        folderId: payload.folderId,
        prompt: payload.prompt,
        settings: payload.settings,
        status: TextToImageRunStatus.PENDING,
      },
    });

    return {
      id: run.id,
    };
  }

  async #generateImagesForRun(run: Run, imageCount: number, payload: FluxProInputs): Promise<GenImageResult[]> {
    return Promise.all(Array.from({ length: imageCount }, () => this.#generateSingleImage(run, payload)));
  }

  async #generateSingleImage(run: Run, payload: FluxProInputs): Promise<GenImageResult> {
    try {
      const genImage = await this.fluxImageGenerator.generateImage(payload);
      return {
        run,
        genImage,
      };
    } catch (error) {
      logger.error(`Failed to generate image:`, error);
      await this.#updateRunStatus({ runId: run.id, status: TextToImageRunStatus.FAILED });
      return {
        run,
        genImage: {
          id: '',
          imgUrl: null,
          status: StatusResponse.Error,
        },
      };
    }
  }

  async #processImageResults(userId: string, results: GenImageResult[], payload: FluxProInputs): Promise<string[]> {
    return Promise.all(
      results.map((result) => this.#processSingleImageResult({ userId, folderId: payload.folderId, result })),
    );
  }

  async #processSingleImageResult(payload: {
    userId: string;
    folderId: string;
    result: GenImageResult;
  }): Promise<string> {
    const { genImage, run } = payload.result;

    const fileName = `image-${genImage.id}.jpg`;
    const folder = `${payload.userId}/text-to-image/${payload.folderId}`;
    const mimeType = 'image/jpg';

    let newfileUrl: string = '';

    try {
      if (genImage.imgUrl) {
        const { storagefileUrl } = await this.storageService.uploadToBucketByUrl({
          fileName,
          fileMimeType: mimeType,
          fileUrl: genImage.imgUrl,
          bucketFolder: folder,
          bucket: 'images',
        });
        newfileUrl = storagefileUrl;
      }

      const textToImage = await this.#createTextToImage({
        runId: run.id,
        fileName,
        filePath: newfileUrl,
        mimeType,
        status: this.#castStatus(genImage.status),
      });

      return textToImage.path;
    } catch (error) {
      logger.error(`Failed to process image for run ${run.id}:`, error);
      return '';
    }
  }

  async #createTextToImage(payload: {
    runId: string;
    fileName: string;
    filePath: string;
    mimeType: string;
    status: TextToImageRunStatus;
  }) {
    return this.prisma.textToImage.create({
      data: {
        runId: payload.runId,
        name: payload.fileName,
        path: payload.filePath,
        mimeType: payload.mimeType,
        status: payload.status,
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

  #castStatus(status: StatusResponse): TextToImageRunStatus {
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
}
