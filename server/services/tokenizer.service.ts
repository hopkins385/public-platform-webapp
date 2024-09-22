import consola from 'consola';
import { get_encoding as getEncoding, type TiktokenEncoding } from 'tiktoken';

const logger = consola.create({}).withTag('tokenizer.service');

export class TokenizerService {
  private model: TiktokenEncoding;
  private encoder: any;

  constructor() {
    this.model = 'o200k_base';
    this.encoder = getEncoding(this.model);
  }

  setModel(model: TiktokenEncoding) {
    this.model = model;
    this.encoder = getEncoding(this.model);
  }

  async getTokens(
    content: string | undefined | null,
  ): Promise<{ tokens: number[]; tokenCount: number; charCount: number }> {
    return new Promise((resolve, reject) => {
      if (!content) {
        return reject(new Error('Content is empty'));
      }

      const tokens = this.encoder.encode(content);
      const tokenCount = tokens.length;
      const charCount = content.length;

      resolve({ tokens, tokenCount, charCount });
    });
  }

  async detokenize(tokens: number[]): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!tokens || !tokens.length) {
        return reject(new Error('Tokens are empty'));
      }

      const text = this.encoder.decode(tokens);

      resolve(text);
    });
  }
}
