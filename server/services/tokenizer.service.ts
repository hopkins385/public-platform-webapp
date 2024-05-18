import consola from 'consola';
import { get_encoding as getEncoding } from 'tiktoken';

const logger = consola.create({}).withTag('tokenizer.service');

export class TokenizerService {
  private readonly encoder: any;

  constructor() {
    this.encoder = getEncoding('cl100k_base');
  }

  getTokens(content: string | undefined | null) {
    if (!content || typeof content !== 'string') {
      logger.warn('No content provided to tokenize');
      return {
        tokens: [],
        tokenCount: 0,
        charCount: 0,
      };
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
