import type { RuntimeConfig } from 'nuxt/schema';
import { AiModelProvider } from '~/server/schema/aiModelProvider';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createMistral } from '@ai-sdk/mistral';

class OpenAIProvider extends AiModelProvider {
  createModel() {
    const openai = createOpenAI({
      compatibility: 'strict',
      apiKey: this.apiKey,
    });
    return openai(this.model);
  }
}

class AnthropicProvider extends AiModelProvider {
  createModel() {
    const anthropic = createAnthropic({
      apiKey: this.apiKey,
    });
    return anthropic(this.model);
  }
}

class GroqProvider extends AiModelProvider {
  createModel() {
    const groq = createOpenAI({
      compatibility: 'compatible',
      baseURL: 'https://api.groq.com/openai/v1',
      apiKey: this.apiKey,
    });
    return groq(this.model);
  }
}

class MistralProvider extends AiModelProvider {
  createModel() {
    const mistral = createMistral({
      apiKey: this.apiKey,
    });
    return mistral(this.model);
  }
}

export class AiModelFactory {
  private constructor(
    private readonly provider: string,
    private readonly model: string,
    private readonly config: RuntimeConfig,
  ) {}

  static fromInput(payload: { provider: string; model: string }) {
    const config = useRuntimeConfig();
    return new AiModelFactory(payload.provider, payload.model, config).getModel();
  }

  getModel() {
    switch (this.provider) {
      case 'openai':
        return new OpenAIProvider(this.model, this.config.openai.apiKey).createModel();
      case 'anthropic':
        return new AnthropicProvider(this.model, this.config.anthropic.apiKey).createModel();
      case 'groq':
        return new GroqProvider(this.model, this.config.groq.apiKey).createModel();
      case 'mistral':
        return new MistralProvider(this.model, this.config.mistral.apiKey).createModel();
      default:
        throw new Error('Provider not supported');
    }
  }
}
