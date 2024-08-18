<script setup lang="ts">
  /**
   * Workflow - Full Workflow
   * Route: /projects/${projectId}/workflows/${workflowId}
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

  const showTable = ref(true);
  const refreshWorkflowData = ref(false);

  const { projectId, workflowId } = useRoute().params;

  const { getProjectWorkflows } = useManageWorkflows();
  const { data } = await getProjectWorkflows(projectId as string);

  const projectWorkflows = computed(() =>
    data.value.workflows.map((w: any) => {
      return { id: w.id, name: w.name };
    }),
  );

  async function onRefreshWorkflowData() {
    // set the refresh flag to true to trigger a refresh of the workflow data
    // set the flag to false after 1 second to prevent multiple refreshes
    refreshWorkflowData.value = true;
    setTimeout(() => {
      refreshWorkflowData.value = false;
    }, 500);
  }
</script>

<template>
  <div id="workflowContainer" class="h-full">
    <WorkflowHeading
      v-model:show-table-view="showTable"
      :project-workflows="projectWorkflows"
      :workflow-id="workflowId as string"
      :project-id="projectId as string"
      @refresh-workflow-data="onRefreshWorkflowData"
    />
    <div class="min-h-full overflow-x-scroll bg-white">
      <Suspense>
        <WorkflowSheet
          v-if="showTable"
          :workflow-id="workflowId as string"
          :project-id="projectId as string"
          :refresh-data="refreshWorkflowData"
        />
        <WorkflowFlowView v-else :workflow-id="workflowId as string" />
      </Suspense>
    </div>
  </div>
</template>
