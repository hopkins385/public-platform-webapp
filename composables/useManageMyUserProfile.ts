import type { AsyncDataOptions } from '#app';

export default function useManageMyUserProfile() {
  const { $client } = useNuxtApp();
  const ac = new AbortController();

  onScopeDispose(() => {
    ac.abort();
  });

  function getMe(options: AsyncDataOptions<any> = {}) {
    return useAsyncData(
      `meUserData`,
      async () => {
        const user = await $client.me.user.query(undefined, {
          signal: ac.signal,
        });
        return user;
      },
      options,
    );
  }

  function updateMe(data: any) {
    return $client.me.update.mutate(
      { data },
      {
        signal: ac.signal,
      },
    );
  }

  function deleteMe(id: string) {
    // not implemented
  }

  return {
    getMe,
    updateMe,
    deleteMe,
  };
}
