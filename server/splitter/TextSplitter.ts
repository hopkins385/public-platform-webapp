import type { TiktokenEncoding } from 'tiktoken';
import { TokenizerService } from '../services/tokenizer.service';

export class TextSplitter {
  constructor(
    private readonly chunkSize: number = 1024,
    private readonly chunkOverlap: number = 200,
    private readonly paragraphSeparator: string = '\n\n',
    private readonly sentenceRegex: RegExp = /[^.!?]+[.!?]+/g,
    private readonly aiModel: TiktokenEncoding = 'o200k_base', // "cl100k_base" | "o200k_base"
    private readonly tokenizerService: TokenizerService = new TokenizerService(),
  ) {}

  public split(text: string, metadata?: string): string[] {
    const metadataLength = metadata ? this.tokenSize(metadata) : 0;
    const effectiveChunkSize = this.chunkSize - metadataLength;

    if (effectiveChunkSize <= 0) {
      throw new Error('Metadata is too long for the given chunk size.');
    }

    const paragraphs = text.split(this.paragraphSeparator);
    const chunks: string[] = [];

    for (const paragraph of paragraphs) {
      chunks.push(...this.splitParagraph(paragraph, effectiveChunkSize));
    }

    return this.mergeChunksWithOverlap(chunks, effectiveChunkSize);
  }

  private splitParagraph(paragraph: string, chunkSize: number): string[] {
    if (this.tokenSize(paragraph) <= chunkSize) {
      return [paragraph];
    }

    const sentences = paragraph.match(this.sentenceRegex) || [paragraph];
    const chunks: string[] = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      if (this.tokenSize(currentChunk + sentence) > chunkSize && currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk += sentence;
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  private mergeChunksWithOverlap(chunks: string[], chunkSize: number): string[] {
    const result: string[] = [];
    let currentChunk = '';
    let overlapBuffer = '';

    for (const chunk of chunks) {
      if (this.tokenSize(currentChunk + chunk) > chunkSize && currentChunk) {
        result.push(currentChunk.trim());

        // Prepare the overlap for the next chunk
        const tokenizedChunk = this.tokenize(currentChunk);
        const overlapTokens = tokenizedChunk.slice(-this.chunkOverlap);
        overlapBuffer = this.detokenize(overlapTokens);

        currentChunk = overlapBuffer + chunk;
      } else {
        currentChunk += (currentChunk ? ' ' : '') + chunk;
      }
    }

    if (currentChunk) {
      result.push(currentChunk.trim());
    }

    return result;
  }

  private async tokenSize(text: string): Promise<number> {
    const { tokenCount } = await this.tokenizerService.getTokens(text);
    return tokenCount;
  }

  private async tokenize(text: string): Promise<number[]> {
    const { tokens } = await this.tokenizerService.getTokens(text);
    return tokens;
  }

  private async detokenize(tokens: number[]): Promise<string> {
    return this.tokenizerService.detokenize(tokens);
  }
}
