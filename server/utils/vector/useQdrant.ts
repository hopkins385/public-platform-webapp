import { QdrantVectorStore } from 'llamaindex';
import type { RuntimeConfig } from 'nuxt/schema';

let vectorStore: QdrantVectorStore | null = null;

interface ICollectionOptons {
  collectionName: string;
  batchSize?: number;
}

export default function useQdrant(config: RuntimeConfig) {
  function getVectorStore(options: ICollectionOptons = { collectionName: 'default' }) {
    if (!vectorStore) {
      vectorStore = new QdrantVectorStore({
        url: config.qdrant.url,
        collectionName: options.collectionName,
        batchSize: options.batchSize,
      });
    }
    return vectorStore;
  }

  function getClient(options: ICollectionOptons = { collectionName: 'default' }) {
    return getVectorStore(options).client();
  }

  return {
    getVectorStore,
    getClient,
  };
}
