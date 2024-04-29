import type { RuntimeConfig } from 'nuxt/schema';
import { OpenAI } from 'openai';
import { Anthropic } from '@anthropic-ai/sdk';

interface CreatePayload {
  messages: any[];
  temperature: number;
  maxTokens: number;
  stream: boolean;
}

interface CompletionParams {
  baseURL: string;
  apiKey: string;
}

export class CompletionFactoryStatic {
  private readonly model: string;
  private readonly config: RuntimeConfig;
  private readonly params: CompletionParams;
  private readonly provider: string;

  constructor(provider: string, model: string) {
    this.provider = provider;
    this.model = model;
    this.config = useRuntimeConfig();
    this.params = this.getChatCompletionParams();
  }

  async create(payload: CreatePayload) {
    switch (this.provider) {
      case 'anthropic':
        return this.createAnthropic(payload);
      default:
        return this.createOpenAI(payload);
    }
  }

  createOpenAI(payload: CreatePayload) {
    const openai = new OpenAI({
      baseURL: this.params.baseURL,
      apiKey: this.params.apiKey,
    });
    return openai.chat.completions.create({
      model: this.model,
      messages: payload.messages,
      max_tokens: payload.maxTokens,
      temperature: payload.temperature,
      stream: payload.stream,
    });
  }

  createAnthropic(payload: CreatePayload) {
    const anthropic = new Anthropic({
      apiKey: this.params.apiKey,
    });
    const systemPrompt = payload.messages[0].content;
    const messages = payload.messages.slice(1);
    return anthropic.messages.create({
      system: systemPrompt,
      max_tokens: payload.maxTokens,
      messages,
      model: this.model,
      temperature: payload.temperature,
      stream: payload.stream,
    });
  }

  getChatCompletionParams() {
    let baseURL: string;
    let apiKey: string;

    if (!this.config) {
      throw new Error('RuntimeConfig is missing');
    }

    switch (this.provider) {
      case 'openai':
        baseURL = this.config.openai.baseUrl;
        apiKey = this.config.openai.apiKey;
        break;
      case 'anthropic':
        baseURL = this.config.anthropic.baseUrl;
        apiKey = this.config.anthropic.apiKey;
        break;
      case 'groq':
        baseURL = this.config.groq.baseUrl;
        apiKey = this.config.groq.apiKey;
        break;
      case 'mistral':
        baseURL = this.config.mistral.baseUrl;
        apiKey = this.config.mistral.apiKey;
        break;
      default:
        throw new Error('Provider not found');
      /*
      case ModelEnum.Local:
        baseURL = 'http://127.0.0.1:8093/v1';
        apiKey = '';
        model = ModelEnum.Local;
        break;
        */
    }
    return { baseURL, apiKey } as CompletionParams;
  }
}
