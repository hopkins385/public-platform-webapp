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
  private readonly embedFileUrl: string;
  private readonly searchVectorUrl: string;

  constructor(
    private readonly config: {
      ragServerUrl: string;
    },
  ) {
    const apiVersion = 'v1';
    const newEmbedFileUrl = new URL(`/api/${apiVersion}/embed/file`, this.config.ragServerUrl);
    const newSearchVectorUrl = new URL(`/api/${apiVersion}/search/vector`, this.config.ragServerUrl);
    this.embedFileUrl = newEmbedFileUrl.toString();
    this.searchVectorUrl = newSearchVectorUrl.toString();
  }

  async embedFile(payload: IEmbedFilePayload, options: { resetCollection?: boolean } = {}): Promise<RagDocument[]> {
    try {
      return await $fetch<RagDocument[]>(this.embedFileUrl, {
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
      return await $fetch<SearchResultDocument[]>(this.searchVectorUrl, {
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
