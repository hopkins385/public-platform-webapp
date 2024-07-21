import type { RuntimeConfig } from 'nuxt/schema';
import type Anthropic from '@anthropic-ai/sdk';
import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { ChatGroq } from '@langchain/groq';
import { ChatMistralAI } from '@langchain/mistralai';

interface CreatePayload {
  temperature: number;
  maxTokens: number;
  stream?: boolean;
}

const openAiTools = [
  {
    type: 'function',
    function: {
      name: 'get_website_content',
      description: 'Get the content of a website',
      parameters: {
        type: 'object',
        properties: {
          url: {
            type: 'string',
            description: 'The URL of the website to scrape',
          },
        },
        required: ['url'],
      },
    },
  },
];

const anthropicTools: Anthropic.Messages.Tool[] = [
  {
    name: 'get_website_content',
    description: 'Get the content of a website',
    input_schema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'The URL of the website to scrape',
        },
      },
      required: ['url'],
    },
  },
];

export class CompletionFactory {
  private readonly model: string;
  private readonly config: RuntimeConfig;
  private readonly provider: string;

  constructor(provider: string, model: string, config: RuntimeConfig) {
    this.provider = provider;
    this.model = model;
    this.config = config;
  }

  async create(payload: CreatePayload) {
    switch (this.provider) {
      case 'openai':
        return new ChatOpenAI({
          apiKey: this.config.openai.apiKey,
          temperature: payload.temperature,
          model: this.model,
          streaming: payload.stream,
        }); // .bindTools(openAiTools);
        break;
      case 'anthropic':
        return new ChatAnthropic({
          apiKey: this.config.anthropic.apiKey,
          temperature: payload.temperature,
          model: this.model,
          streaming: payload.stream,
        });
        break;
      case 'groq':
        return new ChatGroq({
          apiKey: this.config.groq.apiKey,
          temperature: payload.temperature,
          model: this.model,
          streaming: payload.stream,
        });
        break;
      case 'mistral':
        return new ChatMistralAI({
          apiKey: this.config.mistral.apiKey,
          temperature: payload.temperature,
          model: this.model,
          streaming: payload.stream,
        });
        break;
      default:
        throw new Error('Provider not supported');
    }
  }
}
