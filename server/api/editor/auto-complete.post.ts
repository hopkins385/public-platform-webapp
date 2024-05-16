import { CompletionFactoryStatic } from '../../factories/completionFactoryStatic';
import { getServerSession } from '#auth';
import type { ChatCompletion } from 'openai/resources/index.mjs';

export default defineEventHandler(async (_event) => {
  const session = await getServerSession(_event);
  const user = getAuthUser(session); // do not remove this line

  const body = await readBody(_event); // TODO: validate body
  const { input, context } = body;

  const sysPrompt =
    'Your task is to complete the given sentence. Only provide the missing sentence piece.';

  const payload = {
    messages: [
      {
        role: 'system',
        content: sysPrompt,
      },
      {
        role: 'user',
        content: input,
      },
    ],
    temperature: 0.8,
    maxTokens: 100,
    stream: false,
  };

  const completion = new CompletionFactoryStatic('groq', 'llama3-8b-8192');
  const response = (await completion.create(payload)) as ChatCompletion;

  const completionText = response.choices[0].message.content;

  return {
    completion: completionText,
  };
});
