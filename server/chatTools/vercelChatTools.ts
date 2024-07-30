import { z } from 'zod';
import { tool } from 'ai';
import { scrapeWebsite } from '~/utils/scrapeWebsite';

// const stringRegex = new RegExp('^[a-zA-Z0-9, ]+$');

export function getTools(emitToolName: (toolName: string) => void) {
  const tools = {
    website: tool({
      description: 'Get information about a website',
      parameters: z.object({
        url: z
          .string()
          .url()
          .refine((url) => url.startsWith('https://'), {
            message: 'URL must start with https://',
          })
          .describe('The URL of the website to get information about'),
      }),
      execute: async function ({ url }) {
        emitToolName('website');
        console.log('url', url);
        const response = await scrapeWebsite(url);
        return response;
      },
    }),
  };

  return tools;
}
