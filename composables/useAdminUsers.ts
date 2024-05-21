import type { AsyncDataOptions } from '#app';
import { useDebounceFn } from '@vueuse/core';

export default function useAdminUsers() {
  const ac = new AbortController();
  const { $client } = useNuxtApp();

  const page = ref(1);
  const limit = ref(20);
  const search = ref('');

  onScopeDispose(() => {
    ac.abort();
  });

  function setPage(newPage: number) {
    page.value = newPage;
  }

  function setLimit(newLimit: number) {
    limit.value = newLimit;
  }

  const setSearch = useDebounceFn(
    (newSearch: string | number) => (search.value = newSearch.toString()),
    300,
  );

  function getUsersAllPaginated(options: AsyncDataOptions<any> = {}) {
    return useAsyncData(
      `adminUsersAll:${page.value}`,
      () =>
        $client.admin.users.allPaginated.query(
          {
            page: page.value,
            limit: limit.value,
            search: search.value,
          },
          { signal: ac.signal },
        ),
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
