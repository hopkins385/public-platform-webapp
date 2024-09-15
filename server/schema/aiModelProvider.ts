import type { LanguageModelV1 } from 'ai';

export abstract class AiModelProvider {
  constructor(
    protected readonly model: string,
    protected readonly apiKey: string,
  ) {}

  abstract createModel(): LanguageModelV1;
}
