import type { ExtendedPrismaClient } from '~/server/prisma';
import type { FluxProInputs } from '~/server/schemas/fluxPro.schema';
import { StatusResponse, type FluxImageGenerator } from '../utils/fluxImageGen';
import consola from 'consola';
import type { StorageService } from './storage.service';
import { UploadFiletDto } from './dto/file.dto';

enum TextToImageRunStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  MODERATED = 'MODERATED',
  FAILED = 'FAILED',
}

interface Run {
  id: string;
  // other properties...
}

interface ImageResult {
  run: Run;
  image: {
    id: string;
    imgUrl: string | null;
    status: StatusResponse;
  } | null;
}

interface ImageRunResult {
  run: Run;
  image: ImageResult;
}

const logger = consola.create({}).withTag('TextToImageService');

export class TextToImageService {
  constructor(
    private readonly prisma: ExtendedPrismaClient,
    private readonly fluxImageGenerator: FluxImageGenerator,
    private readonly storageService: StorageService,
  ) {}

  public async createFolder(payload: { projectId: string; folderName: string }) {
    const { projectId, folderName } = payload;
    return this.prisma.textToImageFolder.create({
      data: {
        projectId,
        name: folderName,
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
    const images = await this.prisma.textToImage.findMany({
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
    return images;
    /*return images.map((image) => {
      return {
        id: image.id,
        name: image.name,
        path: image.path,
      };
    });*/
  }

  public async getFolderImagesRuns(folderId: string) {
    // get all images of a folder but group them by run
    const images = await this.prisma.textToImageRun.findMany({
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
          },
        },
      },
      where: {
        folderId,
      },
    });

    return images;
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

  public async generateImages(payload: FluxProInputs): Promise<string[]> {
    const imgCount = payload.imgCount ?? 1;

    try {
      const validRuns = await this.#createValidRuns(1, payload); // TODO: check if multiple image gen runs required
      const imageResults = await this.#generateImagesForRuns(validRuns, imgCount, payload);
      return this.#processImageResults(imageResults, payload.folderId);
    } catch (error) {
      logger.error('Error in generateImages:', error);
      throw new Error('Unable to generate images');
    }
  }

  async #createValidRuns(count: number, payload: FluxProInputs): Promise<Run[]> {
    const runs = await Promise.all(Array.from({ length: count }, () => this.#createSingleRun(payload)));

    const validRuns = runs.filter((run): run is NonNullable<typeof run> => run !== null);

    if (validRuns.length === 0) {
      throw new Error('Failed to create any valid runs');
    }

    return validRuns;
  }

  async #createSingleRun(payload: FluxProInputs): Promise<Run | null> {
    try {
      return await this.#createRun({
        folderId: payload.folderId,
        prompt: payload.prompt,
        settings: {},
      });
    } catch (error) {
      logger.error('Failed to create run:', error);
      return null;
    }
  }

  async #generateImagesForRuns(runs: Run[], count: number, payload: FluxProInputs): Promise<ImageResult[]> {
    const imageRuns = runs.map((run) => Array.from({ length: count }, () => this.#generateSingleImage(run, payload)));
    return Promise.all(imageRuns.flat()); // TODO: multiple image gen runs
  }

  async #generateSingleImage(run: Run, payload: FluxProInputs): Promise<ImageResult> {
    try {
      const image = await this.fluxImageGenerator.generateImage(payload);
      return { run, image };
    } catch (error) {
      logger.error(`Failed to generate image for run ${run.id}:`, error);
      await this.#updateRunStatus({ runId: run.id, status: TextToImageRunStatus.FAILED });
      return { run, image: null };
    }
  }

  async #processImageResults(results: ImageResult[], folderId: string): Promise<string[]> {
    if (results.length === 0) return [];
    const processedResults = await Promise.all(
      results.map((result) => this.#processSingleImageResult(result, folderId)),
    );
    return processedResults.filter((url): url is string => url !== '');
  }

  async #processSingleImageResult(result: ImageResult, folderId: string): Promise<string> {
    if (!result) return '';
    const { run, image } = result;
    if (!image) return '';

    const { imgUrl, status } = image;
    const castStatus = this.#castStatus(status);

    try {
      await this.#updateRunStatus({ runId: run.id, status: castStatus });

      if (castStatus !== TextToImageRunStatus.COMPLETED || !imgUrl) {
        return '';
      }

      const textToImage = await this.#storeFileAndCreateTextToImage({
        runId: run.id,
        folderId: folderId,
        externalImageUrl: imgUrl,
      });

      return textToImage.path;
    } catch (error) {
      logger.error(`Failed to process image for run ${run.id}:`, error);
      await this.#updateRunStatus({ runId: run.id, status: TextToImageRunStatus.FAILED });
      return '';
    }
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

  async #storeFileAndCreateTextToImage(payload: { runId: string; folderId: string; externalImageUrl: string }) {
    const { runId, folderId, externalImageUrl } = payload;
    const fileName = `image-${runId}.jpg`;
    const folder = `text-to-image/${folderId}`;
    const mimeType = 'image/jpg';

    const { storagefileUrl } = await this.storageService.uploadToImageBucketByUrl({
      fileName,
      fileMimeType: mimeType,
      fileUrl: externalImageUrl,
      folder,
    });

    return this.#createTextToImage({ runId, fileName, filePath: storagefileUrl, mimeType });
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
