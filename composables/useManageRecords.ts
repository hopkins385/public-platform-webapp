import type { AsyncDataOptions } from '#app';

interface ICreateRecord {
  collectionId: string;
  mediaId: string;
}

export default function useManageRecords() {
  const { $client } = useNuxtApp();
  const ac = new AbortController();

  const page = ref<number>(1);
  const limit = ref<number>(10);
  let collectionId: string = '';

  onScopeDispose(() => {
    ac.abort();
  });

  function setPage(p: number) {
    page.value = p;
  }

  function setCollectionId(id: string | string[] | undefined | null) {
    if (!id) return;
    if (Array.isArray(id)) return;
    collectionId = id;
  }

  async function createRecord(payload: ICreateRecord) {
    return $client.record.create.mutate(
      { ...payload },
      {
        signal: ac.signal,
      },
    );
  }

  function findAllPaginated(id: string | string[] | undefined | null, options: AsyncDataOptions<any> = {}) {
    setCollectionId(id);
    return useAsyncData(
      `records:${collectionId}`,
      async () => {
        const [records, meta] = await $client.record.findAllPaginated.query(
          {
            collectionId,
            page: page.value,
            limit: limit.value,
          },
          {
            signal: ac.signal,
          },
        );
        return { records, meta };
      },
      {
        watch: [page, limit],
        ...options,
      },
    );
  }

  function deleteRecord(recordId: string) {
    return $client.record.delete.mutate(
      { recordId },
      {
        signal: ac.signal,
      },
    );
  }

  return {
    setPage,
    createRecord,
    findAllPaginated,
    deleteRecord,
  };
}
