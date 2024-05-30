import type { AsyncDataOptions } from '#app';
import { useDebounceFn } from '@vueuse/core';

export default function useAdminTeams() {
  const ac = new AbortController();
  const { $client } = useNuxtApp();

  onScopeDispose(() => {
    ac.abort();
  });

  const page = ref(1);
  const limit = ref(10);
  const search = ref('');

  function setPage(newPage: number) {
    page.value = Number(newPage);
  }

  function setLimit(newLimit: number) {
    limit.value = Number(newLimit);
  }

  const setSearch = useDebounceFn((newSearch: string | number) => (search.value = newSearch.toString()), 300);

  function getTeamsAllPaginated(options: AsyncDataOptions<any> = {}) {
    return useAsyncData(
      `adminTeamsAll:${page.value}`,
      async () => {
        const [teams, meta] = await $client.admin.teams.allPaginated.query(
          {
            page: page.value,
            limit: limit.value,
            search: search.value,
          },
          { signal: ac.signal },
        );
        return { teams, meta };
      },
      {
        watch: [page, limit, search],
        ...options,
      },
    );
  }

  function deleteTeam(id: string) {
    return $client.admin.teams.deleteTeam.mutate({ id });
  }

  return {
    page,
    limit,
    search,
    setPage,
    setLimit,
    setSearch,
    getTeamsAllPaginated,
    deleteTeam,
  };
}
