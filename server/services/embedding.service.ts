import type { QdrantClient } from '@qdrant/js-client-rest';
import { FileReaderFactory } from '../factories/fileReaderFactory';
import type { RuntimeConfig } from 'nuxt/schema';

export class EmbeddingService {
  constructor(private readonly vectorStore: QdrantClient) {}

  async embedFile(payload: { path: string; fileType: string }) {
    throw new Error('Not implemented');

    const reader = new FileReaderFactory(payload.fileType, payload.path);
    const documents = await reader.loadData();

    // const index = await VectorStoreIndex.fromDocuments(documents, {
    //   vectorStore: this.vectorStore,
    // });

    // return index;
  }

  create() {}
}
