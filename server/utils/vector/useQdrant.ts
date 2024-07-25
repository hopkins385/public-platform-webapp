import { QdrantVectorStore } from 'llamaindex';

let vectorStore: QdrantVectorStore | null = null;

interface ICollectionOptons {
  collectionName: string;
  serverUrl: string;
  batchSize?: number;
}

const optionsDefaults: ICollectionOptons = {
  collectionName: 'default',
  serverUrl: 'http://localhost:6333',
};

export default function useQdrant() {
  /**
   * Get vector store instance
   */
  function getVectorStore(options: ICollectionOptons = optionsDefaults) {
    if (!vectorStore) {
      vectorStore = new QdrantVectorStore({
        url: options.serverUrl,
        collectionName: options.collectionName,
        batchSize: options.batchSize,
      });
    }
    return vectorStore;
  }

  /**
   * Get vector store client
   */
  function getClient(options: ICollectionOptons = optionsDefaults) {
    return getVectorStore(options).client();
  }

  return {
    getVectorStore,
    getClient,
  };
}
