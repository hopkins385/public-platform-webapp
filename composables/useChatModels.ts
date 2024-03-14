export default function useChatModels() {
  const { $client } = useNuxtApp();
  const ac = new AbortController();

  onScopeDispose(() => {
    ac.abort();
  });

  function getAllModels() {
    return useAsyncData(async () => {
      const models = await $client.chatModels.getAll.query(undefined, {
        signal: ac.signal,
      });
      return models;
    });
  }

  return {
    getAllModels,
  };
}
