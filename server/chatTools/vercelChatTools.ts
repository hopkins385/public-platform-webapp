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
        return {
          response,
        };
      },
    }),
    /*weather: tool({
      description: 'Get the weather in a location',
      parameters: z.object({
        location: z.string().min(2).max(20).describe('The location to get the weather for'),
        unit: z.enum(['C', 'F']).describe('The unit to display the temperature in'),
      }),
      execute: async function ({ location, unit }) {
        callback('weather');
        // wait for 2 seconds
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return {
          location: location,
          temperature: 20 + Math.floor(Math.random() * 21) - 10,
          unit: unit,
        };
      },
    }),*/
  };

  return tools;
}
