import type { QdrantClient } from '@qdrant/js-client-rest';
import { FileReaderFactory } from '~/server/factories/fileReaderFactory';
import OpenAI from 'openai';
import consola from 'consola';

const logger = consola.create({}).withTag('VectorService');

export class VectorService {
  private readonly vectorStore: QdrantClient;

  constructor(qdrant: QdrantClient) {
    this.vectorStore = qdrant;
  }

  async createIndex(payload: { mediaId: string; recordId: string; mimeType: string; path: string }) {
    // Settings.embedModel = new OpenAIEmbedding({
    //   model: 'text-embedding-3-small',
    // });

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

      // const context = await storageContextFromDefaults({
      //   vectorStore: this.vectorStore,
      // });

      // const res = await VectorStoreIndex.fromDocuments(documents, {
      //   storageContext: context,
      // });

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
        model: 'text-embedding-3-small',
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
      const result = await this.vectorStore.search('media', {
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

      // TODO: vector result
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

  // TODO: delete vector index on media deletion
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
