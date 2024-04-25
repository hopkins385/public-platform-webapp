<script setup lang="ts">
  const route = useRoute();
  const id = route.params.workflowId;
</script>

<template>
  <div>New/Add Step {{ id }}</div>
</template>
