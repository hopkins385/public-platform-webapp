import { z } from 'zod';
import { tool } from 'ai';
import { scrapeWebsite } from '~/server/utils/scrapeWebsite';
import { scrapeYoutube } from '~/server/utils/scrapeYoutube';
import { searchWeb } from '~/server/utils/searchWeb';
import { getGoogleMapsDirections } from '../utils/getDirections';

export interface ToolInfoData {
  toolName: string;
  toolInfo: string;
}

// Define a type for the emitToolInfoData function
type EmitToolInfoData = (toolInfoData: ToolInfoData) => void;

// Define a type for the tool configuration
interface ToolConfig {
  id: number;
  name: string;
  description: string;
  parameters: Record<string, z.ZodType<any, any>>;
  execute: (params: any, emitToolInfoData: EmitToolInfoData) => Promise<any>;
}

async function generateImage(imageDescription: string) {
  const imgUrl = `https://via.placeholder.com/500?text=${encodeURIComponent(imageDescription)}`;
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ imageUrl: imgUrl });
    }, 1000);
  });
}

// Define tool configurations
const toolConfigs: ToolConfig[] = [
  {
    id: 1,
    name: 'directions',
    description: 'Get directions between two or more locations and optional including waypoints',
    parameters: {
      start: z.string().min(1).max(100).describe('The starting location'),
      destination: z.string().min(1).max(100).describe('The destination location'),
      waypoints: z.array(z.string().min(1).max(100)).optional().describe('The waypoints to visit along the way'),
    },
    execute: async ({ start, destination, waypoints }, emitToolInfoData) => {
      emitToolInfoData({ toolName: 'directions', toolInfo: `${start} to ${destination}` });
      return await getGoogleMapsDirections(start, destination, waypoints);
    },
  },
  // {
  //   id: 2,
  //   name: 'imageGenerator',
  //   description: 'Generates an image by describing it',
  //   parameters: {
  //     imageDescription: z.string().min(1).max(4000).describe('The text to describe an image'),
  //   },
  //   execute: async ({ imageDescription }, emitToolInfoData) => {
  //     emitToolInfoData({ toolName: 'imageGenerator', toolInfo: `${imageDescription}` });
  //     return await generateImage(imageDescription);
  //   },
  // },
  {
    id: 3,
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
    id: 4,
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
    id: 5,
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

export function getTools(functionIds: number[] | null, emitToolInfoData: EmitToolInfoData): Tools | undefined {
  const tools: Tools = {};

  if (!functionIds || functionIds.length < 1) {
    return undefined;
  }

  const filteredConfigs = toolConfigs.filter((config) => functionIds.includes(config.id));

  for (const config of filteredConfigs) {
    tools[config.name] = createTool(config, emitToolInfoData);
  }

  return tools;
}
