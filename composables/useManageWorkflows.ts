import type { AsyncDataOptions } from '#app';

export interface ICreateWorkflow {
  projectId: string;
  assistantId: string;
  name: string;
  description: string;
}

export interface IUpdateWorkflow {
  workflowId: string;
  name: string;
  description: string;
}

export default function useManageWorkflows() {
  const { $client } = useNuxtApp();
  const ac = new AbortController();

  let page: number = 1;
  let workflowId: string = '';

  onScopeDispose(() => {
    ac.abort();
  });

  function setPage(p: number) {
    page = p;
  }

  function setWorkflowId(id: string | string[] | undefined | null) {
    if (!id) return;
    if (Array.isArray(id)) return;
    workflowId = id;
  }

  function createWorkflow(payload: ICreateWorkflow) {
    return $client.workflow.create.mutate(
      { ...payload },
      {
        signal: ac.signal,
      },
    );
  }

  function getProjectWorkflows(
    projectId: string | string[] | undefined | null,
    options: AsyncDataOptions<any> = {},
  ) {
    return useAsyncData(
      `workflows:${projectId}`,
      async () => {
        const [workflows, meta] = await $client.workflow.allForProject.query(
          {
            projectId: projectId as string,
            page,
          },
          {
            signal: ac.signal,
          },
        );
        return { workflows, meta };
      },
      options,
    );
  }

  function getAllWorkflowsForUser(options: AsyncDataOptions<any> = {}) {
    return useAsyncData(
      `allWorkflowsForUser`,
      async () => {
        const [allWorkflows, meta] = await $client.workflow.allForUser.query(
          {
            page,
          },
          {
            signal: ac.signal,
          },
        );
        return { allWorkflows, meta };
      },
      options,
    );
  }

  function getFullWorkflow(
    id: string | string[] | undefined | null,
    options: AsyncDataOptions<any> = {},
  ) {
    setWorkflowId(id);
    return useAsyncData(
      `workflow:${workflowId}`,
      async () => {
        if (!workflowId) return;
        const workflow = await $client.workflow.full.query(
          { workflowId },
          {
            signal: ac.signal,
          },
        );
        return workflow;
      },
      options,
    );
  }

  function getWorkflowSettings(
    id: string | string[] | undefined | null,
    options: AsyncDataOptions<any> = {},
  ) {
    setWorkflowId(id);
    return useAsyncData(
      `workflowSettings:${workflowId}`,
      async () => {
        if (!workflowId) return;
        const workflow = await $client.workflow.settings.query(
          { workflowId },
          {
            signal: ac.signal,
          },
        );
        return workflow;
      },
      options,
    );
  }

  function updateWorkflow(payload: IUpdateWorkflow) {
    return $client.workflow.update.mutate(
      { ...payload },
      {
        signal: ac.signal,
      },
    );
  }

  function deleteWorkflow(id: string | string[] | undefined | null) {
    setWorkflowId(id);
    return $client.workflow.delete.mutate(
      { workflowId },
      {
        signal: ac.signal,
      },
    );
  }

  return {
    setPage,
    setWorkflowId,
    createWorkflow,
    getProjectWorkflows,
    getAllWorkflowsForUser,
    getFullWorkflow,
    getWorkflowSettings,
    updateWorkflow,
    deleteWorkflow,
  };
}
