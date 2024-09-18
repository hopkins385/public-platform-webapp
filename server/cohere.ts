import { CohereClient } from 'cohere-ai';

const cohereClientSingleton = () => {
  const { apiKey } = useRuntimeConfig().cohere;

  return new CohereClient({
    token: apiKey,
  });
};

declare const globalThis: {
  cohereGlobal: ReturnType<typeof cohereClientSingleton>;
} & typeof global;

const cohere = globalThis.cohereGlobal ?? cohereClientSingleton();

export default cohere;

if (process.env.NODE_ENV !== 'production') globalThis.cohereGlobal = cohere;
