<script setup lang="ts">
  import { PlayIcon } from 'lucide-vue-next';

  /**
   * Workflow - Full Workflow
   * Route: /project/${projectId}/workflow/${workflowId}
   */
  definePageMeta({
    title: 'workflow.meta.full.title',
    breadcrumb: {
      icon: 'folders',
      ariaLabel: 'Workflow',
      label: 'Active Workflow',
    },
    validate: async (route) => {
      const validator = useRouteValidation();
      return validator.hasValidProjectWorkflowId(route.params);
    },
  });
  const route = useRoute();
  const { projectId, workflowId } = useRoute().params;
  const { getWorkflowSettings } = useManageWorkflows();
  const { data } = getWorkflowSettings(workflowId);

  route.meta.breadcrumb.label = data.value?.name;

  async function onPlayClick() {
    const { executeWorkflow } = useExecuteWorkflow();
    const { error } = await executeWorkflow(workflowId);
  }
</script>

<template>
  <div class="px-5 py-10">
    <BoxContainer class="p-5">
      <Button variant="outline" @click="onPlayClick">
        <PlayIcon class="size-3" />
      </Button>
    </BoxContainer>
    <BoxContainer class="mt-4 p-5">
      <Suspense>
        <WorkflowList :workflow-id="workflowId as string" />
      </Suspense>
    </BoxContainer>
  </div>
</template>
