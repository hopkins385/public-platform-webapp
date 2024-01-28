export default function useManageMyUserProfile() {
  const { $client } = useNuxtApp();
  const { data } = useAuth();
  const ac = new AbortController();

  let userId: string = '';
  let userEmail: string = '';

  onScopeDispose(() => {
    ac.abort();
  });

  function setUserId(id: string | string[] | undefined | null) {
    if (!id) return;
    if (Array.isArray(id)) return;
    userId = id;
  }

  function setEmail(value: string | string[] | undefined | null) {
    if (!value) return;
    if (Array.isArray(value)) return;
    userEmail = value;
  }

  function getMe() {
    setEmail(data?.value?.user?.email);
    return useAsyncData(async () => {
      const user = await $client.me.one.query(
        { email: userEmail },
        {
          signal: ac.signal,
        },
      );
      return user;
    });
  }

  function updateMe(data: any) {
    return $client.me.update.mutate(
      { id: userId, data },
      {
        signal: ac.signal,
      },
    );
  }

  function deleteMe(id: string) {
    // not implemented
  }

  return {
    setUserId,
    getMe,
    updateMe,
    deleteMe,
  };
}
