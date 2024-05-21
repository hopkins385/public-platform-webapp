import type { AsyncDataOptions } from '#app';
import { useDebounceFn } from '@vueuse/core';

export default function useAdminTeams() {
  const ac = new AbortController();
  const { $client } = useNuxtApp();

  const page = ref(1);
  const search = ref('');

  onScopeDispose(() => {
    ac.abort();
  });

  function setPage(newPage: number) {
    page.value = newPage;
  }

  const setSearch = useDebounceFn(
    (newSearch: string | number) => (search.value = newSearch.toString()),
    300,
  );

  function getTeamsAllPaginated(options: AsyncDataOptions<any> = {}) {
    return useAsyncData(
      `adminTeamsAll:${page.value}`,
      () =>
        $client.admin.teams.allPaginated.query(
          {
            page: page.value,
            search: search.value,
          },
          { signal: ac.signal },
        ),
      { watch: [page, search], ...options },
    );
  }

  return {
    search,
    setPage,
    setSearch,
    getTeamsAllPaginated,
  };
}
