import type { RuntimeConfig } from 'nuxt/schema';
import { OpenAI } from 'openai';
import { Anthropic } from '@anthropic-ai/sdk';
import { ModelEnum } from './../../utils/modelEnum';

interface CreatePayload {
  messages: any[];
  temperature: number;
  maxTokens: number;
}

export class CompletionFactory {
  model: string;
  params: any;

  constructor(model: string, config: RuntimeConfig) {
    this.model = model;
    this.params = this.getChatCompletionParams(model, config);
  }

  create(payload: CreatePayload) {
    switch (this.params.model) {
      case ModelEnum.Claude3Opus:
      case ModelEnum.Claude3Sonnet:
        return this.createClaude(payload);
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

  createClaude(payload: CreatePayload) {
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

  getChatCompletionParams(value: string, config: RuntimeConfig) {
    let baseURL: string;
    let apiKey: string;
    let model: string;

    switch (value) {
      case ModelEnum.Claude3Opus:
        baseURL = config.anthropic.baseUrl;
        apiKey = config.anthropic.apiKey;
        model = ModelEnum.Claude3Opus;
        break;
      case ModelEnum.Claude3Sonnet:
        baseURL = config.anthropic.baseUrl;
        apiKey = config.anthropic.apiKey;
        model = ModelEnum.Claude3Sonnet;
        break;
      case ModelEnum.GroqLlama4K:
        baseURL = config.groq.baseUrl;
        apiKey = config.groq.apiKey;
        model = ModelEnum.GroqLlama4K;
        break;
      case ModelEnum.GroqMixtral32K:
        baseURL = config.groq.baseUrl;
        apiKey = config.groq.apiKey;
        model = ModelEnum.GroqMixtral32K;
        break;
      case ModelEnum.Mistral7B:
        baseURL = config.mistral.baseUrl;
        apiKey = config.mistral.apiKey;
        model = ModelEnum.Mistral7B;
        break;
      case ModelEnum.Mixtral7B:
        baseURL = config.mistral.baseUrl;
        apiKey = config.mistral.apiKey;
        model = ModelEnum.Mixtral7B;
        break;
      case ModelEnum.MistralSmall:
        baseURL = config.mistral.baseUrl;
        apiKey = config.mistral.apiKey;
        model = ModelEnum.MistralSmall;
        break;
      case ModelEnum.MistralMedium:
        baseURL = config.mistral.baseUrl;
        apiKey = config.mistral.apiKey;
        model = ModelEnum.MistralMedium;
        break;
      case ModelEnum.MistralLarge:
        baseURL = config.mistral.baseUrl;
        apiKey = config.mistral.apiKey;
        model = ModelEnum.MistralLarge;
        break;
      case ModelEnum.Local:
        baseURL = 'http://127.0.0.1:8093/v1';
        apiKey = '';
        model = ModelEnum.Local;
        break;
      default:
        baseURL = config.openai.baseUrl;
        apiKey = config.openai.apiKey;
        model = ModelEnum.ChatGPT3;
        break;
    }
    return { baseURL, apiKey, model };
  }
}
