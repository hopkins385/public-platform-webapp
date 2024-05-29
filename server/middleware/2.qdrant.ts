import consola from 'consola';
import { QdrantVectorStore } from 'llamaindex';

declare module 'h3' {
  interface H3EventContext {
    vectorStore: QdrantVectorStore;
  }
}

const logger = consola.create({}).withTag('server.vector-store-middleware');

export default eventHandler((event) => {
  const { getVectorStore } = useQdrant();
  event.context.vectorStore = getVectorStore();
});
