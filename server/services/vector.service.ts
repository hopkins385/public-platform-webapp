import consola from 'consola';
import type { QdrantVectorStore } from 'llamaindex';
import { VectorStoreIndex } from 'llamaindex';
import { FileReaderFactory } from '~/server/factories/fileReaderFactory';

const logger = consola.create({}).withTag('VectorService');

export class VectorService {
  private readonly vectorStore: QdrantVectorStore;

  constructor() {
    const { getVectorStore } = useQdrant();
    this.vectorStore = getVectorStore({ collectionName: 'media' });
  }

  async createIndex(payload: {
    mediaId: string;
    recordId: string;
    mimeType: string;
    path: string;
  }) {
    try {
      const reader = new FileReaderFactory(payload.mimeType, payload.path);
      const documents = await reader.loadData();

      // add metadata to documents
      documents.forEach((doc) => {
        const additionalMetadata = {
          mediaId: payload.mediaId,
          recordId: payload.recordId,
        };
        Object.assign(doc.metadata, additionalMetadata);
      });

      logger.info(documents);
      return;
      const res = await VectorStoreIndex.fromDocuments(documents, {
        vectorStore: this.vectorStore,
      });

      logger.info(res);

      // create chunks
    } catch (e) {
      logger.error(e);
      throw new Error('Failed to index file');
    }
  }
}
