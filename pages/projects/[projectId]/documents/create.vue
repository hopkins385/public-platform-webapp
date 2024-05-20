<script setup lang="ts">
  /**
   * Project Documents Create - Create a new document for this project
   * Route: /projects/${projectId}/documents/create
   */

  definePageMeta({
    title: 'document.meta.create.title',
    breadcrumb: {
      icon: 'folders',
      ariaLabel: 'Create Document',
      label: 'Create Document',
    },
    validate: async (route) => {
      const validator = useRouteValidation();
      return validator.hasValidProjectId(route.params);
    },
  });

  const { projectId } = useRoute().params;

  const { createDocument } = useManageDocuments();

  async function onNewDocument() {
    return await createDocument({
      projectId: projectId as string,
      name: 'Untitled Document',
      description: '',
      status: 'draft',
    });
  }

  onMounted(() => {
    onNewDocument()
      .then((doc) => {
        navigateTo(`/projects/${projectId}/documents/${doc.id}/edit`);
      })
      .catch((error) => {
        console.error(error);
      });
  });
</script>

<template>
  <div></div>
</template>
