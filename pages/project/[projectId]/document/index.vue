<script setup lang="ts">
  /**
   * Project Documents Index - List all documents of this project
   * Route: /project/${projectId}/document
   */

  definePageMeta({
    title: 'document.meta.index.title',
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
