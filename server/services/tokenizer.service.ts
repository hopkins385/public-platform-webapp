import { get_encoding as getEncoding } from 'tiktoken';

export class TokenizerService {
  private readonly encoder: any;

  constructor() {
    this.encoder = getEncoding('cl100k_base');
  }

  getTokens(content: string) {
    if (typeof content !== 'string') {
      throw new Error('Content must be a string');
    }
    const charCount = content.length;
    const tokens = this.encoder.encode(content);
    const tokenCount = tokens.length;

    return {
      tokens,
      tokenCount,
      charCount,
    };
  }
}
