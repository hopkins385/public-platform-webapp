import type { FluxImageGenerator } from '../utils/fluxImageGen';
import type { FluxProInputs } from '~/server/schema/fluxPro.schema';
import { join } from 'path';
import fs from 'fs/promises';
import { randomUUID } from 'crypto';

export class ImageGenService {
  constructor(private readonly fluxImageGenerator: FluxImageGenerator) {}

  public async generateImages(userId: string, payload: FluxProInputs): Promise<string[]> {
    const imgCount = payload.imgCount ?? 1;
    try {
      const imagePromises = Array.from({ length: imgCount }, () => this.fluxImageGenerator.generateImage(payload));
      const images = await Promise.all(imagePromises);

      const imageUrls = await Promise.all(
        images.map(async ({ id, sample: imgUrl }) => {
          await this.#saveImageToDisk({ id, url: imgUrl });
          return imgUrl;
        }),
      );

      return imageUrls;
    } catch (error) {
      console.error('Error generating image:', error);
      return [];
    }
  }

  async #saveImageToDisk(payload: { id: string | undefined; url: string }) {
    const id = payload.id ?? randomUUID();
    // Save image to disk
    const response = await fetch(payload.url);
    const buffer = await response.arrayBuffer();
    const bufferData = Buffer.from(buffer);
    const filename = `${id}.jpg`;
    const filePath = join('./', 'uploads', 'images', filename);
    try {
      await fs.writeFile(filePath, bufferData);
      return filePath;
    } catch (error) {
      console.error('Error saving image to disk:', error);
      return '';
    }
  }
}
