<script setup lang="ts">
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

  const showTable = ref(true);

  const { projectId, workflowId } = useRoute().params;
  const { getProjectWorkflows } = useManageWorkflows();
  const { data } = await getProjectWorkflows(projectId as string);
  const projectWorkflows = computed(() =>
    data.value.workflows.map((w: any) => {
      return { id: w.id, name: w.name };
    }),
  );

  const socket = useWebsocket();

  function workflowUpdateListener(message: any) {
    console.log('workflow channel message', message);
  }

  onMounted(() => {
    // socket.emit('join', `workflow-${workflowId}`);
    socket.on(`workflow-${workflowId}-update`, workflowUpdateListener);
  });

  onBeforeUnmount(() => {
    // socket.emit('leave', `workflow-${workflowId}`);
    socket.off(`workflow-${workflowId}-update`, workflowUpdateListener);
  });
</script>

<template>
  <div class="h-full">
    <WorkflowHeading
      :project-workflows="projectWorkflows"
      :workflow-id="workflowId as string"
      :project-id="projectId as string"
      v-model:show-table-view="showTable"
    />
    <div class="h-full bg-white">
      <!-- size-full -->
      <Suspense>
        <WorkflowSheet
          v-if="showTable"
          :workflow-id="workflowId as string"
          :project-id="projectId as string"
        />
        <WorkflowFlowView v-else :workflow-id="workflowId as string" />
      </Suspense>
    </div>
  </div>
</template>
