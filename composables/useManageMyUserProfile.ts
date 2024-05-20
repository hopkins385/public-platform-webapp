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

  function updateMe(data: any) {
    return $client.me.update.mutate(
      { data },
      {
        signal: ac.signal,
      },
    );
  }

  function deleteMe(payload: { userId: string; password: string }) {
    return $client.me.delete.mutate(
      {
        userId: payload.userId,
        password: payload.password,
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
