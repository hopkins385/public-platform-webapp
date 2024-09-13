export default function useOnboarding() {
  const { $client } = useNuxtApp();
  const ac = new AbortController();

  onScopeDispose(() => {
    ac.abort();
  });

  function onboardUser(payload: { orgName: string }) {
    return $client.onboarding.newUserAction.mutate(
      {
        orgName: payload.orgName,
      },
      {
        signal: ac.signal,
      },
    );
  }

  return {
    onboardUser,
  };
}
