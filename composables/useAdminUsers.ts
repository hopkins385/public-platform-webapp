import type { AsyncDataOptions } from '#app';
import { useDebounceFn } from '@vueuse/core';

interface CreateUser {
  email: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
  password?: string;
}

export default function useAdminUsers() {
  const ac = new AbortController();
  const { $client } = useNuxtApp();

  onScopeDispose(() => {
    ac.abort();
  });

  const page = ref(1);
  const limit = ref(10);
  const search = ref('');
  const userId = ref('');

  function setPage(newPage: number) {
    page.value = Number(newPage);
  }

  function setLimit(newLimit: number) {
    limit.value = Number(newLimit);
  }

  function setUserId(id: string | string[] | undefined | null) {
    if (!id) return;
    if (Array.isArray(id)) return;
    userId.value = id;
  }

  const setSearch = useDebounceFn((newSearch: string | number) => (search.value = newSearch.toString()), 300);

  function getUsersAllPaginated(options: AsyncDataOptions<any> = {}) {
    return useAsyncData(
      `adminUsersAll:${page.value}`,
      async () => {
        const [users, meta] = await $client.admin.users.allPaginated.query(
          {
            page: page.value,
            limit: limit.value,
            search: search.value,
          },
          { signal: ac.signal },
        );
        return { users, meta };
      },
      { watch: [page, limit, search], ...options },
    );
  }

  function getUser() {
    if (!userId.value || userId.value === '') {
      throw new Error('User ID is required');
    }
    return useAsyncData(`adminUser:${userId.value}`, () => {
      return $client.admin.users.first.query({ id: userId.value }, { signal: ac.signal });
    });
  }

  function createUser(data: CreateUser) {
    return $client.admin.users.create.mutate(data);
  }

  function updateUser(data: CreateUser) {
    return $client.admin.users.update.mutate({ id: userId.value, ...data });
  }

  function deleteUser(id: string) {
    return $client.admin.users.delete.mutate({ id });
  }

  return {
    page,
    limit,
    search,
    userId,
    setPage,
    setLimit,
    setSearch,
    setUserId,
    getUsersAllPaginated,
    createUser,
    deleteUser,
    getUser,
    updateUser,
  };
}
