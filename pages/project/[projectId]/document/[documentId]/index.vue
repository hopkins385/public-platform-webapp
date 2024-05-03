<script setup lang="ts">
  /**
   * Document Index - Show document
   * Route: /project/${projectId}/document/${documentId}
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
      return validator.hasValidProjectDocumentId(route.params);
    },
  });

  const { documentId } = useRoute().params;
  const { parseDocument } = useManageDocuments();
  const { data } = await parseDocument(documentId);
</script>

<template>
  <pre>
  {{ data }}
</pre
  >
  <div>Document Index</div>
</template>
