<script setup lang="ts">
  /**
   * Workflow - Full Workflow
   * Route: /project/${projectId}/workflow/${workflowId}
   */
  definePageMeta({
    title: 'workflow.meta.full.title',
    validate: async (route) => {
      const validator = useRouteValidation();
      return validator.hasValidProjectWorkflowId(route.params);
    },
  });

  const { projectId, workflowId } = useRoute().params;
</script>

<template>
  <div class="bg-stone-50 p-1">
    <WorkflowList :workflow-id="workflowId as string" />
  </div>
</template>
