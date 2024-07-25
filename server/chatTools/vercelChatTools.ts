import { z } from 'zod';
import { tool } from 'ai';

export function getTools(callback: (isExecuting: boolean) => void) {
  const tools = {
    weather: tool({
      description: 'Get the weather in a location',
      parameters: z.object({
        location: z.string().describe('The location to get the weather for'),
      }),
      execute: async ({ location }) => {
        callback(true);
        return {
          location,
          temperature: 72 + Math.floor(Math.random() * 21) - 10,
        };
      },
    }),
  };

  return tools;
}
