import type { AsyncDataOptions } from '#app';

export default function useLLMs() {
  const { $client } = useNuxtApp();
  const ac = new AbortController();

  onScopeDispose(() => {
    ac.abort();
  });

  function getAllModels(options: AsyncDataOptions<any> = {}) {
    return useAsyncData(async () => {
      return await $client.llms.all.query(undefined, {
        signal: ac.signal,
      });
    }, options);
  }

  return {
    getAllModels,
  };
}
