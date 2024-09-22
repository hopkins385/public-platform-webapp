import { TokenizerService } from '~/server/services/tokenizer.service';
import type { QdrantClient } from '@qdrant/js-client-rest';
import type OpenAI from 'openai';
import consola from 'consola';
import type { CohereClient } from 'cohere-ai';
import { similarity } from 'ml-distance';
import fs from 'fs';
import LayoutPDFReader from '../reader/llmsherpa/fileReader';
import { tokenize } from '../../utils/tokenize';

type Vector = number[];
export type Embedding = Vector;

interface IEmbedFilePayload {
  mediaId: string;
  recordId: string;
  mimeType: string;
  path: string;
}

interface SearchResultDocument {
  mediaId: string;
  recordId: string;
  text: string;
}

const logger = consola.create({}).withTag('EmbeddingService');

const apiUrl = 'http://localhost:5010/api/parseDocument?renderFormat=all&useNewIndentParser=true';
const parser = new LayoutPDFReader(apiUrl);

const tokenizerService = new TokenizerService();

export class EmbeddingService {
  constructor(
    private readonly vectorStore: QdrantClient,
    private readonly openai: OpenAI,
    private readonly cohere: CohereClient,
    private readonly fileReaderServerUrl: string,
  ) {}

  async embedFile(payload: IEmbedFilePayload) {
    //
    const buffer = await fs.promises.readFile(payload.path);
    const response = await $fetch(this.fileReaderServerUrl, {
      method: 'PUT',
      headers: {
        Accept: 'text/plain',
        'Content-Type': payload.mimeType,
      },
      body: buffer,
    });

    console.log('response:', response);

    const { tokenCount } = await tokenizerService.getTokens(response as string);

    console.log('len:', tokenCount);

    // const response = await parser.readPdf({ path: payload.path });
    // console.log('response:', response.toHtml());

    throw new Error('Not implemented');
  }

