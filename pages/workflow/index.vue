<script setup lang="ts">
  definePageMeta({
    title: 'workflows.meta.index.title',
    breadcrumb: {
      icon: 'files',
      ariaLabel: 'Workflows',
      label: 'Workflows',
    },
  });

  const { getAllWorkflowsForUser } = useManageWorkflows();
  const { data: all } = await getAllWorkflowsForUser();
</script>

<template>
  <div>
    {{ all }}
  </div>
</template>
