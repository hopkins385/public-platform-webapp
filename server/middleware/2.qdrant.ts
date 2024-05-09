import { QdrantVectorStore } from 'llamaindex';

declare module 'h3' {
  interface H3EventContext {
    vectorStore: QdrantVectorStore;
  }
}

export default eventHandler((event) => {
  const { getVectorStore } = useQdrant();
  event.context.vectorStore = getVectorStore();
});
