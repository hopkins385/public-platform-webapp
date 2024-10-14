import type { TiktokenEncoding, Tiktoken } from 'tiktoken';
import { get_encoding as getEncoding } from 'tiktoken';

interface TokenizerResponse {
  tokens: number[];
  tokenCount: number;
  charCount: number;
}

export class TokenizerService {
  private readonly model: TiktokenEncoding;
  private readonly encoder: Tiktoken;
  private readonly url: string;

  constructor(private readonly config: { ragServerUrl: string }) {
    const apiVersion = 'v1';
    const newUrl = new URL(`/api/${apiVersion}/tokenize/text`, this.config.ragServerUrl);
    this.url = newUrl.toString();
    // local
    this.model = 'cl100k_base';
    this.encoder = getEncoding(this.model);
  }

  async getTokens(
    content: string | undefined | null,
  ): Promise<{ tokens: Uint32Array; tokenCount: number; charCount: number }> {
    try {
      const response = await $fetch<TokenizerResponse>(this.url, {
        method: 'POST',
        body: { text: content },
        timeout: 3000, // 3 seconds
      });
      const { tokens, tokenCount, charCount } = response;
      return { tokens: new Uint32Array(tokens), tokenCount, charCount };
    } catch (error) {
      console.error('Failed to get tokens from rag server, falling back to local');
      return this.getTokensLocal(content);
    }
  }

  async getTokensLocal(
    content: string | undefined | null,
  ): Promise<{ tokens: Uint32Array; tokenCount: number; charCount: number }> {
    return new Promise((resolve, reject) => {
      if (!content || !content.length) {
        return reject(new Error('TokenizerService getTokens: Content is empty'));
      }

      const tokens = this.encoder.encode(content);
      const tokenCount = tokens.length;
      const charCount = content.length;

      resolve({ tokens, tokenCount, charCount });
    });
  }

  async detokenize(tokens: Uint32Array): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
      if (!tokens || !tokens.length) {
        return reject(new Error('TokenizerService detokenize: Tokens are empty'));
      }

      const text = this.encoder.decode(tokens);

      resolve(text);
    });
  }
}
