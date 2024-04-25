<script setup lang="ts">
  const route = useRoute();
  const wid = route.params.workflowId;
  const sid = route.params.stepId;
</script>

<template>
  <div>Edit Step</div>
  <div>Workflow ID: {{ wid }}</div>
  <div>Step ID: {{ sid }}</div>
</template>
