export default function useTokenizer() {
  const { $client } = useNuxtApp();
  const ac = new AbortController();

  let content = '';

  onScopeDispose(() => {
    ac.abort();
  });

  function setContent(newContent: string) {
    content = newContent;
  }

  function getTokenData() {
    return useAsyncData(() => {
      return $client.tokenizer.getTokens.query(
        { content },
        {
          signal: ac.signal,
        },
      );
    });
  }

  return {
    setContent,
    getTokenData,
  };
}
