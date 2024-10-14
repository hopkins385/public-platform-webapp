import { z } from 'zod';
import { tool } from 'ai';
import { scrapeWebsite } from '~/server/utils/scrapeWebsite';
import { scrapeYoutube } from '~/server/utils/scrapeYoutube';
import { searchWeb } from '~/server/utils/searchWeb';

export interface ToolInfoData {
  toolName: string;
  toolInfo: string;
}

// Define a type for the emitToolInfoData function
type EmitToolInfoData = (toolInfoData: ToolInfoData) => void;

// Define a type for the tool configuration
interface ToolConfig {
  name: string;
  description: string;
  parameters: Record<string, z.ZodType<any, any>>;
  execute: (params: any, emitToolInfoData: EmitToolInfoData) => Promise<any>;
}

async function generateImage(imageDescription: string) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ imageUrl: 'https://via.placeholder.com/150' });
    }, 1000);
  });
}

// Define tool configurations
const toolConfigs: ToolConfig[] = [
  {
    name: 'imageGenerator',
    description: 'Generates an image by describing it',
    parameters: {
      imageDescription: z.string().min(1).max(4000).describe('The text to describe an image'),
    },
    execute: async ({ imageDescription }, emitToolInfoData) => {
      emitToolInfoData({ toolName: 'imageGenerator', toolInfo: `${imageDescription}` });
      return generateImage(imageDescription);
    },
  },
  {
    name: 'website',
    description: 'Get information about a website',
    parameters: {
      url: z
        .string()
        .url()
        .min(10)
        .max(1000)
        .refine((url) => url.startsWith('https://'), {
          message: 'URL must start with https://',
        })
        .describe('The URL of the website to get information about'),
    },
    execute: async ({ url }, emitToolInfoData) => {
      const newUrl = new URL(url);
      emitToolInfoData({ toolName: 'website', toolInfo: `${newUrl.href}` });
      return scrapeWebsite(newUrl);
    },
  },
  {
    name: 'youtubeTranscript',
    description: 'Get the transcript of a youtube video',
    parameters: {
      urlOrId: z.string().describe('The URL or video id of the youtube video to get the transcript of'),
    },
    execute: async ({ urlOrId }, emitToolInfoData) => {
      emitToolInfoData({ toolName: 'youtubeTranscript', toolInfo: `${urlOrId}` });
      return scrapeYoutube(urlOrId);
    },
  },
  {
    name: 'searchWeb',
    description: 'Search the web',
    parameters: {
      query: z.string().min(3).max(100).describe('The query to search the web for'),
    },
    execute: async ({ query }, emitToolInfoData) => {
      emitToolInfoData({ toolName: 'searchWeb', toolInfo: `${query}` });
      return searchWeb(query);
    },
  },
];

// Factory function to create a tool
function createTool(config: ToolConfig, emitToolInfoData: EmitToolInfoData) {
  return tool({
    description: config.description,
    parameters: z.object(config.parameters),
    execute: async (params) => config.execute(params, emitToolInfoData),
  });
}

// Define a type for the tools object
type Tools = Record<string, ReturnType<typeof createTool>>;

export function getTools(emitToolInfoData: EmitToolInfoData): Tools {
  const tools: Tools = {};

  for (const config of toolConfigs) {
    tools[config.name] = createTool(config, emitToolInfoData);
  }

  return tools;
}
