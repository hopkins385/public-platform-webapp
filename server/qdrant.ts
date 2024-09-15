import { QdrantClient } from '@qdrant/js-client-rest';

const qdrantClientSingleton = () => {
  const { host, port } = useRuntimeConfig().qdrant;
  return new QdrantClient({
    host,
    port: Number(port),
  });
};

declare const globalThis: {
  qdrantGlobal: ReturnType<typeof qdrantClientSingleton>;
} & typeof global;

const qdrant = globalThis.qdrantGlobal ?? qdrantClientSingleton();

export default qdrant;

if (process.env.NODE_ENV !== 'production') globalThis.qdrantGlobal = qdrant;
