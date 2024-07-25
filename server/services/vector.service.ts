import { StorageService } from '~/server/services/storage.service';
import consola from 'consola';
import type { QdrantVectorStore } from 'llamaindex';
import { VectorStoreIndex } from 'llamaindex';
import OpenAI from 'openai';
import { FileReaderFactory } from '~/server/factories/fileReaderFactory';
import type { RuntimeConfig } from 'nuxt/schema';

const logger = consola.create({}).withTag('VectorService');

export class VectorService {
  private readonly vectorStore: QdrantVectorStore;
  private readonly storageService: StorageService;

  constructor(config: RuntimeConfig) {
    if (!config) throw new Error('Runtime config not found');
    const { getVectorStore } = useQdrant();
    this.vectorStore = getVectorStore({ collectionName: 'media', serverUrl: config.qdrant.url });
    this.storageService = new StorageService();
  }

  async createIndex(payload: { mediaId: string; recordId: string; mimeType: string; path: string }) {
    try {
      const reader = new FileReaderFactory(payload.mimeType); // throws error if unsupported file type
      const documents = await reader.loadData(payload.path);

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

      return documents;
    } catch (e) {
      logger.error(e);
      throw new Error('Cannot add file(s) to vector store');
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
      logger.error(`Embedding response invalid. Response is: ${JSON.stringify(res)}`);
      throw new Error('Invalid embedding response');
    }

    try {
      const client = this.vectorStore.client();
      const result = await client.search('media', {
        with_payload: {
          include: ['mediaId', 'recordId', '_node_content'],
        },
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
        limit: 3,
      });

      const resp = result.map((node) => {
        const content = node.payload?._node_content ? JSON.parse(node.payload?._node_content) : {};
        return {
          mediaId: node.payload?.mediaId,
          recordId: node.payload?.recordId,
          content: content?.text,
        };
      });

      return resp;
      //
    } catch (e) {
      logger.error(e);
      throw new Error('Cannot get result from vector store');
    }
  }

  async deleteIndex(payload: { mediaId: string; recordId: string }) {
    throw new Error('Not implemented');
    try {
      //
    } catch (e) {
      logger.error(e);
      throw new Error('Failed to delete index');
    }
  }
}
