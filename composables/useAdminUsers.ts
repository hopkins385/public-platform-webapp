import type { AsyncDataOptions } from '#app';
import { useDebounceFn } from '@vueuse/core';

const page = ref(1);
const limit = ref(20);
const search = ref('');

function setPage(newPage: number) {
  page.value = Number(newPage);
}

function setLimit(newLimit: number) {
  limit.value = Number(newLimit);
}

const setSearch = useDebounceFn(
  (newSearch: string | number) => (search.value = newSearch.toString()),
  300,
);

export default function useAdminUsers() {
  const ac = new AbortController();
  const { $client } = useNuxtApp();

  onScopeDispose(() => {
    ac.abort();
  });

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

  return {
    page,
    limit,
    search,
    setPage,
    setLimit,
    setSearch,
    getUsersAllPaginated,
  };
}
