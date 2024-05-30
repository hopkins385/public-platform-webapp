import type { AsyncDataOptions } from '#app';

interface ICreateWorkflow {
  projectId: string;
  assistantId: string;
  name: string;
  description: string;
}

interface IReCreateWorkflowFromMedia {
  workflowId: string;
  mediaId: string;
}

interface IUpdateWorkflow {
  workflowId: string;
  name: string;
  description: string;
}

export default function useManageWorkflows() {
  const { $client } = useNuxtApp();
  const ac = new AbortController();

  const page = ref<number>(1);
  const projectId = ref<string | undefined>(undefined);
  let workflowId: string = '';

  onScopeDispose(() => {
    ac.abort();
  });

  function setPage(p: number) {
    page.value = p;
  }

  function setWorkflowId(id: string | string[] | undefined | null) {
    if (!id) return;
    if (Array.isArray(id)) return;
    workflowId = id;
  }

  function setProjectId(id: string | string[] | undefined | null) {
    if (!id) {
      projectId.value = undefined;
      return;
    }
    if (Array.isArray(id)) return;
    projectId.value = id;
  }

  function createWorkflow(payload: ICreateWorkflow) {
    return $client.workflow.create.mutate(
      { ...payload },
      {
        signal: ac.signal,
      },
    );
  }

  function reCreateWorkflowFromMedia(payload: IReCreateWorkflowFromMedia) {
    return $client.workflow.reCreateFromMedia.mutate(
      { ...payload },
      {
        signal: ac.signal,
      },
    );
  }

  function getProjectWorkflows(projectId: string | string[] | undefined | null, options: AsyncDataOptions<any> = {}) {
    return useAsyncData(
      `workflows:${projectId}`,
      async () => {
        const [workflows, meta] = await $client.workflow.allForProject.query(
          {
            projectId: projectId as string,
            page: page.value,
          },
          {
            signal: ac.signal,
          },
        );
        return { workflows, meta };
      },
      {
        watch: [page],
        ...options,
      },
    );
  }

  function getAllWorkflowsForUser(options: AsyncDataOptions<any> = {}) {
    return useAsyncData(
      `allWorkflowsForUser:${projectId.value}`,
      async () => {
        const [allWorkflows, meta] = await $client.workflow.allForUser.query(
          {
            projectId: projectId.value,
            page: page.value,
          },
          {
            signal: ac.signal,
          },
        );
        return { allWorkflows, meta };
      },
      {
        watch: [page, projectId],
        ...options,
      },
    );
  }

  // with assistants, steps, and documents
  function getFullWorkflow(id: string | string[] | undefined | null, options: AsyncDataOptions<any> = {}) {
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

  function getWorkflowSettings(id: string | string[] | undefined | null, options: AsyncDataOptions<any> = {}) {
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

  function exportWorkflow(id: string | string[] | undefined | null) {
    setWorkflowId(id);
    return $fetch.raw('/api/export/workflow', {
      method: 'POST',
      body: { workflowId },
      responseType: 'blob',
    });
  }

  return {
    page,
    projectId,
    setPage,
    setProjectId,
    setWorkflowId,
    createWorkflow,
    reCreateWorkflowFromMedia,
    getProjectWorkflows,
    getAllWorkflowsForUser,
    getFullWorkflow,
    getWorkflowSettings,
    updateWorkflow,
    deleteWorkflow,
    exportWorkflow,
  };
}
