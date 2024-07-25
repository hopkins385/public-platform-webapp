import type { RuntimeConfig } from 'nuxt/schema';
import type Anthropic from '@anthropic-ai/sdk';
import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { ChatGroq } from '@langchain/groq';
import { ChatMistralAI } from '@langchain/mistralai';
import { convertToOpenAITool } from '@langchain/core/utils/function_calling';

interface CreatePayload {
  temperature: number;
  maxTokens: number;
  stream?: boolean;
  signal?: AbortSignal;
  tools?: any[];
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

export class LangchainCompletionFactory {
  private readonly model: string;
  private readonly config: RuntimeConfig;
  private readonly provider: string;

  constructor(provider: string, model: string, config: RuntimeConfig) {
    this.provider = provider;
    this.model = model;
    this.config = config;
  }

  convertOpenAITools(tools: any[] | undefined): any[] | undefined {
    if (!tools) {
      return undefined;
    }
    return tools.map((tool) => {
      return convertToOpenAITool(tool);
    });
  }

  create(payload: CreatePayload) {
    switch (this.provider) {
      case 'openai':
        return new ChatOpenAI({
          apiKey: this.config.openai.apiKey,
          temperature: payload.temperature,
          model: this.model,
          streaming: payload.stream,
        }).bind({ signal: payload.signal, tools: this.convertOpenAITools(payload.tools) });
        break;
      case 'anthropic':
        return new ChatAnthropic({
          apiKey: this.config.anthropic.apiKey,
          temperature: payload.temperature,
          model: this.model,
          streaming: payload.stream,
        }).bind({ signal: payload.signal });
        break;
      case 'groq':
        return new ChatGroq({
          apiKey: this.config.groq.apiKey,
          temperature: payload.temperature,
          model: this.model,
          streaming: payload.stream,
        }).bind({ signal: payload.signal });
        break;
      case 'mistral':
        return new ChatMistralAI({
          apiKey: this.config.mistral.apiKey,
          temperature: payload.temperature,
          model: this.model,
          streaming: payload.stream,
        }).bind({ signal: payload.signal });
        break;
      default:
        throw new Error('Provider not supported');
    }
  }
}
