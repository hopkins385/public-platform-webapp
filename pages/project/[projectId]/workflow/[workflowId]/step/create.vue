<script setup lang="ts">
  /**
   * Workflow Step - Add new step to the workflow
   * Route: /project/${projectId}/workflow/${workflowId}/step/create
   */
  definePageMeta({
    title: 'workflowstep.meta.create.title',
    validate: async (route) => {
      const validator = useRouteValidation();
      return validator.hasValidProjectWorkflowId(route.params);
    },
  });
  const { projectId, workflowId } = useRoute().params;
</script>

<template>
  <div>New/Add Step</div>
  <div>Project ID: {{ projectId }}</div>
  <div>Workflow ID: {{ workflowId }}</div>
</template>
