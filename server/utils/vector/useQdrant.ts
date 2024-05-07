import { QdrantVectorStore } from 'llamaindex';

let vectorStore: QdrantVectorStore | null = null;

interface ICollectionOptons {
  collectionName: string;
  batchSize: number;
}

export default function useQdrant() {
  function getVectorStore(
    options: ICollectionOptons = { collectionName: 'default', batchSize: 1000 },
  ) {
    if (!vectorStore) {
      vectorStore = new QdrantVectorStore({
        url: 'http://localhost:6333',
        collectionName: options.collectionName,
        batchSize: options.batchSize,
      });
    }
    return vectorStore;
  }

  function getClient(
    options: ICollectionOptons = { collectionName: 'default', batchSize: 1000 },
  ) {
    return getVectorStore(options).client();
  }

  return {
    getVectorStore,
    getClient,
  };
}
