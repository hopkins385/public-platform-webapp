import type { RuntimeConfig } from 'nuxt/schema';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createMistral } from '@ai-sdk/mistral';

export class AiCompletionFactory {
  private readonly model: string;
  private readonly config: RuntimeConfig;
  private readonly provider: string;

  constructor(provider: string, model: string, config: RuntimeConfig) {
    this.provider = provider;
    this.model = model;
    this.config = config;
  }

  getModel() {
    switch (this.provider) {
      case 'openai': {
        const openai = createOpenAI({
          compatibility: 'strict', // strict mode, enable when using the OpenAI API
          apiKey: this.config.openai.apiKey,
        });
        return openai(this.model);
      }
      case 'anthropic': {
        const anthropic = createAnthropic({
          apiKey: this.config.anthropic.apiKey,
        });
        return anthropic(this.model);
      }
      case 'groq': {
        const groq = createOpenAI({
          compatibility: 'compatible',
          baseURL: 'https://api.groq.com/openai/v1',
          apiKey: this.config.groq.apiKey,
        });
        return groq(this.model);
      }
      case 'mistral': {
        const mistral = createMistral({
          apiKey: this.config.mistral.apiKey,
        });
        return mistral(this.model);
      }
      default:
        throw new Error('Provider not supported');
    }
  }

  static fromInput(provider: string, model: string, config: RuntimeConfig) {
    return new AiCompletionFactory(provider, model, config).getModel();
  }
}
