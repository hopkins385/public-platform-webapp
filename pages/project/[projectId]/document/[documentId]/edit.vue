<script setup lang="ts">
  /**
   * Document Edit - Edit document
   * Route: /project/${projectId}/document/${documentId}/edit
   */

  definePageMeta({
    title: 'document.meta.edit.title',
    breadcrumb: {
      icon: 'folders',
      ariaLabel: 'Edit Document',
      label: 'Edit Document',
    },
    validate: async (route) => {
      const validator = useRouteValidation();
      return validator.hasValidProjectDocumentId(route.params);
    },
  });

  const { projectId, documentId } = useRoute().params;
  const { getDocument } = useManageDocuments();
  const { data: document } = await getDocument(projectId, documentId);

  const input = ref<string>(document.value?.documentItems[0]?.content || '');
  const documentName = ref<string>(document.value?.name || '');
  const documentDescription = ref<string>(document.value?.description || '');
</script>

<template>
  <SectionContainer>
    <SectionHeadingEditable
      v-model:title="documentName"
      v-model:description="documentDescription"
    >
      <template #button>
        <Button
          variant="outline"
          @click="saveDocument"
          aria-label="Save Document"
        >
          Save
        </Button>
      </template>
    </SectionHeadingEditable>
    <!-- BoxContainer class="p-5">
      <Input v-model="documentName" label="Document Name" />
    </!-->
    <div class="flex flex-col items-center justify-center space-y-8 rounded-lg">
      <div class="w-full">
        <EditorBox v-model="input" />
      </div>
    </div>
  </SectionContainer>
</template>
