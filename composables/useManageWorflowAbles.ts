export default function useManageWorkflowAbles() {
  const { $client } = useNuxtApp();
  const ac = new AbortController();

  let page: number = 1;
  let workflowAbleId: string = '';

  throw new Error('Not implemented');

  onScopeDispose(() => {
    ac.abort();
  });

  function setPage(p: number) {
    page = p;
  }

  function setWorkflowAbleId(id: string | string[] | undefined | null) {
    if (!id) return;
    if (Array.isArray(id)) return;
    workflowAbleId = id;
  }

  function createWorkflowAble(payload: ICreateWorkflowAble) {
    return $client.workflowAble.create.mutate(
      { ...payload },
      {
        signal: ac.signal,
      },
    );
  }

  function getAllWorkflowAbles() {
    return useAsyncData(async () => {
      const [workflowAbles, meta] = await $client.workflowAble.all.query(
        { page },
        {
          signal: ac.signal,
        },
      );
      return { workflowAbles, meta };
    });
  }
}
