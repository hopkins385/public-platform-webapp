import type { AsyncDataOptions } from '#app';

interface ICreateWorkflowStep {
  workflowId: string;
  projectId: string;
  assistantId: string;
  name: string;
  description: string;
  orderColumn: number;
  rowCount: number;
}

interface IUpdateWorkflowStep {
  workflowStepId: string;
  name: string;
  description: string;
  orderColumn: number;
}

export default function useManageWorkflowSteps() {
  const { $client } = useNuxtApp();
  const ac = new AbortController();

  let page: number = 1;
  let workflowStepId: string = '';

  onScopeDispose(() => {
    ac.abort();
  });

  function setPage(p: number) {
    page = p;
  }

  function setWorkflowStepId(id: string | string[] | undefined | null) {
    if (!id) return;
    if (Array.isArray(id)) return;
    workflowStepId = id;
  }

  async function createWorkflowStep(input: ICreateWorkflowStep) {
    return $client.workflowStep.create.mutate(
      { ...input },
      {
        signal: ac.signal,
      },
    );
  }

  async function getWorkflowStep(id: string | string[] | undefined | null, options: AsyncDataOptions<any> = {}) {
    setWorkflowStepId(id);
    return useAsyncData(
      `workflowStep:${workflowStepId}`,
      async () => {
        return $client.workflowStep.first.query(
          { workflowStepId },
          {
            signal: ac.signal,
          },
        );
      },
      options,
    );
  }

  async function getFullWorkflowStep(id: string | string[] | undefined | null, options: AsyncDataOptions<any> = {}) {
    setWorkflowStepId(id);
    return useAsyncData(
      `fullWorkflowStep:${workflowStepId}`,
      async () => {
        return $client.workflowStep.firstWithSteps.query(
          { workflowStepId },
          {
            signal: ac.signal,
          },
        );
      },
      options,
    );
  }

  async function updateWorkflowStep(input: IUpdateWorkflowStep) {
    return $client.workflowStep.update.mutate(
      { ...input },
      {
        signal: ac.signal,
      },
    );
  }

  async function updateWorkflowStepAssistant(payload: { workflowStepId: string; assistantId: string }) {
    return $client.workflowStep.updateAssistant.mutate(
      {
        workflowStepId: payload.workflowStepId,
        assistantId: payload.assistantId,
      },
      {
        signal: ac.signal,
      },
    );
  }

  async function updateWorkflowStepName(workflowStepId: string, name: string) {
    return $client.workflowStep.updateName.mutate(
      { workflowStepId, name },
      {
        signal: ac.signal,
      },
    );
  }

  async function deleteWorkflowStep(id: string) {
    return $client.workflowStep.delete.mutate(
      { workflowStepId: id },
      {
        signal: ac.signal,
      },
    );
  }

  return {
    createWorkflowStep,
    getWorkflowStep,
    getFullWorkflowStep,
    updateWorkflowStep,
    updateWorkflowStepName,
    updateWorkflowStepAssistant,
    deleteWorkflowStep,
  };
}
