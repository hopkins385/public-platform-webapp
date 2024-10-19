import { services } from '~/server/service-instances';

export default defineEventHandler(async (_event) => {
  // Needs Auth
  const user = await services.authService.getAuthUser(_event);

  const body = await readBody(_event); // TODO: validate body
  const { input, context } = body;

  const sysPrompt = 'Your task is to complete the given sentence. Only provide the missing sentence piece.';

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

  throw createError({
    statusCode: 500,
    statusMessage: 'Internal Server Error',
    message: 'Not implemented',
  });

  //const completion = new CompletionFactoryStatic('groq', 'llama3-8b-8192');
  //const response = (await completion.create(payload)) as ChatCompletion;
  //
  //const completionText = response.choices[0].message.content;
  //
  //return {
  //  completion: completionText,
  //};
});
