<script setup lang="ts">
  const { projectId, workflowId, stepId } = useRoute().params;
</script>

<template>
  <div>Edit Step</div>
  <div>Project ID: {{ projectId }}</div>
  <div>Workflow ID: {{ workflowId }}</div>
  <div>Step ID: {{ stepId }}</div>
</template>
