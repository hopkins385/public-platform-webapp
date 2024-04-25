<script setup lang="ts">
  const projectId = '01hwa7a5mzya8fq1qt7wsa72jn';
  const { getAllWorkflows } = useManageWorkflows();
  const { data: allWorkflows } = await getAllWorkflows(projectId);
</script>

<template>
  {{ allWorkflows }}
  <div>
    <WorkflowList />
  </div>
</template>
