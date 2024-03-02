import {
  VectorStoreIndex,
  serviceContextFromDefaults,
  ContextChatEngine,
  SimpleChatEngine,
  SummaryChatHistory,
  OpenAI,
  CondenseQuestionChatEngine,
} from 'llamaindex';
import type { VectorStore, ChatMessage } from 'llamaindex';
import { FileParserFactory } from './../factories/fileParserFactory';
// import type { ChatMessage } from './../../interfaces/chat.interfaces';

export interface EmbedDocumentPayload {
  // docType: 'txt' | 'pdf' | 'docx' | 'markdown' | 'csv';
  path: string;
  vectorStore: VectorStore;
}

export default function useEmbedDocuments() {
  async function queryEmbedDocuments(query: string, vectorStore: VectorStore) {
    const serviceContext = serviceContextFromDefaults();
    try {
      const index = await VectorStoreIndex.fromVectorStore(
        vectorStore,
        serviceContext,
      );
      const queryEngine = index.asQueryEngine();
      const response = await queryEngine.query({
        query,
      });
      return response;
    } catch (e) {
      console.error('error', e);
    }
  }

  async function embedDocument(payload: EmbedDocumentPayload) {
    const type = payload.path.split('.').pop() || ''; // determine type from file extension
    try {
      const parser = new FileParserFactory(type, payload.path);
      const documents = await parser.loadData();

      await VectorStoreIndex.fromDocuments(documents, {
        vectorStore: payload.vectorStore,
      });
    } catch (e) {
      console.error('error', e);
    }
  }

  async function chat(
    messages: ChatMessage[],
    vectorStore: VectorStore,
    stream: boolean = false,
  ) {
    // const llm = new OpenAI({ model: "gpt-3.5-turbo", maxTokens: 4096 * 0.75 });
    // const chatHistory = new SummaryChatHistory({ llm });
    // const chatEngine = new SimpleChatEngine({ llm });

    // split messages into query and chatHistory
    const query = messages[messages.length - 1].content as string;
    const chatHistory = messages.slice(0, messages.length - 1) as ChatMessage[];
    const serviceContext = serviceContextFromDefaults();

    try {
      const index = await VectorStoreIndex.fromVectorStore(
        vectorStore,
        serviceContext,
      );

      const retriever = index.asRetriever();
      const chatEngine = new ContextChatEngine({ retriever });
      // const qeng = index.asQueryEngine();
      // const chatEngine = new CondenseQuestionChatEngine({
      //   queryEngine: qeng,
      //   serviceContext,
      //   chatHistory,
      // });

      return await chatEngine.chat({
        message: query,
        chatHistory,
        stream,
      });
      //
    } catch (e) {
      console.error('error', e);
    }
  }

  return {
    queryEmbedDocuments,
    embedDocument,
    chat,
  };
}
