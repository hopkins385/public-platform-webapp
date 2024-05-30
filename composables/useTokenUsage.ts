export default function useTokenUsage() {
  const ac = new AbortController();
  const { $client } = useNuxtApp();

  onScopeDispose(() => {
    ac.abort();
  });

  async function getTokenUsage() {
    return useAsyncData('tokenUsage', async () => {
      return $client.usage.tokenUsage.query(undefined, {
        signal: ac.signal,
      });
    });
  }

  return {
    getTokenUsage,
  };
}
