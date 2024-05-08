export default function useManageUsers() {
  const { $client } = useNuxtApp();
  const ac = new AbortController();

  throw new Error('Not implemented');

  let page: number = 1;
  let userId: string = '';

  onScopeDispose(() => {
    ac.abort();
  });

  function setPage(p: number) {
    page = p;
  }

  function setUserId(id: string | string[] | undefined | null) {
    if (!id) return;
    if (Array.isArray(id)) return;
    userId = id;
  }

  function getAllUsers() {
    return useAsyncData(async () => {
      const [users, meta] = await $client.user.all.query(
        { page },
        {
          signal: ac.signal,
        },
      );
      return { users, meta };
    });
  }

  function getOneUser() {
    return useAsyncData(async () => {
      const user = await $client.user.one.query(
        { id: userId },
        {
          signal: ac.signal,
        },
      );
      return user;
    });
  }

  function updateUser(data: any) {
    return $client.user.update.mutate(
      { id: userId, data },
      {
        signal: ac.signal,
      },
    );
  }

  function deleteUser(id: string) {
    return $client.user.delete.mutate(
      { id },
      {
        signal: ac.signal,
      },
    );
  }

  return {
    getAllUsers,
    getOneUser,
    updateUser,
    deleteUser,
    setUserId,
    setPage,
  };
}
