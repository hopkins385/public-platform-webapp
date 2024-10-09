import consola from 'consola';

type Vector = number[];
export type Embedding = Vector;

interface IEmbedFilePayload {
  mediaId: string;
  recordId: string;
  mimeType: string;
  filePath: string;
}

interface SearchResultDocument {
  mediaId: string;
  recordId: string;
  text: string;
}

interface RagDocument {
  id: string;
  text: string;
  metadata: {
    mediaId: string;
    recordId: string;
  };
}

const logger = consola.create({}).withTag('EmbeddingService');

export class EmbeddingService {
  constructor(
    private readonly config: {
      embeddingServiceUrl: string;
    },
  ) {}

  async embedFile(payload: IEmbedFilePayload, options: { resetCollection?: boolean } = {}): Promise<RagDocument[]> {
    try {
      return await $fetch<RagDocument[]>(`${this.config.embeddingServiceUrl}/api/v1/embed/file`, {
        method: 'POST',
        body: payload,
        onRequestError: (error) => {
          logger.error('[embed file] Request Error: ', error);
        },
        onResponseError: (error) => {
          logger.error('[embed file] Response Error: ', error);
        },
      });
    } catch (error) {
      logger.error('Error embedding file:', error);
      throw new Error('Sorry this service is currently unavailable');
    }
  }

  async searchDocsByQuery(payload: { query: string; recordIds: string[] }): Promise<SearchResultDocument[]> {
    try {
      return await $fetch<SearchResultDocument[]>(`${this.config.embeddingServiceUrl}/api/v1/search/vector`, {
        method: 'POST',
        body: payload,
        onRequestError: (error) => {
          logger.error('[search vector] Request Error: ', error);
        },
        onResponseError: (error) => {
          logger.error('[search vector] Response Error: ', error);
        },
      });
    } catch (error) {
      logger.error('Error searching documents:', error);
      throw new Error('Sorry this service is currently unavailable');
    }
  }
}
