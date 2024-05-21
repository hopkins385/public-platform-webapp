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

export default function useAdminTeams() {
  const ac = new AbortController();
  const { $client } = useNuxtApp();

  onScopeDispose(() => {
    ac.abort();
  });

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

  return {
    page,
    limit,
    search,
    setPage,
    setLimit,
    setSearch,
    getTeamsAllPaginated,
  };
}
