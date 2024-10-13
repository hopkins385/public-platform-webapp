import type { TransformCallback } from 'stream';
import { Transform } from 'stream';

export class ChunkGatherer extends Transform {
  private gatheredChunks: string = '';

  constructor() {
    super({ objectMode: true });

    this._transform = (chunk: any, encoding: string, callback: TransformCallback) => {
      this.gatheredChunks += chunk;
      callback(null, chunk);
    };
    this._flush = (callback: TransformCallback) => {
      callback();
    };
  }

  getGatheredContent(): string {
    return this.gatheredChunks;
  }

  reset(): void {
    this.gatheredChunks = '';
  }
}
