export default function useProviderAuth() {
  const { $client } = useNuxtApp();
  const ac = new AbortController();

  function getProviderAuthTokens(type: 'googledrive' | 'onedrive') {
    let name: 'google' | 'microsoft';
    switch (type) {
      case 'googledrive':
        name = 'google';
        break;
      case 'onedrive':
        name = 'microsoft';
        break;
      default:
        throw new Error('Invalid providerName');
    }
    return useAsyncData(`providerAuth:${name}-${type}`, async () => {
      const providerAuth = await $client.providerAuth.get.query(
        {
          providerName: name,
          type,
        },
        {
          signal: ac.signal,
        },
      );
      return providerAuth;
    });
  }

  return {
    getProviderAuthTokens,
  };
}
