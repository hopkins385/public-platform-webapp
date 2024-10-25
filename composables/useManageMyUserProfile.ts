import type { AsyncDataOptions } from '#app';

export default function useManageMyUserProfile() {
  const { $client } = useNuxtApp();
  const { data: auth } = useAuth();
  const ac = new AbortController();

  onScopeDispose(() => {
    ac.abort();
  });

  function getMe(options: AsyncDataOptions<any> = {}) {
    return useAsyncData(
      `user:${auth.value?.user.id}`,
      async () => {
        const user = await $client.me.user.query(undefined, {
          signal: ac.signal,
        });
        return user;
      },
      options,
    );
  }

  function updateMe({ firstName, lastName }: { firstName: string; lastName: string }) {
    return $client.me.update.mutate(
      { firstName, lastName },
      {
        signal: ac.signal,
      },
    );
  }

  function deleteMe({ userId, userName }: { userId: string; userName: string }) {
    return $client.me.delete.mutate(
      {
        userId,
        userName,
      },
      {
        signal: ac.signal,
      },
    );
  }

  return {
    getMe,
    updateMe,
    deleteMe,
  };
}
