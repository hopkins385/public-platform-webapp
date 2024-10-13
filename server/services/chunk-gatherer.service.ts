import type { TransformCallback } from 'stream';
import { Transform } from 'stream';

export class ChunkGatherer extends Transform {
  private gatheredChunks: string = '';
  private delayMs: number;

  constructor(delayMs: number = 0) {
    super({ objectMode: true });
    this.delayMs = delayMs;

    this._transform = this.delayedTransform.bind(this);
    this._flush = (callback: TransformCallback) => {
      callback();
    };
  }

  /*constructor() {
    super({ objectMode: true });

    this._transform = (chunk: any, encoding: string, callback: TransformCallback) => {
      this.gatheredChunks += chunk;
      callback(null, chunk);
    };
    this._flush = (callback: TransformCallback) => {
      callback();
    };
  }*/

  private async delayedTransform(chunk: any, encoding: string, callback: TransformCallback) {
    if (this.delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.delayMs));
    }
    this.gatheredChunks += chunk;
    callback(null, chunk);
  }

  getGatheredContent(): string {
    return this.gatheredChunks;
  }

  reset(): void {
    this.gatheredChunks = '';
  }
}
