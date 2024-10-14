import type { TransformCallback } from 'stream';
import { Transform } from 'stream';

export class ChunkGatherer extends Transform {
  private buffer: string[] = [];
  private gatheredContent: string = '';
  private processing: boolean = false;
  private paused: boolean = false;
  private maxBufferSize: number;
  private processInterval: number;

  constructor(options: { maxBufferSize?: number; processInterval?: number } = {}) {
    super({ objectMode: true });
    this.maxBufferSize = options.maxBufferSize || 1000; // Default buffer size
    this.processInterval = options.processInterval || 0; // Default to immediate processing
  }

  override _transform(chunk: any, encoding: string, callback: TransformCallback): void {
    if (typeof chunk !== 'string') {
      callback(new Error('Invalid chunk type'), null);
      return;
    }

    this.buffer.push(chunk);

    if (this.buffer.length >= this.maxBufferSize) {
      this.pause();
      this.paused = true;
    }

    if (!this.processing) {
      this.processBuffer();
    }

    callback();
  }

  private processBuffer(): void {
    this.processing = true;

    const processChunk = () => {
      if (this.buffer.length === 0) {
        this.processing = false;
        if (this.paused) {
          this.resume();
          this.paused = false;
        }
        return;
      }

      const chunk = this.buffer.shift()!;
      this.gatheredContent += chunk; // Append chunk to the gathered content
      this.push(chunk);

      if (this.processInterval > 0) {
        setTimeout(processChunk, this.processInterval);
      } else {
        process.nextTick(processChunk);
      }
    };

    processChunk();
  }

  override _flush(callback: TransformCallback): void {
    // Process any remaining chunks in the buffer
    const flush = () => {
      if (this.buffer.length > 0) {
        const chunk = this.buffer.shift()!;
        this.gatheredContent += chunk; // Append chunk to the gathered content
        this.push(chunk);
        process.nextTick(flush);
      } else {
        callback();
      }
    };
    flush();
  }

  getBufferSize(): number {
    return this.buffer.length;
  }

  setMaxBufferSize(size: number): void {
    this.maxBufferSize = size;
  }

  setProcessInterval(interval: number): void {
    this.processInterval = interval;
  }

  // Methods for chunk gathering functionality
  getGatheredContent(): string {
    return this.gatheredContent;
  }

  reset(): void {
    this.gatheredContent = '';
  }
}

/*import { InvalidToolArgumentsError } from 'ai';
import type { TransformCallback } from 'stream';
import { Transform } from 'stream';

export class ChunkGatherer extends Transform {
  private gatheredChunks: string[] = [];
  private delayMs: number;

  constructor(delayMs: number = 0) {
    super({ objectMode: true });
    this.delayMs = delayMs;
  }

  override _transform(chunk: any, encoding: string, callback: TransformCallback): void {
    if (this.delayMs > 0) {
      setTimeout(() => this.processChunk(chunk, callback), this.delayMs);
    } else {
      this.processChunk(chunk, callback);
    }
  }

  private processChunk(chunk: any, callback: TransformCallback): void {
    if (typeof chunk !== 'string') {
      if (InvalidToolArgumentsError.isInstance(chunk)) {
        console.error(`InvalidToolArgumentsError: ${chunk?.cause ?? chunk.message}`);
        callback(null, 'Invalid tool arguments');
        return;
      }
      callback(null, 'Invalid chunk');
      return;
    }
    this.gatheredChunks.push(chunk);
    callback(null, chunk);
  }

  override _flush(callback: TransformCallback): void {
    callback();
  }

  getGatheredContent(): string {
    return this.gatheredChunks.join('');
  }

  reset(): void {
    this.gatheredChunks = [];
  }
}*/
