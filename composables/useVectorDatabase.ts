export default function useVectorDatabase() {
  const { $client } = useNuxtApp();
  const ac = new AbortController();

  onScopeDispose(() => {
    ac.abort();
  });

  function queryDocuments(query: string) {
    return useAsyncData(async () => {
      const response = await $client.embed.queryDocuments.query({
        query,
      });
      return response;
    });
  }

  return {
    queryDocuments,
  };
}
