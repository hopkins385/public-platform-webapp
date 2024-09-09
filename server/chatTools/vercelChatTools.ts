import { z } from 'zod';
import { tool } from 'ai';
import { scrapeWebsite } from '~/server/utils/scrapeWebsite';
import { scrapeYoutube } from '~/server/utils/scrapeYoutube';
import { searchWeb } from '~/server/utils/searchWeb';

// const stringRegex = new RegExp('^[a-zA-Z0-9, ]+$');

export interface ToolInfoData {
  toolName: string;
  toolInfo: string;
}

export function getTools(emitToolInfoData: (toolInfoData: ToolInfoData) => void) {
  const tools = {
    website: tool({
      description: 'Get information about a website',
      parameters: z.object({
        url: z
          .string()
          .url()
          .min(10)
          .max(1000)
          .refine((url) => url.startsWith('https://'), {
            message: 'URL must start with https://',
          })
          .describe('The URL of the website to get information about'),
      }),
      execute: async function ({ url }) {
        const newUrl = new URL(url);
        emitToolInfoData({ toolName: 'website', toolInfo: `${newUrl.href}` });
        const result = await scrapeWebsite(newUrl);
        return result;
      },
    }),
    youtubeTranscript: tool({
      description: 'Get the transcript of a youtube video',
      parameters: z.object({
        urlOrId: z.string().describe('The URL or video id of the youtube video to get the transcript of'),
      }),
      execute: async function ({ urlOrId }) {
        emitToolInfoData({ toolName: 'youtubeTranscript', toolInfo: `${urlOrId}` });
        const result = await scrapeYoutube(urlOrId);
        return result;
      },
    }),
    searchWeb: tool({
      description: 'Search the web',
      parameters: z.object({
        query: z.string().min(3).max(100).describe('The query to search the web for'),
      }),
      execute: async function ({ query }) {
        emitToolInfoData({ toolName: 'searchWeb', toolInfo: `${query}` });
        const result = await searchWeb(query);
        return result;
      },
    }),
  };

  return tools;
}
