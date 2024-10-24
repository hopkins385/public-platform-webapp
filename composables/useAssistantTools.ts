import type { AsyncDataOptions } from '#app';

export default function useAssistantTools() {
  const { $client } = useNuxtApp();
  const ac = new AbortController();

  onScopeDispose(() => {
    ac.abort();
  });

  async function getAllTools(options: AsyncDataOptions<any> = {}) {
    return useAsyncData(
      'allAssistantTools',
      async () => {
        return $client.tool.getAllTools.query(undefined, { signal: ac.signal });
      },
      options,
    );
  }

  return {
    getAllTools,
  };
}
