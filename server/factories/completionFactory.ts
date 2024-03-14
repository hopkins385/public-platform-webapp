import { LLMService } from './../services/llm.service';
import type { RuntimeConfig } from 'nuxt/schema';
import { OpenAI } from 'openai';
import { Anthropic } from '@anthropic-ai/sdk';

interface CreatePayload {
  messages: any[];
  temperature: number;
  maxTokens: number;
}

interface CompletionParams {
  baseURL: string;
  apiKey: string;
  model: string;
  provider: string;
}

export class CompletionFactory {
  model: string;
  config: RuntimeConfig;
  params: CompletionParams;
  llmService: LLMService;

  constructor(
    model: string,
    config: RuntimeConfig,
    prisma: ExtendedPrismaClient,
  ) {
    this.model = model;
    this.config = config;
    this.llmService = new LLMService(prisma);
    this.params = {
      baseURL: '',
      apiKey: '',
      model: '',
      provider: '',
    };
  }

  async create(payload: CreatePayload) {
    this.params = await this.getChatCompletionParams();
    switch (this.params.provider) {
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
      model: this.params.model,
      messages: payload.messages,
      max_tokens: payload.maxTokens,
      temperature: payload.temperature,
      stream: true,
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
      model: this.params.model,
      temperature: payload.temperature,
      stream: true,
    });
  }

  async getChatCompletionParams() {
    let baseURL: string;
    let apiKey: string;
    let model: string;

    const dbModels = await this.llmService.getCachedModels();
    const provider = dbModels.find((m) => m?.apiName === this.model)?.provider;

    switch (provider) {
      case 'openai':
        baseURL = this.config.openai.baseUrl;
        apiKey = this.config.openai.apiKey;
        model = this.model;
        break;
      case 'anthropic':
        baseURL = this.config.anthropic.baseUrl;
        apiKey = this.config.anthropic.apiKey;
        model = this.model;
        break;
      case 'groq':
        baseURL = this.config.groq.baseUrl;
        apiKey = this.config.groq.apiKey;
        model = this.model;
        break;
      case 'mistral':
        baseURL = this.config.mistral.baseUrl;
        apiKey = this.config.mistral.apiKey;
        model = this.model;
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
    return { baseURL, apiKey, model, provider } as CompletionParams;
  }
}
