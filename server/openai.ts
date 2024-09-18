import OpenAI from 'openai';

const openaiClientSingleton = () => {
  const { apiKey } = useRuntimeConfig().openai;

  return new OpenAI({
    apiKey,
  });
};

declare const globalThis: {
  openaiGlobal: ReturnType<typeof openaiClientSingleton>;
} & typeof global;

const openai = globalThis.openaiGlobal ?? openaiClientSingleton();

export default openai;

if (process.env.NODE_ENV !== 'production') globalThis.openaiGlobal = openai;
