export default function useStripe() {
  const { $client } = useNuxtApp();
  const ac = new AbortController();

  onScopeDispose(() => {
    ac.abort();
  });

  function getCheckoutUrl() {
    return useAsyncData(() => {
      return $client.getStripeCheckoutUrl.query(undefined, {
        signal: ac.signal,
      });
    });
  }

  return {
    getCheckoutUrl,
  };
}
