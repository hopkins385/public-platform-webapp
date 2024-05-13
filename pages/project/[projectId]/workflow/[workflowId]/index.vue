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

  const { projectId, workflowId } = useRoute().params;
  const { getProjectWorkflows } = useManageWorkflows();
  const { data } = await getProjectWorkflows(projectId as string);
  const projectWorkflows = computed(() =>
    data.value.workflows.map((w: any) => {
      return { id: w.id, name: w.name };
    }),
  );
</script>

<template>
  <div class="h-screen">
    <WorkflowHeading
      :project-workflows="projectWorkflows"
      :workflow-id="workflowId as string"
      :project-id="projectId as string"
    />
    <div class="size-full bg-white">
      <Suspense>
        <WorkflowSheet :workflow-id="workflowId as string" />
      </Suspense>
    </div>
  </div>
</template>
