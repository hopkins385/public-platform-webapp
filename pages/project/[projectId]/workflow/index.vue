<script setup lang="ts">
  definePageMeta({
    title: 'workflow.meta.index.title',
    breadcrumb: {
      icon: 'folders',
      ariaLabel: 'Workflows',
      label: 'Workflows',
    },
    validate: async (route) => {
      const validator = useRouteValidation();
      return validator.hasValidProjectId(route.params);
    },
  });

  const { projectId } = useRoute().params;

  navigateTo(`/project/${projectId}`);
</script>

<template>
  <div></div>
</template>