  private async embedText(text: string | string[]) {
    let res: OpenAI.Embeddings.CreateEmbeddingResponse;

    try {
      res = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
        encoding_format: 'float',
      });
    } catch (e) {
      logger.error(`Failed to fetch embeddings. Error is: ${e}`);
      return [];
    }

    if (!res?.data || !res?.data[0]?.embedding) {
      logger.error(`Embed text response invalid. Response is: ${JSON.stringify(res)}`);
      return [];
    }

    return res.data[0].embedding;
  }

  private async searchVectorStore(payload: {
    embedding: number[];
    recordIds: string[];
  }): Promise<SearchResultDocument[]> {
    try {
      const result = await this.vectorStore.search('media', {
        with_payload: {
          include: ['mediaId', 'recordId', 'text'],
        },
        vector: payload.embedding,
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
        // TODO: this
      });

      return resp;
      //
    } catch (e) {
      logger.error(e);
      return [];
    }
  }

  private async createMediaCollection() {
    const collectionName = 'media';
    await this.vectorStore.createCollection(collectionName, {
      vectors: {
        size: 1536,
        distance: 'Cosine',
      },
    });

    //  -------- Create payload indexes -------------

    await this.vectorStore.createPayloadIndex(collectionName, {
      wait: true,
      field_name: 'recordId',
      field_schema: 'keyword',
    });

    await this.vectorStore.createPayloadIndex(collectionName, {
      wait: true,
      field_name: 'mediaId',
      field_schema: 'keyword',
    });

    await this.vectorStore.createPayloadIndex(collectionName, {
      wait: true,
      field_name: 'text',
      field_schema: 'text',
    });
  }

  private async upsertVectorIndex(documents: RagDocument[]) {
    const collectionName = 'media';
    if (!(await this.collectionExists(collectionName))) {
      await this.createMediaCollection();
    }

    const embeddingPoints = documents.map((doc) => ({
      id: doc.id,
      vector: doc.embedding,
      payload: {
        recordId: doc.recordId,
        mediaId: doc.recordId,
        text: doc.text,
      },
    }));

    return this.vectorStore.upsert(collectionName, {
      wait: true,
      points: embeddingPoints,
    });
  }

  private async collectionExists(collectionName: string) {
    return this.vectorStore.collectionExists(collectionName);
  }

  private async reRankDocuments(payload: {
    query: string;
    documents: SearchResultDocument[];
  }): Promise<SearchResultDocument[]> {
    try {
      const rerank = await this.cohere.rerank({
        documents: payload.documents.map((doc) => doc.text),
        query: payload.query,
        topN: 3,
        model: 'rerank-multilingual-v3.0',
      });

      if (!rerank || !rerank.results || !rerank.results.length) {
        logger.error(`Rerank response invalid. Response is: ${JSON.stringify(rerank)}`);
        return [];
      }

      return rerank.results.map((result) => {
        const doc = payload.documents.find((d) => d.text === result.document?.text);
        return {
          mediaId: doc?.mediaId,
          recordId: doc?.recordId,
          text: doc?.text,
        } as SearchResultDocument;
      });
    } catch (e) {
      logger.error(e);
      return [];
    }
  }

  async searchDocsByQuery(payload: { query: string; recordIds: string[] }): Promise<SearchResultDocument[]> {
    // get the embedding vectors for the query
    const embedding = await this.embedText(payload.query);

    // search the vector store
    const documents = await this.searchVectorStore({ embedding, recordIds: payload.recordIds });

    // rerank the documents based on the query
    const rerankedDocuments = await this.reRankDocuments({ query: payload.query, documents });

    return rerankedDocuments;
  }

  private async calculateCosineDistances(embeddings: Embedding[] | number[]) {
    // Calculate the cosine distance (1 - cosine similarity) between consecutive embeddings.
    const distances: number[] = [];
    for (let i = 0; i < embeddings.length - 1; i++) {
      const sim: number = similarity.cosine(embeddings[i], embeddings[i + 1]);
      const distance: number = 1 - sim;
      distances.push(distance);
    }

    return distances;
  }

  private async semanticChunkDocs(docs: RagDocument[]): Promise<string[]> {
    const breakpointPercentileThreshold = 95;
    const texts = docs.map((doc) => doc.text);

    const embeddings = await this.embedText(texts);

    // Calculate the cosine distances between consecutive embeddings.
    const distances = await this.calculateCosineDistances(embeddings);

    // Calculate the percentile of the distances.
    const percentile = calculatePercentile(distances, breakpointPercentileThreshold);

    // Find the indices of the distances above the percentile threshold.
    const indices = findIndicesAboveThreshold(distances, percentile);

    // Create text chunks based on the identified breakpoints.
    const chunks = createTextChunks(texts, indices);

    return chunks;
  }
}

function calculatePercentile(arr: number[], percentile: number): number {
  if (percentile < 0 || percentile > 100) {
    throw new Error('Percentile must be between 0 and 100');
  }

  const sortedArr: number[] = [...arr].sort((a, b) => a - b);
  const index: number = (percentile / 100) * (sortedArr.length - 1);
  const lowerIndex: number = Math.floor(index);
  const upperIndex: number = Math.ceil(index);

  if (lowerIndex === upperIndex) {
    return sortedArr[lowerIndex];
  }

  const lowerValue: number = sortedArr[lowerIndex];
  const upperValue: number = sortedArr[upperIndex];
  const fraction: number = index - lowerIndex;

  return lowerValue + (upperValue - lowerValue) * fraction;
}

function findIndicesAboveThreshold(distances: number[], breakpointDistanceThreshold: number): number[] {
  return distances.reduce((indices: number[], distance: number, index: number): number[] => {
    if (distance > breakpointDistanceThreshold) {
      indices.push(index);
    }
    return indices;
  }, []);
}

function createTextChunks(singleSentencesList: string[], indicesAboveThresh: number[]): string[] {
  const chunks: string[] = [];
  let startIndex: number = 0;

  // Loop through the identified breakpoints and create chunks accordingly.
  for (const index of indicesAboveThresh) {
    const chunk: string = singleSentencesList.slice(startIndex, index + 1).join(' ');
    chunks.push(chunk);
    startIndex = index + 1;
  }

  // If there are any sentences left after the last breakpoint, add them as the final chunk.
  if (startIndex < singleSentencesList.length) {
    const chunk: string = singleSentencesList.slice(startIndex).join(' ');
    chunks.push(chunk);
  }

  // Return the list of text chunks.
  return chunks;
}
