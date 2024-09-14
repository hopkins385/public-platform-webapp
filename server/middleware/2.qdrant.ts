import consola from 'consola';
import type { QdrantVectorStore } from 'llamaindex';

declare module 'h3' {
  interface H3EventContext {
    vectorStore: QdrantVectorStore;
  }
}

const logger = consola.create({}).withTag('server.vector-store-middleware');

export default eventHandler((event) => {
  const { url } = useRuntimeConfig().qdrant;
  const { getVectorStore } = useQdrant();
  event.context.vectorStore = getVectorStore({ collectionName: 'media', serverUrl: url });
});
