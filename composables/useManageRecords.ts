interface ICreateRecord {
  collectionId: string;
  mediaId: string;
}

export default function useManageRecords() {
  const { $client } = useNuxtApp();
  const ac = new AbortController();

  let page: number = 1;
  let limit: number = 10;

  onScopeDispose(() => {
    ac.abort();
  });

  function setPage(p: number) {
    page = p;
  }

  async function createRecord(payload: ICreateRecord) {
    return $client.record.create.mutate(
      { ...payload },
      {
        signal: ac.signal,
      },
    );
  }

  return {
    createRecord,
  };
}
