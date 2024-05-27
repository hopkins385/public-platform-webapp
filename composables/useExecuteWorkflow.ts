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

  function executeWorkflow(id: string | string[] | undefined | null) {
    setWorkflowId(id);
    return $client.workflowExec.execute.mutate(
      { workflowId },
      {
        signal: ac.signal,
      },
    );
  }

  return {
    executeWorkflow,
  };
}
