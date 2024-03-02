import { QdrantVectorStore } from 'llamaindex';

declare module 'h3' {
  interface H3EventContext {
    vectorStore: QdrantVectorStore;
  }
}

let vectorStore: QdrantVectorStore | null = null;

export default eventHandler((event) => {
  if (!vectorStore) {
    vectorStore = new QdrantVectorStore({
      url: 'http://localhost:6333',
    });
  }
  event.context.vectorStore = vectorStore;
});
