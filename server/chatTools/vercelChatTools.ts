import { z } from 'zod';
import { tool } from 'ai';
import { scrapeWebsite } from '~/utils/scrapeWebsite';

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
        try {
          const result = await scrapeWebsite(newUrl);
          return result;
        } catch (error) {
          return { error: 'cannot scrape website. does it exist?' };
        }
      },
    }),
  };

  return tools;
}
