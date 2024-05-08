import type { AsyncDataOptions } from '#app';

export default function useExecuteWorkflow() {
  const { $client } = useNuxtApp();
  const ac = new AbortController();

  let workflowId: string = '';

  onScopeDispose(() => {
    ac.abort();
  });

  function setWorkflowId(id: string | string[] | undefined | null) {
    if (!id) return;
    if (Array.isArray(id)) return;
    workflowId = id;
  }

  async function executeWorkflow(
    id: string | string[] | undefined | null,
    options?: AsyncDataOptions<any>,
  ) {
    setWorkflowId(id);
    return useAsyncData(
      `executeWorkflow:${workflowId}`,
      async () => {
        return await $client.workflowExec.execute.mutate(
          { workflowId },
          {
            signal: ac.signal,
          },
        );
      },
      options,
    );
  }

  return {
    executeWorkflow,
  };
}
