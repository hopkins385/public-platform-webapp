import consola from 'consola';
import type { QdrantVectorStore } from 'llamaindex';
import { VectorStoreIndex } from 'llamaindex';
import OpenAI from 'openai';
import { FileReaderFactory } from '~/server/factories/fileReaderFactory';

const logger = consola.create({}).withTag('VectorService');

export class VectorService {
  private readonly vectorStore: QdrantVectorStore;

  constructor() {
    const { getVectorStore } = useQdrant();
    this.vectorStore = getVectorStore({ collectionName: 'media' });
  }

  async createIndex(payload: {
    mediaId: string;
    recordId: string;
    mimeType: string;
    path: string;
  }) {
    try {
      const reader = new FileReaderFactory(payload.mimeType, payload.path);
      const documents = await reader.loadData();

      // add metadata to documents
      documents.forEach((doc) => {
        const additionalMetadata = {
          mediaId: payload.mediaId,
          recordId: payload.recordId,
        };
        Object.assign(doc.metadata, additionalMetadata);
      });

      const res = await VectorStoreIndex.fromDocuments(documents, {
        vectorStore: this.vectorStore,
      });

      // logger.info(res);

      // create chunks
    } catch (e) {
      logger.error(e);
      throw new Error('Failed to index file');
    }
  }

  async searchIndex(payload: { query: string; recordIds: string[] }) {
    // get the embedding vectors for the query
    const config = useRuntimeConfig().openai;
    const openai = new OpenAI({
      apiKey: config.apiKey,
    });

    let res: OpenAI.Embeddings.CreateEmbeddingResponse;

    try {
      res = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: payload.query,
        encoding_format: 'float',
      });
    } catch (e) {
      logger.error(`Failed to fetch embeddings. Error is: ${e}`);
      throw new Error('Cannot fetch embeddings');
    }

    if (!res?.data || !res?.data[0]?.embedding) {
      logger.error(
        `Embedding response invalid. Response is: ${JSON.stringify(res)}`,
      );
      throw new Error('Invalid embedding response');
    }

    try {
      const client = this.vectorStore.client();
      const vectorSearchResult = await client.search('media', {
        vector: res.data[0].embedding,
        filter: {
          must: [
            {
              key: 'recordId',
              match: {
                any: payload.recordIds,
              },
            },
          ],
        },
        limit: 2,
      });

      return vectorSearchResult;
      //
    } catch (e) {
      logger.error(e);
      throw new Error('Cannot get result from vector store');
    }
  }

  async deleteIndex(payload: { mediaId: string; recordId: string }) {
    try {
      //
    } catch (e) {
      logger.error(e);
      throw new Error('Failed to delete index');
    }
  }
}
