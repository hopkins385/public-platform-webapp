import { VectorStoreIndex } from 'llamaindex';
import type { VectorStore } from 'llamaindex';
import { FileReaderFactory } from '../factories/fileReaderFactory';

export class EmbeddingService {
  private readonly vectorStore: VectorStore;

  constructor() {
    const { getVectorStore } = useQdrant();
    this.vectorStore = getVectorStore();
  }

  async embedFile(payload: {
    path: string;
    fileType: string;
  }): Promise<VectorStoreIndex> {
    const reader = new FileReaderFactory(payload.fileType, payload.path);
    const documents = await reader.loadData();

    const index = await VectorStoreIndex.fromDocuments(documents, {
      vectorStore: this.vectorStore,
    });

    return index;
  }

  create() {}
}
