<script setup lang="ts">
  /**
   * Project Documents Index - List all documents of this project
   * Route: /projects/${projectId}/documents
   */

  definePageMeta({
    title: 'document.meta.index.title',
    breadcrumb: {
      icon: 'folders',
      ariaLabel: 'Documents',
      label: 'Documents',
    },
    validate: async (route) => {
      const validator = useRouteValidation();
      return validator.hasValidProjectId(route.params);
    },
  });

  const { projectId } = useRoute().params;

  const { getAllDocuments } = useManageDocuments();
  const { data } = await getAllDocuments(projectId);
</script>

<template>
  <pre>
  {{ data }}
</pre
  >
  <div>Document Index</div>
</template>
