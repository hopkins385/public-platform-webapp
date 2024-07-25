import consola from 'consola';
import { QdrantVectorStore } from 'llamaindex';

declare module 'h3' {
  interface H3EventContext {
    vectorStore: QdrantVectorStore;
  }
}

const logger = consola.create({}).withTag('server.vector-store-middleware');

export default eventHandler((event) => {
  const config = useRuntimeConfig();
  const { getVectorStore } = useQdrant();
  event.context.vectorStore = getVectorStore({ collectionName: 'media', serverUrl: config.qdrant.url });
});
